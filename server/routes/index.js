/*! *******************************************************
 *
 * evolutility-server :: index.js
 * Starting page for Evolutility SPA
 *
 * https://github.com/evoluteur/evolutility-server
 * Copyright (c) 2016 Olivier Giulieri
 ********************************************************* */

var express = require('express');
var router = express.Router();
var path = require('path');
var pg = require('pg');
var _ = require('underscore');
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

var fCache = {};


function getFields(uiModel, asObject){
    var fs=asObject?{}:[];
    function collectFields(te) {
        if (te && te.elements && te.elements.length > 0) {
            _.forEach(te.elements, function (te) {
                if(te.type!='panel-list'){
                    collectFields(te);
                }
            });
        } else {
            if(asObject){
                fs[te]=te;
            }else{
                fs.push(te);
            }
        }
    }
    collectFields(uiModel);
    return fs;
}
log.ascii_art();

function loadUIModel(uimId){
    uim = uims[uimId];
    tableName=(schema?'"'+schema+'".':'')+'"'+(uim.table || uim.id)+'"';
    if(!fCache[uimId]){
        fCache[uimId] = getFields(uim);
    }
    fields = fCache[uimId];
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
            console.log(err);
        }

    });

}


router.get('/', function(req, res, next) {
  res.sendFile(path.join(__dirname, '../', '../', 'client', 'views', 'index.html'));
});


// -----------------    GET MANY   -------------------------------------------------------
router.get(apiPath+':objectId', function(req, res) {
    var uimid = req.params.objectId;
    loadUIModel(uimid);
    log.logObject('GET MANY', req);

    var sql='SELECT * FROM '+tableName+' ORDER BY id ASC;';
    runQuery(res, sql, null, false);
});


// -----------------    GET ONE   -------------------------------------------------------
router.get(apiPath+':objectId/:id', function(req, res) {
    var uimid = req.params.objectId;
    var id = req.params.id;
    loadUIModel(uimid);
    log.logObject('GET ONE', req);

    // SQL Query > Select Data
    var sql='SELECT * FROM '+tableName+' WHERE id=($1)';
    runQuery(res, sql, [id], true);
});


// -----------------    INSERT ONE   -------------------------------------------------------
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
    return {
        names: ns,
        values: vs
    };
}
router.post(apiPath+':objectId', function(req, res) {
    var mid = req.params.objectId;
    loadUIModel(mid);
    log.logObject('INSERT ONE', req);

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


// -----------------    UPDATE ONE    -------------------------------------------------------
function _update(req, res) {
    var results = [];
    var mid = req.params.objectId;
    var id = req.params.id; 
    loadUIModel(mid);
    log.logObject('UPDATE ONE', req);

    var q=_prepData(req, function(f, idx){return '"'+f.attribute+'"=($'+idx+')';});

    if(q.names.length){
        q.values.push(id);
        var sql='UPDATE '+tableName+' SET '+ q.names.join(',') + 
            ' WHERE id=($'+q.values.length+') RETURNING *;';
        runQuery(res, sql, q.values, true);
    }
}
router.patch(apiPath+':objectId/:id', _update);
router.put(apiPath+':objectId/:id', _update);


// -----------------    DELETE ONE   -------------------------------------------------------
router.delete(apiPath+':objectId/:id', function(req, res) {
    var mid = req.params.objectId;
    var id = req.params.id;
    loadUIModel(mid);
    log.logObject('DELETE ONE', req);

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
