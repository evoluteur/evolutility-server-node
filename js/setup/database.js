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
    _ = require('underscore'),
    dico = require('../utils/dico');

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

var config = require(path.join(__dirname, '../', '../', 'config')),
    schema = '"'+config.schema+'"';

//var dbuser = 'evol';
var dbuser = 'postgres';

var models = require('../../models/all_models.js');
var data = require('../../models/data/all_modelsdata.js');

var client = new pg.Client(config.connectionString);
client.connect();


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
        sql, sql0, sqlIdx='';

    // fields
    fields.forEach(function(f, idx){
        if(f.column && f.column!='id' && f.type!=='formula' && !fieldsAttr[f.column]){
            fieldsAttr[f.column]=true;
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
    });
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

    // -- insert sample data
    if(data[mid]){
        data[mid].forEach(function(row, idx){
            sql+='INSERT INTO '+tableNameSchema;
            var ns=[], vs=[];
            var fn, f, v, 
                sqlIdx = '';
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
            sql+='('+ns.join(',')+') values('+vs.join(',')+');\n\n';
        });
    }

    // - add lov tables
    function lovTable(f){
        return schema+'."'+(f.lovtable ? f.lovtable : (tableName+'_'+f.id))+'"';
    }

    var lovFields=fields.filter(function(f){
        return f.type==='lov' || f.type==='list'
    })
    if(lovFields){
        lovFields.forEach(function(f, idx){
            var t = lovTable(f);
            // - create lov table
            // TODO: iconfont
            sql += 'CREATE TABLE IF NOT EXISTS '+t+
                    '(id serial NOT NULL, '+
                    'name text NOT NULL,'+
                    'icon text,'+
                    ' CONSTRAINT '+(tableName+'_'+f.id).toLowerCase()+'_pkey PRIMARY KEY (id));\n\n';
            // populate lov table
            if(f.list){
                sql += 'INSERT INTO '+t+'(id, name, icon) VALUES ';
                sql += f.list.map(function(item){
                    return '(' + item.id + ',' + stringValue(item.text) + 
                        ',\'' + (item.icon||'') + '\')'
                }).join(',\n')+';\n\n';
            }
        })
    }

    return sql;
}

var sql='CREATE SCHEMA '+schema+' AUTHORIZATION '+dbuser+';\n';
for(var mid in models){
    sql+=m2db(mid);
}

console.log(sql);
var query = client.query(sql);
query.on('end', function() { client.end(); });
