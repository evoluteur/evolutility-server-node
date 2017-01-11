/*! *******************************************************
 *
 * evolutility-server-node :: utils/orm.js
 *
 * https://github.com/evoluteur/evolutility-server-node
 * (c) 2017 Olivier Giulieri
 ********************************************************* */

var pg = require('pg'),
    parseConnection = require('pg-connection-string').parse,
    dico = require('./dico'),
    sqls = require('./sql-select'),
    query = require('./query'),
    logger = require('./logger'),
    config = require('../../config.js');

var dbConfig = parseConnection(config.connectionString)
dbConfig.max = 10; // max number of clients in the pool 
dbConfig.idleTimeoutMillis = 30000; // max client idle time before being closed

var schema = '"'+(config.schema || 'evol_demo')+'"',
    defaultPageSize = config.pageSize || 50,
    lovSize = config.lovSize || 100;

var pool = new pg.Pool(dbConfig);

pool.on('error', function (err, client) {
  console.error('idle client error', err.message, err.stack)
})

// - build the header row for CSV export
function csvHeader(fields){
    var h = {'id': 'ID'},
        lovs = {};

    fields.forEach(function(f){
        if(f.type==='lov'){
            h[f.id] = (f.label || f.id)+' ID';
            h[f.id+'_txt'] = f.label || f.id;
        }else{
            h[f.id] = f.label || f.id;
        }
    });
    return h;
}


// --------------------------------------------------------------------------------------
// -----------------    GET MANY   ------------------------------------------------------
// --------------------------------------------------------------------------------------

// - returns sql (obj) ORDER BY clause for many fields
function sqlOrderFields(m, fullOrder){
    var fs = m.fields,
        qos = fullOrder.split(',');

    return qos.map(function(qo){
        var ows = qo.split('.'),
            f = m.fieldsH[ows[0]],
            col = f ? sqls.columnName.order(f) : 'id' // -- sort by id if invalid param
        if(ows.length===1){
            return col;
        }else{
            return col + (ows[1]==='desc'?' DESC':' ASC');
        }
    }).join(',')
}

// - returns SQL list of joined tables for lov fields
function sqlFromLOVs(fields){
    var sql = '';
    fields.forEach(function(f, idx){
        if(f.type==='lov' && f.lovtable){
            sql += ' LEFT JOIN '+schema+'."'+f.lovtable+'" AS '+f.t2+
                        ' ON t1."'+f.column+'"='+f.t2+'.id';
        }
    })
    return sql;
}

// - returns SQL for query returning a set of records
function sqlMany(m, req, allFields, wCount){
    var fs = allFields ? m.fields : m.fields.filter(dico.fieldInMany),
        sqlParams = [];

    // ---- SELECTION
    var sqlSel = 't1.id, '+sqls.select(fs, false, true),
        sqlFrom = m.schemaTable + ' AS t1' + sqlFromLOVs(fs);

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
    var sqlWs = [];
    for (var n in req.query){
        if (req.query.hasOwnProperty(n)) {
            var f = (n==='id') ? {column:'id'} : m.fieldsH[n];
            if(f && ['select', 'filter', 'search', 'order', 'page', 'pageSize'].indexOf(f)<0){
                var cs = req.query[n].split('.');
                if(cs.length){
                    var cond=cs[0];
                    if(sqlOperators[cond]){
                        if((cond==='eq' || cond==='ne') && dico.fieldIsText(f)){
                            sqlParams.push(cs[1]);
                            if(f.type==='text' || f.type==='textmultiline' || f.type==='html'){
                                sqlWs.push('LOWER(t1."'+f.column+'")'+sqlOperators[cond]+'LOWER($'+sqlParams.length+')');
                            }else{
                                sqlWs.push('t1."'+f.column+'"'+sqlOperators[cond]+'$'+sqlParams.length);
                            }
                        }else{
                            var w='t1."'+f.column+'"'+sqlOperators[cond];
                            if(cond==='in' && (f.type==='lov' || f.type==='list')){
                                sqlWs.push(w+'('+cs[1].split(',').map(function(li){
                                    return "'"+li.replace(/'/g, "''")+"'";
                                }).join(',')+')'); 
                            }else if(cond==='0'){ // false
                                sqlWs.push(w+'false');
                            }else if(cond==='1'){ // true
                                sqlWs.push(w+'true');
                            }else if(cond==='null'){ // empty        
                                sqlWs.push(' NOT '+w+'NULL');
                            }else{
                                if(cond==='nct'){ // not contains
                                    //TODO replace % in cs[1]
                                    sqlParams.push('%'+cs[1]+'%');
                                    sqlWs.push(' NOT '+w+'$'+sqlParams.length);
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
                                    sqlWs.push(w+'$'+sqlParams.length);
                                }
                            }
                        }
                    }else{
                        console.log('Invalid condition "'+cond+'"')
                    }
                }
            }
        }
    }

    // ---- SEARCHING
    if(req.query.search){
        // TODO: use fts
        var paramSearch = false,
            sqlWsSearch = [];

        if(m.searchFields && Array.isArray(m.searchFields)){
            logger.logObject('search fields', m.searchFields);
            var sqlP='"'+sqlOperators.ct+'($'+(sqlParams.length+1)+')';
            m.searchFields.forEach(function(fid){
                sqlWsSearch.push('t1."'+m.fieldsH[fid].column+sqlP);
            });
            sqlParams.push('%'+req.query.search.replace(/%/g, '\%')+'%');
            sqlWs.push('('+sqlWsSearch.join(' OR ')+')');
        }
    }

    // ---- RECORD COUNT (added to selection)
    if(wCount){
        if(sqlWs.length){
            sqlSel += ',(SELECT count(*) FROM '+m.schemaTable+')::integer AS _full_count';
        }else{
            sqlSel += ',count(*) OVER()::integer AS _full_count';
        }
    }
    
    // ---- ORDERING
    sqlOrder='';
    var qOrder=req.query?req.query.order:null;
    if(qOrder){
        if(qOrder.indexOf(',')>-1){
            var qOs=qOrder.split(',');
            if(qOs){
                sqlOrder+=qOs.map(qOs, function(qo){
                        return sqlOrderFields(m, qo)
                    }).join(',');
            }
        }else{
            sqlOrder+=sqlOrderFields(m, qOrder);
        }
    }else{
        var fCol='t1."'+fs[0].column+'"';
        if(fs[0].type==='text'){
            fCol='UPPER('+fCol+')';
        }
        sqlOrder = fCol+' ASC';
    }

    // ---- LIMITING & PAGINATION
    var offset=0,
        qPage=req.query.page||0, 
        qPageSize;

    if(req.query.format==='csv'){
        qPageSize = config.csvSize || 1000;
    }else{
        qPageSize = parseInt(req.query.pageSize || defaultPageSize, 10);
        if(qPage){
            offset = qPage*qPageSize;
        }
    }

    return {
        select: sqlSel,
        from: sqlFrom,
        where: sqlWs, // = array
        //group: '',
        order: sqlOrder,
        limit: qPageSize,
        offset: offset,
        params: sqlParams
    }
}

// - returns a set of records (filtered and sorted)
function getMany(req, res) {
    logger.logReq('GET MANY', req);
    var m = dico.getModel(req.params.entity);
    if(m){
        var format = req.query.format || null,
            isCSV = format==='csv',
            sq = sqlMany(m, req, isCSV, !isCSV),
            sql = query.sqlQuery(sq);

        query.runQuery(pool, res, sql, sq.params, false, format, isCSV ? csvHeader(m.fields) : null);
    }
}


// --------------------------------------------------------------------------------------
// -----------------    GET CHARTS   ----------------------------------------------------
// --------------------------------------------------------------------------------------

// - returns data for a single charts
function chartField(req, res) {
    logger.logReq('GET CHART', req);

    var m = dico.getModel(req.params.entity),
        fid = req.params.field,
        sqlParams = [],
        sql;

    if(m && fid){
        var f = m.fieldsH[fid];
        if(f){
            if(f.type==='lov' && f.lovtable){
                var clov = f.lovcolumn||'name';
                sql='SELECT t2.id, t2.'+clov+'::text AS label, count(*)::integer AS value'+
                    ' FROM '+m.schemaTable+' AS t1'+
                    ' LEFT JOIN '+schema+'.'+f.lovtable+' AS t2'+
                        ' ON t1.'+f.column+'=t2.id'+
                    ' GROUP BY t2.id, t2.'+clov;
            }else{
                var lbl = '"'+f.column+'"';
                if(f.type==='boolean'){
                    lbl='CASE '+lbl+' WHEN true THEN \'Yes\' ELSE \'No\' END';
                }
                sql='SELECT '+lbl+'::text AS label, count(*)::integer AS value'+
                    ' FROM '+m.schemaTable+' AS t1'+
                    ' GROUP BY '+lbl;
            }
            sql += ' ORDER BY label ASC'+
                   ' LIMIT '+defaultPageSize+';';

            query.runQuery(pool, res, sql, sqlParams, false);
        }
    }else{
        return res.json(logger.errorMsg('Invalid entity or field.', 'chartField'));
    }

}


// --------------------------------------------------------------------------------------
// -----------------    GET ONE   -------------------------------------------------------
// --------------------------------------------------------------------------------------

// - get one record by ID
function getOne(req, res) {
    logger.logReq('GET ONE', req);

    var m = dico.getModel(req.params.entity),
        id = req.params.id;

    if(m && id){
        var sqlParams = [id],
            sql = 'SELECT t1.id, '+sqls.select(m.fields, m.collecs, true)+
                ' FROM '+m.schemaTable+' AS t1'+sqlFromLOVs(m.fields)+
                ' WHERE t1.id=$1'+
                ' LIMIT 1;';

        query.runQuery(pool, res, sql, sqlParams, true);        
    }else{
        return res.json(logger.errorMsg('Invalid entity \''+entity+'\'or field\''+fid+'\'.', 'getOne'));
    }

}


// --------------------------------------------------------------------------------------
// -----------------    INSERT ONE   ----------------------------------------------------
// --------------------------------------------------------------------------------------

// - insert a single record
function insertOne(req, res) {
    // TODO: validation
    logger.logReq('INSERT ONE', req);

    var m = dico.getModel(req.params.entity),
        q = sqls.namedValues(m, req, 'insert');

    if(m && q.names.length){
        var ps = q.names.map(function(n, idx){
            return '$'+(idx+1);
        });
        var sql = 'INSERT INTO '+m.schemaTable+
            ' ("'+q.names.join('","')+'") values('+ps.join(',')+')'+
            ' RETURNING id, '+sqls.select(m.fields, false, null, 'C')+';';

        query.runQuery(pool, res, sql, q.values, true);
    }
}


// --------------------------------------------------------------------------------------
// -----------------    UPDATE ONE    ---------------------------------------------------
// --------------------------------------------------------------------------------------

// - update a single record
function updateOne(req, res) {
    // TODO: validation
    logger.logReq('UPDATE ONE', req);

    var m = dico.getModel(req.params.entity),
        id = req.params.id,
        q = sqls.namedValues(m, req, 'update');

    if(m && id && q.names.length){
        q.values.push(id);
        var sql = 'UPDATE '+m.schemaTable+' AS t1 SET '+ q.names.join(',') + 
            ' WHERE id=$'+q.values.length+
            ' RETURNING id, '+sqls.select(m.fields, false, null, 'U')+';';
        query.runQuery(pool, res, sql, q.values, true);
    }
}


// --------------------------------------------------------------------------------------
// -----------------    DELETE ONE   ----------------------------------------------------
// --------------------------------------------------------------------------------------

// - delete a single record
function deleteOne(req, res) {
    logger.logReq('DELETE ONE', req);

    var m = dico.getModel(req.params.entity),
        id = req.params.id;

    if(m && id){
        // SQL Query > Delete Data
        var sql = 'DELETE FROM '+m.schemaTable+
                ' WHERE id=$1 RETURNING id::integer AS id;';
        query.runQuery(pool, res, sql, [id], true);
    }

}


// --------------------------------------------------------------------------------------
// -----------------    LIST OF VALUES   ------------------------------------------------
// --------------------------------------------------------------------------------------

// - returns list of possible values for a field (usually for dropdown)
function lovOne(req, res) {
    logger.logReq('LOV ONE', req);

    var entity = req.params.entity,
        m = dico.getModel(entity),
        fid = req.params.field,
        f = m.fieldsH[fid];

    if(m){
        if(!f && fid===entity){
            // -- if field id = entity id, then return the entity as a lov
            f = {
                id: 'entity',
                lovcolumn: m.fields[0].column,
                lovtable: m.table
            }
        }
        if(f){
            var col = f.lovcolumn||'name',
                sql = 'SELECT id, "'+col+'" as text';
            if(f.lovicon){
                sql+=',icon'
            }
            sql+=' FROM '+schema+'."'+f.lovtable+
                '" ORDER BY UPPER("'+col+'") ASC LIMIT '+lovSize+';';
            query.runQuery(pool, res, sql, null, false);
        }else{
            res.json(logger.errorMsg('Invalid field \''+fid+'\'.', 'lovOne'));
        }
    }else{
        res.json(logger.errorMsg('Invalid entity \''+entity+'\'.', 'lovOne'));
    }

}


// --------------------------------------------------------------------------------------
// -----------------    SUB-COLLECTIONS   -----------------------------------------------
// --------------------------------------------------------------------------------------

// - returns sub-collection (nested in UI but relational in DB)
function collecOne(req, res) {
    logger.logReq('GET ONE-COLLEC', req);

    var m = dico.getModel(req.params.entity),
        collecId = req.params.collec,
        collec = m.collecsH[collecId]
        pId = parseInt(req.query.id, 10);

    if(m && collec){
        var sqlParams = [pId];
        var sql = 'SELECT t1.id, '+sqls.select(collec.fields)+
                ' FROM '+schema+'."'+collec.table+'" AS t1'+//lovs.from+
                ' WHERE t1."'+collec.column+'"=$1'+
                ' ORDER BY t1.id'+//t1.position, t1.id
                ' LIMIT '+defaultPageSize+';';

        query.runQuery(pool, res, sql, sqlParams, false);        
    }else{
        return res.json(logger.errorMsg('Invalid parameters.', 'collecOne'));
    }
}


// --------------------------------------------------------------------------------------
// --------------------------------------------------------------------------------------

module.exports = {

    // - CRUD
    getMany: getMany,
    getOne: getOne,
    insertOne: insertOne,
    updateOne: updateOne,
    deleteOne: deleteOne,

    // - Sub-collections
    getCollec: collecOne,

    // - Charts
    chartField: chartField,

    // - LOVs (for dropdowns)
    lovOne: lovOne

}
