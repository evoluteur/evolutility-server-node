var express = require('express');
var router = express.Router();
var path = require('path');
var pg = require('pg');
var _ = require('underscore');

var schema='evol_demo',
    apiPath='/api/v1/evolutility/';

var consoleLog = true;

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

function loadUIModel(uimId){
    uim = uims[uimId];
    tableName=(schema?'"'+schema+'".':'')+'"'+(uim.table || uim.id)+'"';
    if(!fCache[uimId]){
        fCache[uimId] = getFields(uim);
    }
    fields = fCache[uimId];
}

function logObject(title, req){
    if(logSQL){
        console.log('\n\n--- '+title+' ---');
        console.log('params = '+JSON.stringify(req.params, null, 2));
        console.log('body = '+JSON.stringify(req.body, null, 2));
    }
}
function logSQL(sql){
    if(logSQL){
        console.log('sql = '+sql+'\n');
    }
}

//var evol = require('evolutility');
var connectionString = require(path.join(__dirname, '../', '../', 'config'));

console.log('\n\n=== START EVOLUTILITY ===\n');

router.get('/', function(req, res, next) {
  res.sendFile(path.join(__dirname, '../', '../', 'client', 'views', 'index.html'));
});


// #########    GET MANY   ######
router.get(apiPath+':objectId', function(req, res) {
    var results = [];
    var uimid = req.params.objectId;
    loadUIModel(uimid);
    logObject('GET MANY', req);

    // Get a Postgres client from the connection pool 
    pg.connect(connectionString, function(err, client, done) {

        // SQL Query > Select Data
        var sql='SELECT * FROM '+tableName+' ORDER BY id ASC;';
        logSQL(sql);
        var query = client.query(sql);

        // Stream results back one row at a time
        query.on('row', function(row) {
            results.push(row);
        });

        // After all data is returned, close connection and return results
        query.on('end', function() {
            client.end();
            return res.json(results);
        });

        // Handle Errors
        if(err) {
            res.status(500).send('Something broke!');
            console.log(err);
        }

    });

});

// #########    GET ONE   ######
router.get(apiPath+':objectId/:id', function(req, res) {
    var result;

    // Get a Postgres client from the connection pool 
    pg.connect(connectionString, function(err, client, done) {
        var uimid = req.params.objectId;
        var id = req.params.id;
        loadUIModel(uimid);
        logObject('GET ONE', req);

        // SQL Query > Select Data
        var sql='SELECT * FROM '+tableName+' WHERE id=($1)';
        logSQL(sql);
        var query = client.query(sql, [id]);

        // Stream results back one row at a time
        query.on('row', function(row) {
            results=row;
        });

        // After all data is returned, close connection and return results
        query.on('end', function() {
            client.end();
            return res.json(results);
        });

        // Handle Errors
        if(err) {
          console.log(err);
        }

    });

});

// #########    INSERT ONE   ######
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
                        //no break;
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
    var results = [];
    var mid = req.params.objectId;
    loadUIModel(mid);
    logObject('INSERT ONE', req);

    // Get a Postgres client from the connection pool
    pg.connect(connectionString, function(err, client, done) {
        var sql;
        var q=_prepData(req, function(f, idx){return f.attribute;});
        if(q.names.length){
            var ps=_.map(q.names, function(n, idx){
                return '($'+(idx+1)+')';
            });
            sql = 'INSERT INTO '+tableName;
            sql+='("'+q.names.join('","')+'") values('+ps.join(',')+')';
            logSQL(sql);

            // SQL Query > Insert Data
            client.query(sql, q.values);
        }

        // SQL Query > Select Data
        sql='SELECT * FROM '+tableName+' ORDER BY id DESC limit 1';
        logSQL(sql);

        //'SELECT currval(pg_get_serial_sequence('persons','id'));'
        var query = client.query(sql, null);

        // Stream results back one row at a time
        query.on('row', function(row) {
            results=row;
        });

        // After all data is returned, close connection and return results
        query.on('end', function() {
            client.end();
            return res.json(results);
        });

        // Handle Errors
        if(err) {
          console.log(err);
        }

    });
});

// #########    UPDATE ONE    ######
var _update=function(req, res) {

    var results = [];
    var mid = req.params.objectId;
    //var id=req.body.id;
    var id = req.params.id; 
    loadUIModel(mid);
    logObject('UPDATE ONE', req);

    // Get a Postgres client from the connection pool
    pg.connect(connectionString, function(err, client, done) {
        var sql='UPDATE '+tableName+' SET ';
        var q=_prepData(req, function(f, idx){return '"'+f.attribute+'"=($'+idx+')';});

        if(q.names.length){
            q.values.push(id);
            sql+=q.names.join(',') + ' WHERE id=($'+(q.names.length+1)+')';//'  RETURNING *';
            logSQL(sql);
            client.query(sql, q.values);
        }

        // SQL Query > Select Data
        sql='SELECT * FROM '+tableName+' WHERE id=($1)';
        logSQL(sql);
        var query = client.query(sql, [id]);

        // Stream results back one row at a time
        query.on('row', function(row) {
            results=row;
        });

        // After all data is returned, close connection and return results
        query.on('end', function() {
            client.end();
            return res.json(results);
        });

        // Handle Errors
        if(err) {
          console.log(err);
        }

    });

};
router.patch(apiPath+':objectId/:id', _update);
router.put(apiPath+':objectId/:id', _update);

// #########    DELETE ONE   ######
router.delete(apiPath+':objectId/:id', function(req, res) {

    var mid = req.params.objectId;
    var id = req.params.id;
    loadUIModel(mid);
    logObject('DELETE ONE', req);

    // Get a Postgres client from the connection pool
    pg.connect(connectionString, function(err, client, done) {

        // SQL Query > Delete Data
        var sql = 'DELETE FROM '+tableName+' WHERE id=($1)';
        logSQL(sql);
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
