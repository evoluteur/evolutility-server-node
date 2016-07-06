/*! *******************************************************
 *
 * evolutility-server :: utils/orm.js
 *
 * https://github.com/evoluteur/evolutility-server
 * Copyright (c) 2016 Olivier Giulieri
 ********************************************************* */

var pg = require('pg');
var _ = require('underscore');
var dico = require('./dico');
var logger = require('./logger');

var config = require('../../config.js');

var apiPath = config.apiPath;

var models=require('../../models/all_models'),
    uim=null,
    tableName=null;

var fields,
    fieldsH,
    fCache = {};

function loadUIModel(uimId){
    uim = models[uimId];
    tableName=(config.schema?'"'+config.schema+'".':'')+'"'+(uim.table || uim.id)+'"';
    if(!fCache[uimId]){
        fCache[uimId] = dico.getFields(uim);
    }
    fields = fCache[uimId];
    fieldsH = dico.hById(fields);
    collecs = dico.getSubCollecs(uim);
}

function getModel(){

    uim = models[uimId];
    tableName=(config.schema?'"'+config.schema+'".':'')+'"'+(uim.table || uim.id)+'"';
    if(!fCache[uimId]){
        fCache[uimId] = dico.getFields(uim);
    }

    fields = fCache[uimId];
    fieldsH = dico.hById(fields);
    collecs = dico.getSubCollecs(uim);
}

function makeSQL(select, tables, where, group, order){
    var sql = 'SELECT '+select+
        ' FROM '+tables;
    if(where.length){
        sql+=' WHERE '+where.join(' AND ');
    }
    sql+=group ? ' GROUP BY '+group : '';
    sql+=order ? ' ORDER BY '+order : '';
    return sql;
}

function runQuery(res, sql, values, singleRecord){
    var results = [];

    // Get a Postgres client from the connection pool 
    pg.connect(config.connectionString, function(err, client, done) {

        // SQL Query > Select Data
        logger.logSQL(sql);
        var query = values ? client.query(sql, values) :  client.query(sql);

        // Stream results back one row at a time
        query.on('row', function(row) {
            results.push(row);
        });

        // After all data is returned, close connection and return results
        query.on('end', function() {
            client.end();
            //done();
            return res.json(singleRecord ? results[0] : results);
        });

        // Handle Errors
        if(err) {
            res.status(500).send('Something broke!');
            logger.logError(err);
        }

    });

}

function sqlSelect(fields, collecs, table){
    var sql;
    var tQuote = table ? 't1."' : '"';
    var sqlfs=_.map(fields, function(f){
        sql = tQuote+f.attribute
        if(f.type==='money'){
            sql += '"::numeric'
        }else{
            sql += '"'
        }
        if(f.attribute && f.id!=f.attribute){
            sql += ' AS "'+f.id+'"'
        }
        return sql;
    });/*
    if(collecs){
        sqlfs=sqlfs.concat(_.map(collecs, function(c){
            return tQuote+(c.attribute||c.id)+'"';
        }));
    }*/
    return sqlfs.join(',');
}


// --------------------------------------------------------------------------------------
// -----------------    GET MANY   ------------------------------------------------------
// --------------------------------------------------------------------------------------

function sqlFieldOrder(f){
    var fs=dico.getFields(uim,true);
    var idx=f.indexOf('.');
    if(idx>-1){
        var ff=f.substring(0, idx),
            fDirection=f.substring(idx+1)==='desc'?' DESC':' ASC';
        return 't1."'+fs[ff].attribute + '"'+fDirection;
    }else{
        return 't1."'+(fs[f]?(fs[f].attribute||fs[f].id)||'id':'id') + '" ASC';
    }
}
function sqlLOVs(fields){
    var sql={
        select: '',
        from: ''
    }
    // add extra attribute (column+"_txt") for value of lov fields
    fields.forEach(function(f, idx){
        if(f.type==='lov' && f.lovtable){
            var tlov='t'+(idx+2)
            sql.from += ' LEFT JOIN evol_demo.'+f.lovtable+' AS '+tlov+
                        ' ON t1.'+f.attribute+'='+tlov+'.id'
            sql.select += ', '+tlov+'.value AS "'+f.id+'_txt"'
        }
    })
    return sql;
}

function sqlMany(fields, req){

    var uimid = req.params.entity;
    var sqlParams=[];
    loadUIModel(uimid);
    logger.logReq('GET MANY', req);
    var fs=fields.filter(dico.isFieldMany)

    // ---- SELECTION
    var sqlSel = 't1.id, '+sqlSelect(fs, false);
    var sqlFrom = tableName + ' AS t1';

    // ---- LISTS OF VALUES
    var lovs = sqlLOVs(fs)
    sqlSel += lovs.select
    sqlFrom += lovs.from

    // ---- FILTERING
    var sqlOperators = {
        'eq': '=',
        'ne': '<>',
        'gt': '>',
        'lt': '<',
        'gte': '>=',
        'lte': '<=',
        'ct': ' ILIKE ',
        'sw': ' ILIKE ',
        'fw': ' ILIKE ',
        'in': ' IN ',
        '0': '=',
        '1': '=',
        'null': ' IS ',
        'nn': ' IS '
    };
    var sqlW=[];
    var ffs=_.forEach(req.query, function(c, n){
        var f = (n==='id') ? {attribute:'id'} : fieldsH[n];
        if(f && ['select', 'filter', 'search', 'order', 'page', 'pageSize'].indexOf(f)<0){
            var cs=c.split('.');
            if(cs.length){
                var cond=cs[0];
                if((cond==='eq' || cond==='ne') && dico.fieldIsText(f)){
                    sqlParams.push(cs[1]);
                    if(f.type==='text' || f.type==='textmultiline' || f.type==='html'){
                        sqlW.push('LOWER(t1."'+f.attribute+'")'+sqlOperators[cond]+'LOWER($'+sqlParams.length+')');
                    }else{
                        sqlW.push('t1."'+f.attribute+'"'+sqlOperators[cond]+'$'+sqlParams.length);
                    }
                }else{
                    var w='t1."'+f.attribute+'"'+sqlOperators[cond];
                    if(cond==='in' && (f.type==='lov' || f.type==='list')){
                        sqlW.push(w+'('+cs[1].split(',').map(function(li){
                            return "'"+li.replace(/'/g, "''")+"'";
                        }).join(',')+')'); 
                    }else if(cond==='0'){ // false
                        sqlW.push(w+'false');
                    }else if(cond==='1'){ // true
                        sqlW.push(w+'true');
                    }else if(cond==='null'){ // empty
                        sqlW.push(w+'NULL');
                    }else if(cond==='nn'){ // not empty
                        sqlW.push(' NOT '+w+'NULL');
                    }else{
                        if(cond==='nct'){ // not contains
                            //TODO replace % in cs[1]
                            sqlParams.push('%'+cs[1]+'%');
                            sqlW.push(' NOT '+w+'$'+sqlParams.length);
                        }else{
                            if(cond==='sw'){ // start with
                                sqlParams.push(cs[1]+'%');
                            }else if(cond==='fw'){ // finishes with
                                sqlParams.push('%'+cs[1]);
                            }else if(cond==='ct'){ // contains
                                sqlParams.push('%'+cs[1]+'%');
                            }else{
                                sqlParams.push(cs[1]);
                            }
                            sqlW.push(w+'$'+sqlParams.length);
                        }
                    }
                }
            }
        }
    });

    // ---- SEARCHING
    if(req.query.search){
        var paramSearch=false;
        var sqlWS=[];
        if(uim.fnSearch && _.isArray(uim.fnSearch)){
            logger.logObject('search fields', uim.fnSearch);
            var sqlP='"'+sqlOperators.ct+'($'+(sqlParams.length+1)+')';
            _.forEach(uim.fnSearch, function(m){
                sqlWS.push('t1."'+fieldsH[m].attribute+sqlP);
            });
            sqlParams.push('%'+req.query.search+'%');
            sqlW.push('('+sqlWS.join(' OR ')+')');
        }
    }

    // ---- ORDERING
    sqlOrder='';
    var qOrder=req.query?req.query.order:null;
    if(qOrder){
        if(qOrder.indexOf(',')>-1){
            var fl=qOrder.split(',');
            sqlOrder+=_.map(fl, sqlFieldOrder).join(',');
        }else{
            sqlOrder+=sqlFieldOrder(qOrder);
        }
    }else{
        sqlOrder = 't1.id DESC';
    }

    // ---- LIMITING & PAGINATION
    var sqlLimit='',
        qPage=req.query.page||0, 
        qPageSize=req.query.pageSize>0 ? req.query.pageSize : 50;
    if(qPage){
        sqlLimit=' LIMIT '+qPageSize+
            ' OFFSET '+(qPage*qPageSize);
    }else{
        sqlLimit=' LIMIT '+qPageSize;
    }

    return {
        select: sqlSel,
        from: sqlFrom,
        where: sqlW, //array
        group: '',
        order: sqlOrder,
        limits: sqlLimit,
        params: sqlParams
    }
}

function getMany(req, res) {
    var uimid = req.params.entity; 
    loadUIModel(uimid);
    logger.logReq('GET MANY', req);

    var sq=sqlMany(fields, req)
    var sql= makeSQL(sq.select, sq.from, sq.where, null, sq.order)

    runQuery(res, sql, sq.params, false);
}

function chartMany(req, res) {
    var uimid = req.params.entity;
    var data=[];
    loadUIModel(uimid);
    logger.logReq('GET CHART', req);

    var e = req.params.entity
    var fid=req.params.field

    var f=fieldsH[fid]

    if(f.type==='lov' && f.lovtable){
        sql='SELECT t2.value::text AS label, count(*)::integer '+
            ' FROM evol_demo.'+e+' AS t1'+
            ' LEFT JOIN evol_demo.'+f.lovtable+' AS t2'+
                ' ON t1.'+f.attribute+'=t2.id'
    }else{
        sql='SELECT '+f.attribute+'::text AS label, count(*)::integer '+
        ' FROM evol_demo.'+e+' AS t1';
    }
    sql += ' GROUP BY label'+
            //' ORDER BY count(*) DESC'+
            ' ORDER BY label ASC'+
            ' LIMIT 50;';

    runQuery(res, sql, null, false);
}


// --------------------------------------------------------------------------------------
// -----------------    GET ONE   -------------------------------------------------------
// --------------------------------------------------------------------------------------

function getOne(req, res) {
    var mid = req.params.entity;
    var id = req.params.id;
    loadUIModel(mid);
    logger.logReq('GET ONE', req);

    // ---- LISTS OF VALUES
    var lovs = sqlLOVs(fields)
    var sql='SELECT t1.id, '+sqlSelect(fields, dico.getSubCollecs(uim))+lovs.select+
            ' FROM '+tableName + ' AS t1'+lovs.from+
            ' WHERE t1.id=$1 LIMIT 1;';

    runQuery(res, sql, [id], true);
}


// --------------------------------------------------------------------------------------
// -----------------    INSERT ONE   ----------------------------------------------------
// --------------------------------------------------------------------------------------

function _prepData(req, fnName){
    var ns=[],
        vs=[];

    _.forEach(fields, function(f){
        if(f.attribute!='id' && f.type!='formula' && !f.readOnly){
            var fv=req.body[f.id];
            if(fv!=null){
                switch(f.type){
                    case 'panel-list':
                        vs.push(JSON.stringify(fv));
                        ns.push(fnName(f, vs.length));
                        break;
                    case 'boolean':
                        vs.push(fv?'TRUE':'FALSE');
                        ns.push(fnName(f, vs.length));
                        break;
                    case 'date':
                    case 'time':
                    case 'datetime':
                        if(fv===''){
                            fv=null;
                        }
                        vs.push(fv);
                        ns.push(fnName(f, vs.length));
                        break;
                    default:
                        vs.push(fv);
                        ns.push(fnName(f, vs.length));
                }
            }
        }
    });
    _.forEach(dico.getSubCollecs(uim), function(f){
        var fv=req.body[f.id];
        if(fv!=null){
            vs.push(JSON.stringify(fv));
            ns.push(fnName(f, vs.length));
        }
    });
    return {
        names: ns,
        values: vs
    };
}

function insertOne(req, res) {
    var mid = req.params.entity;
    loadUIModel(mid);
    logger.logReq('INSERT ONE', req);

    var q=_prepData(req, function(f){return f.attribute;});
    if(q.names.length){
        var ps=_.map(q.names, function(n, idx){
            return '$'+(idx+1);
        });
        var sql = 'INSERT INTO '+tableName+
            ' ("'+q.names.join('","')+'") values('+ps.join(',')+')'+
            ' RETURNING id, '+sqlSelect(fields, false)+';';

        runQuery(res, sql, q.values, true);
    }
}


// --------------------------------------------------------------------------------------
// -----------------    UPDATE ONE    ---------------------------------------------------
// --------------------------------------------------------------------------------------

function updateOne(req, res) {
    var results = [];
    var mid = req.params.entity;
    var id = req.params.id; 
    loadUIModel(mid);
    logger.logReq('UPDATE ONE', req);

    var q = _prepData(req, function(f, idx){return '"'+f.attribute+'"=$'+idx;});

    if(q.names.length){
        q.values.push(id);
        var sql='UPDATE '+tableName+' SET '+ q.names.join(',') + 
            ' WHERE id=$'+q.values.length+' RETURNING id, '+sqlSelect(fields, false)+';';
        runQuery(res, sql, q.values, true);
    }
}


// --------------------------------------------------------------------------------------
// -----------------    DELETE ONE   ----------------------------------------------------
// --------------------------------------------------------------------------------------

function deleteOne(req, res) {
    var mid = req.params.entity;
    var id = req.params.id;
    loadUIModel(mid);
    logger.logReq('DELETE ONE', req);

    // Get a Postgres client from the connection pool
    pg.connect(config.connectionString, function(err, client, done) {

        // SQL Query > Delete Data
        var sql = 'DELETE FROM '+tableName+' WHERE id=$1';
        logger.logSQL(sql);
        client.query(sql, [id]);
        //done();
        return res.json(true);

        // Handle Errors
        if(err) {
          console.log(err);
        }

    });

}


module.exports = {

    getMany: getMany,
    getOne: getOne,
    insertOne: insertOne,
    updateOne: updateOne,
    deleteOne: deleteOne,
    
    chartMany: chartMany

    //,exportMany: exportMany

}
