/*! *******************************************************
 *
 * evolutility-server :: index.js
 *
 * https://github.com/evoluteur/evolutility-server
 * Copyright (c) 2016 Olivier Giulieri
 ********************************************************* */

var express = require('express');
var router = express.Router();
var path = require('path');
var pg = require('pg');
var _ = require('underscore');
var def = require('../models/def');
var log = require('./logger');

//var evol = require('evolutility');
var connectionString = require(path.join(__dirname, '../', '../', 'config'));

var schema='evol_demo',
    apiPath='/api/v1/evolutility/';

var uims={
        'todo': require('../../client/public/ui-models/todo.js'),
        'contact': require('../../client/public/ui-models/contacts.js'),
        'winecellar': require('../../client/public/ui-models/winecellar.js'),
        'comics': require('../../client/public/ui-models/comics.js'),
        //'test': require('../../client/public/ui-models/test.js')
    },
    uim=null,
    tableName=null;

var fields;
var fieldsH;
var fCache = {};

log.ascii_art();

function loadUIModel(uimId){
    uim = uims[uimId];
    tableName=(schema?'"'+schema+'".':'')+'"'+(uim.table || uim.id)+'"';
    if(!fCache[uimId]){
        fCache[uimId] = def.getFields(uim);
    }
    fields = fCache[uimId];
    fieldsH = def.getFields(uim, true);
}

function runQuery(res, sql, values, singleRecord){
    var results = [];

    // Get a Postgres client from the connection pool 
    pg.connect(connectionString, function(err, client, done) {

        // SQL Query > Select Data
        log.logSQL(sql);
        var query = values ? client.query(sql, values) :  client.query(sql);

        // Stream results back one row at a time
        query.on('row', function(row) {
            results.push(row);
        });

        // After all data is returned, close connection and return results
        query.on('end', function() {
            client.end();
            return res.json(singleRecord ? results[0] : results);
        });

        // Handle Errors
        if(err) {
            res.status(500).send('Something broke!');
            log.logError(err);
        }

    });

}


router.get('/', function(req, res, next) {
  res.sendFile(path.join(__dirname, '../', '../', 'client', 'views', 'index.html'));
});


// --------------------------------------------------------------------------------------
// -----------------    GET MANY   ------------------------------------------------------
// --------------------------------------------------------------------------------------

function fieldOrder(f){
    var fs=def.getFields(uim,true);
    var idx=f.indexOf('.');
    if(idx>-1){
        var ff=f.substring(0, idx),
            fDirection=f.substring(idx+1)==='desc'?' DESC':' ASC';
        return 't1."'+fs[ff].attribute + '"'+fDirection;
    }else{
        return 't1."'+(fs[f]?(fs[f].attribute||fs[f].id)||'id':'id') + '" ASC';
    }
}

router.get(apiPath+':objectId', function(req, res) {
    var uimid = req.params.objectId;
    var data=[];
    loadUIModel(uimid);
    log.logReq('GET MANY', req);

    // ---- SELECTION
    var columns = _.map(fields, function(f){
        return 't1."'+f.attribute+'"';
    });
    var sql='SELECT t1.id, '+columns.join(',')+' FROM '+tableName + ' AS t1';

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
                if((cond==='eq' || cond==='ne') && def.fieldIsText(f)){
                    data.push(cs[1]);
                    sqlW.push('LOWER(t1."'+f.attribute+'")'+sqlOperators[cond]+'LOWER($'+data.length+')');
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
                        if(cond==='nct'){ // contains
                            //TODO replace % in cs[1]
                            data.push('%'+cs[1]+'%');
                            sqlW.push(' NOT '+w+'($'+data.length+')');
                        }else{
                            if(cond==='sw'){ // start with
                                data.push(cs[1]+'%');
                            }else if(cond==='fw'){ // finishes with
                                data.push('%'+cs[1]);
                            }else if(cond==='ct'){ // contains
                                data.push('%'+cs[1]+'%');
                            }else{
                                data.push(cs[1]);
                            }
                            sqlW.push(w+'($'+data.length+')');
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
            log.logObject('search fields', uim.fnSearch);
            var sqlP='"'+sqlOperators.ct+'($'+(data.length+1)+')';
            _.forEach(uim.fnSearch, function(m){
                sqlWS.push('t1."'+fieldsH[m].attribute+sqlP);
            });
            data.push('%'+req.query.search+'%');
            sqlW.push('('+sqlWS.join(' OR ')+')');
        }
    }

    if(sqlW.length){
        sql+=' WHERE '+sqlW.join(' AND ');
    }

    // ---- ORDERING
    sql+=' ORDER BY ';
    var qOrder=req.query?req.query.order:null;
    if(qOrder){
        if(qOrder.indexOf(',')>-1){
            var fl=qOrder.split(',');
            sql+=_.map(fl, fieldOrder).join(',');
        }else{
            sql+=fieldOrder(qOrder);
        }
    }else{
        sql+='t1.id DESC';
    }

    // ---- LIMITING & PAGINATION
    var qPage=req.query.page||0, 
        qPageSize=req.query.pageSize>0 ? req.query.pageSize : 50;
    if(qPage){
        sql+=' LIMIT '+qPageSize+
            ' OFFSET '+(qPage*qPageSize);
    }else{
        sql+=' LIMIT '+qPageSize;
    }
    sql+=';';

    runQuery(res, sql, data, false);
});


// --------------------------------------------------------------------------------------
// -----------------    GET ONE   -------------------------------------------------------
// --------------------------------------------------------------------------------------

router.get(apiPath+':objectId/:id', function(req, res) {
    var uimid = req.params.objectId;
    var id = req.params.id;
    loadUIModel(uimid);
    log.logReq('GET ONE', req);

    // SQL Query > Select Data
    var sql='SELECT * FROM '+tableName+' WHERE id=($1) LIMIT 1;';
    runQuery(res, sql, [id], true);
});


// --------------------------------------------------------------------------------------
// -----------------    INSERT ONE   ----------------------------------------------------
// --------------------------------------------------------------------------------------

function _prepData(req, fnName){
    var idx=0,
        ns=[],
        vs=[];

    _.forEach(fields, function(f){
        if(f.attribute!='id' && f.type!='formula' && !f.readOnly){
            var fv=req.body[f.attribute];
            if(fv!=null){
                switch(f.type){
                    case 'boolean':
                        idx++;
                        ns.push(fnName(f, idx));
                        vs.push(fv?'TRUE':'FALSE');
                        break;
                    case 'date':
                    case 'time':
                    case 'datetime':
                        if(fv===''){
                            fv=null;
                        }
                        idx++;
                        ns.push(fnName(f, idx));
                        vs.push(fv);
                        break;
                    default:
                        idx++;
                        ns.push(fnName(f, idx));
                        vs.push(fv);
                }
            }
        }
    });
    _.forEach(def.getSubCollecs(uim), function(f){
        var fv=req.body[f.attribute||f.id];
        if(fv!=null){ 
            idx++;
            ns.push(fnName(f, idx));
            vs.push(JSON.stringify(fv));
        }
    });
    return {
        names: ns,
        values: vs
    };
}

router.post(apiPath+':objectId', function(req, res) {
    var mid = req.params.objectId;
    loadUIModel(mid);
    log.logReq('INSERT ONE', req);

    var q=_prepData(req, function(f, idx){return f.attribute;});
    if(q.names.length){
        var ps=_.map(q.names, function(n, idx){
            return '($'+(idx+1)+')';
        });
        var sql = 'INSERT INTO '+tableName+
            ' ("'+q.names.join('","')+'") values('+ps.join(',')+')'+
            ' RETURNING *;';
        runQuery(res, sql, q.values, true);
    }
});


// --------------------------------------------------------------------------------------
// -----------------    UPDATE ONE    ---------------------------------------------------
// --------------------------------------------------------------------------------------

function _update(req, res) {
    var results = [];
    var mid = req.params.objectId;
    var id = req.params.id; 
    loadUIModel(mid);
    log.logReq('UPDATE ONE', req);

    var q = _prepData(req, function(f, idx){return '"'+f.attribute+'"=($'+idx+')';});

    if(q.names.length){
        q.values.push(id);
        var sql='UPDATE '+tableName+' SET '+ q.names.join(',') + 
            ' WHERE id=($'+q.values.length+') RETURNING *;';
        runQuery(res, sql, q.values, true);
    }
}

router.patch(apiPath+':objectId/:id', _update);
router.put(apiPath+':objectId/:id', _update);


// --------------------------------------------------------------------------------------
// -----------------    DELETE ONE   ----------------------------------------------------
// --------------------------------------------------------------------------------------

router.delete(apiPath+':objectId/:id', function(req, res) {
    var mid = req.params.objectId;
    var id = req.params.id;
    loadUIModel(mid);
    log.logReq('DELETE ONE', req);

    // Get a Postgres client from the connection pool
    pg.connect(connectionString, function(err, client, done) {

        // SQL Query > Delete Data
        var sql = 'DELETE FROM '+tableName+' WHERE id=($1)';
        log.logSQL(sql);
        client.query(sql, [id]);
        return res.json(true);
/*
        // Handle Errors
        if(err) {
          console.log(err);
        }
*/
    });

});

module.exports = router;
