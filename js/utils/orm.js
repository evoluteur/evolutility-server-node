/*! *******************************************************
 *
 * evolutility-server :: utils/orm.js
 *
 * https://github.com/evoluteur/evolutility-server
 * Copyright (c) 2016 Olivier Giulieri
 ********************************************************* */

var pg = require('pg');
var csv = require('express-csv');
var _ = require('underscore');
var dico = require('./dico');
var logger = require('./logger');

var config = require('../../config.js');
var models=require('../../models/all_models');

var schema = '"' + (config.schema || 'evol_demo') + '"';

function getModel(uimId){
    var m = dico.prepModel(models[uimId]);
    m.schemaTable = schema+'."'+(m.table || m.id)+'"';
    return m;
}

function sqlQuery(select, tables, where, group, order, limit){
    var sql = 'SELECT '+select+
        ' FROM '+tables;
    if(where.length){
        sql+=' WHERE '+where.join(' AND ');
    }
    sql+=group ? ' GROUP BY '+group : '';
    sql+=order ? ' ORDER BY '+order : '';
    sql+=limit ? ' LIMIT '+limit : '';
    return sql;
}

function runQuery(res, sql, values, singleRecord, format, header){
    var results = [];

    // Get a Postgres client from the connection pool 
    pg.connect(config.connectionString, function(err, client, done) {

        // SQL Query > Select Data
        logger.logSQL(sql);
        var query = values ? client.query(sql, values) : client.query(sql);

        // Stream results back one row at a time
        query.on('row', function(row) {
            results.push(row);
        });

        // After all data is returned, close connection and return results
        query.on('end', function() {
            client.end();
            //done();
            if(format==='csv'){
                if(header){
                    var headers={};
                    for (key in results[0]) {
                        headers[key] = header[key] || key;
                    }
                    results.unshift(headers);
                    return res.csv(results);
                }else{
                    return res.csv(results);
                }
            }else{
                return res.json(singleRecord ? results[0] : results);
            }
        });

        // Handle Errors
        if(err) {
            done();
            res.status(500).send('Something broke!');
            logger.logError(err);
        }

    });

}

function csvHeader(fields){
    var h={'id': 'ID'}
    var lovs={}
    _.forEach(fields, function(f){
        if(f.type==='lov'){
            h[f.id] = (f.label || f.id)+' ID';
            h[f.id+'_txt'] = f.label || f.id;
        }else{
            h[f.id] = f.label || f.id;
        }
    });
    return h;
}

function sqlSelect(fields, collecs, table, action){
    var sql;
    var tQuote = table ? 't1."' : '"';
    var sqlfs=[];
    _.forEach(fields, function(f, idx){
        if(f.type==='lov' && action!=='C' && action!=='U'){
            sqlfs.push('t'+(idx+2)+'.'+(f.lovcolumn ? f.lovcolumn : 'value')+' AS "'+f.id+'_txt"')
        } 
        sql = tQuote+f.attribute
        //if(f.type==='money'){
            //sql += '"::money'
        //}else if(f.type==='integer'){
            //sql += '"::integer'
        //}else if(f.type==='decimal'){
            //sql += '"::float'
        //}else{
            sql += '"'
        //}
        if(f.attribute && f.id!=f.attribute){
            sql += ' AS "'+f.id+'"'
        }
        sqlfs.push(sql);
        //if(f.type==='lov'){
            //sqlfs.push(sql);
        //}
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

function sqlOrderColumn(f){
    // TODO: use this method in sqlFieldOrder
    if(f.type==='lov' && f.lovtable){
        return '"'+f.id+'_txt"';
    }else{
        return '"'+(f.attribute || f.id)+'"';
    }
}
function sqlFieldOrder(fo){
    var fs=dico.getFields(uim, true);
    var idx=fo.indexOf('.');
    if(idx>-1){
        var ff=fo.substring(0, idx),
            fDirection=fo.substring(idx+1)==='desc'?' DESC':' ASC';
        return 't1."'+fs[ff].attribute + '"'+fDirection;
    }else{
        return 't1."'+(fs[fo]?(fs[fo].attribute||fs[fo].id)||'id':'id') + '" ASC';
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
            var tlov = 't'+(idx+2);
            var lovCol = f.lovcolumn ? f.lovcolumn : 'value';
            sql.from += ' LEFT JOIN '+schema+'."'+f.lovtable+'" AS '+tlov+
                        ' ON t1.'+f.attribute+'='+tlov+'.id'
            //sql.select += ', '+tlov+'.'+lovCol+' AS "'+f.id+'_txt"'
        }
    })
    return sql;
}

function sqlMany(m, req, allFields){
    var fs=allFields ? m.fields : m.fields.filter(dico.isFieldMany)
    var sqlParams=[];

    // ---- SELECTION
    var sqlSel = 't1.id, '+sqlSelect(fs, false, true);
    var sqlFrom = m.schemaTable + ' AS t1';

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
    var sqlW = [];
    var ffs = _.forEach(req.query, function(c, n){
        var f = (n==='id') ? {attribute:'id'} : m.fieldsH[n];
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
        var paramSearch = false;
        var sqlWS = [];
        if(uim.fnSearch && _.isArray(uim.fnSearch)){
            logger.logObject('search fields', uim.fnSearch);
            var sqlP='"'+sqlOperators.ct+'($'+(sqlParams.length+1)+')';
            _.forEach(uim.fnSearch, function(m){
                sqlWS.push('t1."'+fieldsH[m].attribute+sqlP);
            });
            sqlParams.push('%'+req.query.search.replace(/%/g, '\%')+'%');
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
        var f = fs[0]
        var col = f.attribute || f.id
        sqlOrder = 't1."'+col+'" ASC';
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
    logger.logReq('GET MANY', req);

    var m = getModel(req.params.entity);
    if(m){
        var format = req.query._format || null,
            isCSV = format==='csv',
            sq = sqlMany(m, req, isCSV),
            sql = sqlQuery(sq.select, sq.from, sq.where, null, sq.order);

        runQuery(res, sql, sq.params, false, format, isCSV ? csvHeader(m.fields) : null);
    }
}

function chartMany(req, res) {
    logger.logReq('GET CHART', req);

    var m = getModel(req.params.entity),
        fid = req.params.field,
        sqlParams = [];

    if(m && fid){
        var f = m.fieldsH[fid],
            clov = f.lovcolumn||'value';

        if(f.type==='lov' && f.lovtable){
            sql='SELECT t2.'+clov+'::text AS label, count(*)::integer '+
                ' FROM '+m.schemaTable+' AS t1'+
                ' LEFT JOIN '+schema+'.'+f.lovtable+' AS t2'+
                    ' ON t1.'+f.attribute+'=t2.id';
        }else{
            var attr =  '"'+f.attribute+'"';
            if(f.type==='boolean'){
                attr='CASE '+attr+' WHEN true THEN \'Yes\' ELSE \'No\' END'
            }
            sql='SELECT '+attr+'::text AS label, count(*)::integer '+
                ' FROM '+m.schemaTable+' AS t1';
        }
        sql += ' GROUP BY label'+
                //' ORDER BY count(*) DESC'+
                ' ORDER BY label ASC'+
                ' LIMIT 50;';

        runQuery(res, sql, sqlParams, false);
    }

}


// --------------------------------------------------------------------------------------
// -----------------    GET ONE   -------------------------------------------------------
// --------------------------------------------------------------------------------------

function getOne(req, res) {
    logger.logReq('GET ONE', req);

    var m = getModel(req.params.entity);
    var id = req.params.id;
    var sqlParams = [id];

    if(m && id){
        var lovs = sqlLOVs(m.fields)
        var sql='SELECT t1.id, '+sqlSelect(m.fields, m.collecs, true)+lovs.select+
                ' FROM '+m.schemaTable+' AS t1'+lovs.from+
                ' WHERE t1.id=$1'+
                ' LIMIT 1;';

        runQuery(res, sql, sqlParams, true);        
    }
    
}


// --------------------------------------------------------------------------------------
// -----------------    INSERT ONE   ----------------------------------------------------
// --------------------------------------------------------------------------------------

function prepData(m, req, fnName, action){
    var ns = [],
        vs = [];

    _.forEach(m.fields, function(f){
        if(f.attribute!='id' && f.type!='formula' && !f.readOnly){
            var fv=req.body[f.id];
            if(fv!=null){
                switch(f.type){
                    case 'panel-list':
                        vs.push(JSON.stringify(fv));
                        ns.push(fnName(f, vs.length));
                        break;
                    case 'boolean':
                        vs.push((fv&&fv!=='false')?'TRUE':'FALSE');
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
    _.forEach(m.collecs, function(f){
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
    logger.logReq('INSERT ONE', req);

    var m = getModel(req.params.entity);
    var q = prepData(m, req, function(f){return f.attribute;}, 'C');

    if(m && q.names.length){
        var ps=_.map(q.names, function(n, idx){
            return '$'+(idx+1);
        });
        var sql = 'INSERT INTO '+m.schemaTable+
            ' ("'+q.names.join('","')+'") values('+ps.join(',')+')'+
            ' RETURNING id, '+sqlSelect(m.fields, false, null, 'C')+';';

        runQuery(res, sql, q.values, true);
    }
}


// --------------------------------------------------------------------------------------
// -----------------    UPDATE ONE    ---------------------------------------------------
// --------------------------------------------------------------------------------------

function updateOne(req, res) {
    logger.logReq('UPDATE ONE', req);

    var m = getModel(req.params.entity);
    var id = req.params.id;
    var q = prepData(m, req, function(f, idx){return '"'+f.attribute+'"=$'+idx;}, 'U');

    if(m && id && q.names.length){
        q.values.push(id);
        var sql='UPDATE '+m.schemaTable+' AS t1 SET '+ q.names.join(',') + 
            ' WHERE id=$'+q.values.length+
            ' RETURNING id, '+sqlSelect(m.fields, false, null, 'U')+';';
        runQuery(res, sql, q.values, true);
    }
}


// --------------------------------------------------------------------------------------
// -----------------    DELETE ONE   ----------------------------------------------------
// --------------------------------------------------------------------------------------

function deleteOne(req, res) {
    logger.logReq('DELETE ONE', req);

    var m = getModel(req.params.entity);
    var id = req.params.id;

    if(m && id){
        pg.connect(config.connectionString, function(err, client, done) {

            // SQL Query > Delete Data
            var sql = 'DELETE FROM '+m.schemaTable+' WHERE id=$1';
            logger.logSQL(sql);
            client.query(sql, [id]);
            //done();
            return res.json(true);

            // Handle Errors
            if(err) {
                done()
                console.log(err);
            }

        });
    }else{
        return res.json(false);
    } 

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
