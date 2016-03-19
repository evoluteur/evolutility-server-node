/*! *******************************************************
 *
 * evolutility-server :: database.js
 * Methods to build Postgres DB from ui-models.
 *
 * https://github.com/evoluteur/evolutility-server
 * Copyright (c) 2016 Olivier Giulieri
 ********************************************************* */

var pg = require('pg');
var path = require('path');
var _ = require('underscore');
var def = require('./def');

var config = require(path.join(__dirname, '../', '../', 'config'));

//var dbuser = 'evol';
var dbuser = 'postgres';

var uims = {
    'todo': require('../../client/public/ui-models/todo.js'),
    'contact': require('../../client/public/ui-models/contacts.js'),
    'winecellar': require('../../client/public/ui-models/winecellar.js'),
    'comics': require('../../client/public/ui-models/comics.js'),
    //'test': require('../../client/public/ui-models/test.js'),
};
var uims_data = {
    'todo': require('../../client/public/ui-models/todo.data.js'),
    'contact': require('../../client/public/ui-models/contacts.data.js'),
    'winecellar': require('../../client/public/ui-models/winecellar.data.js'),
    'comics': require('../../client/public/ui-models/comics.data.js')
};


var client = new pg.Client(config.connectionString);
client.connect();


function uim2db(uimid){
    // -- generates SQL script to create a Postgres DB table for the ui model
    var uiModel = uims[uimid],
        t = (config.schema ? config.schema+'.' : '') +(uiModel.table || uiModel.id),
        fieldsAttr={},
        fields=def.getFields(uiModel),
        fieldsH=def.hById(fields),
        subCollecs=def.getSubCollecs(uiModel),
        fs=['id serial primary key'],
        sql0,
        sql;

    // fields
    _.forEach(fields, function(f, idx){
        if(f.attribute && f.attribute!='id' && f.type!=='formula' && !fieldsAttr[f.attribute]){
            fieldsAttr[f.attribute]=true;
            sql0=' "'+f.attribute+'" ';
            switch(f.type){
                case 'boolean':
                case 'integer':
                case 'json':
                case 'money':
                    sql0+=f.type;
                    break;
                case 'decimal': 
                    sql0+='double precision';
                    break;
                case 'date':
                case 'datetime':
                    sql0+='date';
                    break;
                case 'time': 
                    sql0+='time with time zone';
                    break;
                case 'list': 
                    sql0+='text[]';
                    break;
                default:
                    sql0+='text';
            }
            if(f.required){
                sql0+=' not null';
            }
            fs.push(sql0);
        }
    });
    // subCollecs - as json columns
    _.forEach(subCollecs, function(c, idx){
        fs.push(' "'+(c.attribute || c.id)+'" json');
    });

    function stringValue(v){
        if(v){
            return "'"+v.replace(/'/g, "''")+"'";
        }
        return 'NULL';
    }

    sql = 'CREATE TABLE '+t+'(\n' + fs.join(',\n') + ');\n';

    // -- insert sample data
    _.each(uims_data[uimid], function(row){
        sql+='INSERT INTO '+t;
        var ns=[], vs=[];
        var f, v;
        for(var fid in row){
            f = fieldsH[fid];
            if(f && fid!=='id'){
                v = row[fid];
                ns.push('"'+fid+'"');
                if(_.isArray(v)){
                    // TODO: 
                    //v='null';
                    //v = '['+v.map(stringValue).join(',')+']';
                    v="['a','b']"
                }else if(_.isObject(v)){
                    v = "'"+ JSON.stringify(v) +"'";
                }else if(v===null){
                    v = 'null';
                }else if(_.isString(v)){
                    v = stringValue(v);
                }
                vs.push(v);
            }
        }
        sql+='('+ns.join(',')+') values('+vs.join(',')+');\n';
    });
    console.log(sql);

    return sql;
}

var sql='';
if(config.schema){
    sql='CREATE SCHEMA '+config.schema+' AUTHORIZATION '+dbuser+';\n';
}
for(var uimid in uims){
    sql+=uim2db(uimid);
}
console.log(sql);
var query = client.query(sql);
query.on('end', function() { client.end(); });
