/*! *******************************************************
 *
 * evolutility-server-node :: utils/database.js
 * Methods to create postgres schema and tables from models.
 *
 * https://github.com/evoluteur/evolutility-server-node
 * (c) 2019 Olivier Giulieri
 ********************************************************* */

const pg = require('pg'),
    path = require('path'),
    fs = require('fs'),
    parseConnection = require('pg-connection-string').parse,
    { version, homepage } = require('../../package.json'),
    { prepModel, fieldTypes} = require('../utils/dico');

const ft = fieldTypes;
const models = require('../../models/all_models.js');
const data = require('../../models/data/all_data.js');

// - options; mostly from in config.js
const config = require(path.join(__dirname, '../', '../', 'config')),
    schema = '"'+config.schema+'"',
    //dbuser = 'evol',
    dbuser = 'postgres', // DB user
    sqlFile = true;     // log SQL to file

const noTZ = ' without time zone'
const ft_postgreSQL = {
    text: 'text',
    textmultiline: 'text',
    boolean: 'boolean',
    integer: 'integer',
    decimal: 'double precision',
    money: 'money',
    date: 'date',
    datetime: 'timestamp'+noTZ,
    time: 'time'+noTZ,
    lov: 'integer',
    list: 'text[]', // many values for one field (behave like tags - return an array of strings)
    html: 'text',
    email: 'text',
    pix: 'text',
    //geoloc: 'geolocation',
    doc:'text',
    url: 'text',
    color: 'text',
    json: 'json'
};

const sysColumns = {
    'c_date': true,
    'u_date': true,
    'c_uid': true,
    'u_uid': true,
    'nb_comments': true,
    'nb_ratings': true,
    'avg_ratings': true,
}

const stringValue = v => v ? ("'"+v.replace(/'/g, "''")+"'") : 'NULL'

const lovTable = f => schema+'."'+(f.lovtable ? f.lovtable : (tableName+'_'+f.id))+'"';

function sqlInsert(tableNameSchema, m, data){
    const { pkey, fieldsH } = m
    let sqlData = ''
    // -- insert sample data
    if(data){
        let prevCols = ''
        data.forEach(function(row){
            var ns=[], vs=[];
            if(row[pkey]){
                ns.push(pkey)
                vs.push(row[pkey])
            }
            for(let fid in row){
                const f = fieldsH[fid];
                if(f && fid!==pkey){
                    let v = row[fid];
                    if(v!==null){
                        ns.push('"'+(f.column || f.id)+'"');
                        if(f.type===ft.lov){
                            //TODO: parseint?
                            v = v || null //"['error']";
                        }else if(f.type===ft.json){
                            v = "'"+ JSON.stringify(v) +"'";
                        }else if(Array.isArray(v)){
                            // TODO: 
                            //v='null';
                            //v = '['+v.map(stringValue).join(',')+']';
                            v = null //"['error']";
                        }else if(typeof(v)==='object'){
                            if(v){
                                v = "'"+ JSON.stringify(v) +"'";
                            }else{
                                v = null
                            }
                        }else if(typeof(v)==='string'){
                        //}else if(v && (typeof v)==='string'){
                            v = stringValue(v);
                        }
                        vs.push(v);
                    }
                }
            }
            const curCols = ns.join(',')
            if(curCols === prevCols){
                sqlData += ',' 
            }else{
                sqlData += (prevCols ? ';\n' : '\n') +
                    'INSERT INTO ' + tableNameSchema + 
                    '(' + curCols + ') values'
                prevCols = curCols
            }
            sqlData += '\n(' + vs.join(',') + ')'
        });
        sqlData += ';\n'
    }
    return sqlData
}

function sqlCreatePopulateLOV(f, tableName, lovIncluded){
    const t = lovTable(f);
    const icons = f.lovicon || false;
    let sql = ''

    if(lovIncluded.indexOf(t)<0){
        // - create lov table
        // TODO: iconfont
        sql = 'CREATE TABLE IF NOT EXISTS '+t+
                '(id serial NOT NULL, '+
                'name text NOT NULL,'+
                (icons?'icon text,':'')+
                ' CONSTRAINT '+(tableName+'_'+f.id).toLowerCase()+'_pkey PRIMARY KEY (id));\n\n';
        
        // - populate lov table
        const insertSQL = 'INSERT INTO '+t+'(id, name'+(icons ? ', icon':'')+') VALUES ';
        if(f.list){
            sql += insertSQL;
            sql += f.list.map(icons ? 
                (item) => '(' + item.id + ',' + stringValue(item.text) + ',\'' + (item.icon || '') + '\')'
                 : 
                (item) => '(' + item.id + ',' + stringValue(item.text)+ ')'
            ).join(',\n')+';\n\n';
        }
        lovIncluded.push(t)
    }
    return sql
}

function sqlSchemaWithData(){
    let sql = 'CREATE SCHEMA '+schema+' AUTHORIZATION '+dbuser+';\n\n';
    let sqlData = ''
    if(config.wTimestamp){
        sql += 'CREATE OR REPLACE FUNCTION '+schema+'.u_date() RETURNS trigger\n'+
            '    LANGUAGE plpgsql\n'+
            '    AS $$\n'+
            '  BEGIN\n    NEW.u_date = now();\n    RETURN NEW;\n  END;\n$$;\n\n';
    }
    for(let mid in models){
        const sqls = model2SQL(mid);
        sql += sqls[0]
        sqlData += sqls[1]
    }
    return {
        sql: sql,
        sqlData: sqlData,
    }
}

const sqlComment = (target, targetName, targetId) => 'COMMENT ON '+target+' '+targetName+' IS \''+targetId.replace(/'/g,'')+'\';\n'

function model2SQL(mid){
    // -- generates SQL script to create a Postgres DB table for the ui model
    const m = prepModel(models[mid]);
    let { pkey, fields } = m
    let tableName = m.table || m.id,
        tableNameSchema = schema+'."'+tableName+'"',
        fieldsAttr = {},
        //subCollecs = m.collections,
        fs = [pkey+' serial primary key'],
        sql, sql0, 
        sqlIdx='',
        sqlData = '',
        sqlComments = '';

    // fields
    fields.forEach(function(f){
        if(f.column && f.column!==pkey && f.type!=='formula' && !fieldsAttr[f.column]){
            fieldsAttr[f.column] = true;
            // skip fields specified in config
            if(!sysColumns[f.column]){
                const fcolumn = '"'+f.column+'"'
                sql0 = ' '+fcolumn+' '+(ft_postgreSQL[f.type]||'text');
                if(f.type===ft.lov){
                        if(f.deletetrigger){
                            sql0 += ' NOT NULL REFERENCES '+schema+'."'+f.lovtable+'"(id) ON DELETE CASCADE'
                        }
                        sqlIdx += 'CREATE INDEX idx_'+tableName+'_'+f.column.toLowerCase()+
                            ' ON '+tableNameSchema+' USING btree ('+fcolumn+');\n';
                }else if(f.required){
                    sql0 += ' not null';
                }
                fs.push(sql0);
                if(f.label){
                    sqlComments += sqlComment('COLUMN', tableNameSchema+'.'+fcolumn, f.label)
                }
            }
        }
    });

    // - "who-is" columns to track creation and last modification.
    if(config.wTimestamp){
        fs.push('c_date timestamp'+noTZ+' DEFAULT timezone(\'utc\'::text, now())');
        fs.push('u_date timestamp'+noTZ+' DEFAULT timezone(\'utc\'::text, now())');
    }
    // - "who-is" columns to track user who created and last modified the record.
    if(config.wWhoIs){
        fs.push('c_uid integer');
        fs.push('u_uid integer');   
    }

    // - tracking number of comments.
    if(config.wComments){
        fs.push('nb_comments integer DEFAULT 0');
    }

    // - tracking ratings.
    if(config.wRating){
        fs.push('nb_ratings integer DEFAULT 0');
        fs.push('avg_ratings integer DEFAULT NULL'); // smallint ?
    }
/*
    // subCollecs - as json columns
    if(subCollecs){
        subCollecs.forEach(function(c, idx){
            fs.push(' "'+(c.column || c.id)+'" json');
        });
    }
*/
    sql = 'CREATE TABLE '+tableNameSchema+'(\n' + fs.join(',\n') + ');\n';
    sql += sqlIdx;

    // - track updates
    if(config.wTimestamp){
        sql += '\nCREATE TRIGGER tr_u_'+tableName+' BEFORE UPDATE ON '+schema+'.'+tableName+
                ' FOR EACH ROW EXECUTE PROCEDURE '+schema+'.u_date();\n';
    }

    // Comments on table and columns with description
    sql += sqlComment('TABLE', tableNameSchema, m.title || m.label || m.table)
    sql += sqlComments

    // -- insert sample data
    if(data[mid]){
        sqlData += sqlInsert(tableNameSchema, m, data[mid])
    }

    // - add lov tables
    var lovFields=fields.filter(function(f){
        return (f.type===ft.lov || f.type===ft.list) && !f.object
    })
    var lovIncluded=[]
    if(lovFields){
        lovFields.forEach(f => {sql += sqlCreatePopulateLOV(f, tableName, lovIncluded)})
    }

    return [sql, sqlData];
}

function logToFile(sql, isData){
    if(sqlFile){
        const d = new Date(),
            fId = d.toISOString().replace(/:/g,''),
            action = isData ? 'populate' : 'create' 
        const fileName = 'evol-db-'+(isData ? 'data':'schema')+'-'+fId+'.sql'
        const header = 
`-- Evolutility v${version}
-- SQL Script to ${action} Evolutility demo DB on PostgreSQL.
-- ${homepage}
-- ${d}\n\n`

        fs.writeFile(fileName, header + sql, function(err){
            if (err){
                throw err;
            }
        })
    }    
}

function createSchema(){
    let { sql, sqlData } = sqlSchemaWithData()
    const dbConfig = parseConnection(config.connectionString)
    dbConfig.max = 10; // max number of clients in the pool 
    dbConfig.idleTimeoutMillis = 30000; // max client idle time before being closed
    const pool = new pg.Pool(dbConfig);
    
    pool.connect(function(err, client, done) {
        // - Create schema and tables
        console.log(sql);
        logToFile(sql, false)
        client.query(sql, function(err, data) {
            if(err){ 
                done();
                throw err;
            }
            // - Populate tables
            console.log(sqlData);
            logToFile(sqlData, true)
            client.query(sqlData, function(err, data) {
                done();
                if(err){
                    throw err;
                }
            })
        })
    })    
}

createSchema()
