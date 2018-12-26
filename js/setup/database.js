/*! *******************************************************
 *
 * evolutility-server-node :: utils/database.js
 * Methods to create new database from models.
 *
 * https://github.com/evoluteur/evolutility-server-node
 * (c) 2018 Olivier Giulieri
 ********************************************************* */

var pg = require('pg'),
    path = require('path'),
    fs = require('fs'),
    parseConnection = require('pg-connection-string').parse;
    _ = require('underscore'),
    { version, homepage } = require('../../package.json'),
    dico = require('../utils/dico');

var models = require('../../models/all_models.js');
var data = require('../../models/data/all_modelsdata.js');

// - options; mostly from in config.js
var config = require(path.join(__dirname, '../', '../', 'config')),
    schema = '"'+config.schema+'"',
    //dbuser = 'evol',
    dbuser = 'postgres', // DB user
    sqlFile = true;     // log SQL to file

var ft_postgreSQL = {
    text: 'text',
    textmultiline: 'text',
    boolean: 'boolean',
    integer: 'integer',
    decimal: 'double precision',
    money: 'money',
    date: 'date',
    datetime: 'timestamp without time zone',
    time: 'time without time zone',
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



function m2db(mid){
    // -- generates SQL script to create a Postgres DB table for the ui model
    var m = dico.prepModel(models[mid]),
        tableName = m.table || m.id,
        tableNameSchema = schema+'."'+tableName+'"',
        fieldsAttr = {},
        fields = m.fields,
        fieldsH = m.fieldsH,
        subCollecs = m.collections,
        fs = ['id serial primary key'],
        sql, sql0, sqlIdx='',
        sqlData = '';

    // fields
    fields.forEach(function(f, idx){
        if(f.column && f.column!='id' && f.type!=='formula' && !fieldsAttr[f.column]){
            fieldsAttr[f.column]=true;
            // skip fields specified in config
            if(['c_date','u_date','c_uid','u_uid','nb_comments','nb_ratings','avg_ratings'].indexOf(f.column)<0){
                sql0=' "'+f.column+'" '+(ft_postgreSQL[f.type]||'text');
                if(f.type==='lov'){
                        sqlIdx += 'CREATE INDEX idx_'+tableName+'_'+f.column.toLowerCase()+
                            ' ON '+schema+'."'+tableName+'" USING btree ("'+f.column+'");\n';
                }
                if(f.required && f.type!='lov'){
                    sql0+=' not null';
                }
                fs.push(sql0);
            }
        }
    });
    // - "who-is" columns to track creation and last modification.
    if(config.wTimestamp){
        fs.push('c_date timestamp without time zone DEFAULT timezone(\'utc\'::text, now())');
        fs.push('u_date timestamp without time zone DEFAULT timezone(\'utc\'::text, now())');
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

    // subCollecs - as json columns
    if(subCollecs){
        subCollecs.forEach(function(c, idx){
            fs.push(' "'+(c.column || c.id)+'" json');
        });
    }

    function stringValue(v){
        if(v){
            return "'"+v.replace(/'/g, "''")+"'";
        }
        return 'NULL';
    }

    sql = 'CREATE TABLE '+tableNameSchema+'(\n' + fs.join(',\n') + ');\n';
    sql += sqlIdx;

    // - track updates
    if(config.wTimestamp){
        sql+='\nCREATE TRIGGER tr_u_'+tableName+' BEFORE UPDATE ON '+schema+'.'+tableName+
                ' FOR EACH ROW EXECUTE PROCEDURE '+schema+'.u_date();\n';
    }

    // -- insert sample data
    if(data[mid]){
        data[mid].forEach(function(row, idx){
            sqlData+='INSERT INTO '+tableNameSchema;
            var ns=[], vs=[];
            var f, v;
            for(var fid in row){
                f = fieldsH[fid];
                if(f && fid!=='id'){
                    v = row[fid];
                    ns.push('"'+(f.column || f.id)+'"');
                    if(f.type==='lov'){
                        //TODO: parseint?
                        v=v||'null'//"['error']";
                    }else if(f.type==='json'){
                        v = "'"+ JSON.stringify(v) +"'";
                    }else if(_.isArray(v)){
                        // TODO: 
                        //v='null';
                        //v = '['+v.map(stringValue).join(',')+']';
                        v='null'//"['error']";
                    }else if(_.isObject(v)){
                        v = "'"+ JSON.stringify(v) +"'";
                    }else if(v===null){
                        v = 'null';
                    }else if(_.isString(v)){
                    //}else if(v && (typeof v)==='string'){
                        v = stringValue(v);
                    }
                    vs.push(v);
                    fn = f.column || f.id;
                }
            }
            sqlData+='('+ns.join(',')+') values('+vs.join(',')+');\n\n';
        });
    }

    // - add lov tables
    function lovTable(f){
        return schema+'."'+(f.lovtable ? f.lovtable : (tableName+'_'+f.id))+'"';
    }

    var lovFields=fields.filter(function(f){
        return (f.type==='lov' || f.type==='list') && !f.entity
    })
    var lovIncluded=[]
    if(lovFields){
        lovFields.forEach(function(f, idx){
            var t = lovTable(f);
            var icons = f.lovicon || false;
            if(lovIncluded.indexOf(t)<0){
                // - create lov table
                // TODO: iconfont
                sql += 'CREATE TABLE IF NOT EXISTS '+t+
                        '(id serial NOT NULL, '+
                        'name text NOT NULL,'+
                        (icons?'icon text,':'')+
                        ' CONSTRAINT '+(tableName+'_'+f.id).toLowerCase()+'_pkey PRIMARY KEY (id));\n\n';
                
                // - populate lov table
                const insertSQL = 'INSERT INTO '+t+'(id, name'+(icons ? ', icon':'')+') VALUES ';
                if(f.list){
                    sql += insertSQL;
                    sql += f.list.map(function(item){
                        return '(' + item.id + ',' + stringValue(item.text) + 
                            (icons ? ',\'' + (item.icon || '')+ '\'' : '') + ')'
                    }).join(',\n')+';\n\n';
                }
                lovIncluded.push(t)
            }
        })
    }

    return [sql, sqlData];
}

var sql = 'CREATE SCHEMA '+schema+' AUTHORIZATION '+dbuser+';\n\n';
var sqlData = ''
if(config.wTimestamp){
    sql+='CREATE OR REPLACE FUNCTION '+schema+'.u_date() RETURNS trigger\n'+
        '    LANGUAGE plpgsql\n'+
        '    AS $$\n'+
        '  BEGIN\n    NEW.u_date = now();\n    RETURN NEW;\n  END;\n$$;\n\n';
}

for(var mid in models){
    var sqls = m2db(mid);
    sql += sqls[0]
    sqlData += sqls[1]
}

console.log(sql);

if(sqlFile){
    const d = new Date()
    const fId = d.toISOString().replace(/:/g,'')
    let header = `-- Evolutility v${version}
-- SQL Script to create Evolutility database on PostgreSQL.
-- ${homepage}
-- ${d}\n\n`;

    fs.writeFile('evol-db-schema-'+fId+'.sql', header + sql, function(err){
        if (err){
            throw err;
        }
    })

    header = header.replace('create', 'populate');
    fs.writeFile('evol-db-data-'+fId+'.sql', header + sqlData, function(err){
        if (err){
            throw err;
        }
    })  
}

var dbConfig = parseConnection(config.connectionString)
dbConfig.max = 10; // max number of clients in the pool 
dbConfig.idleTimeoutMillis = 30000; // max client idle time before being closed
var pool = new pg.Pool(dbConfig);
pool.connect(function(err, client, done) {
    console.log(sql);
    client.query(sql, function(err, data) {
        if(err){ 
            done();
            throw err;
        }
        client.query(sqlData, function(err, data) {
            done();
            if(err){
                throw err;
            }
            console.log(sqlData);
        })
    })
});
