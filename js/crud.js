/*! *******************************************************
 *
 * evolutility-server-node :: crud.js
 * CRUD (Create, Read, Update, Delete) end-points
 *
 * https://github.com/evoluteur/evolutility-server-node
 * (c) 2019 Olivier Giulieri
 ********************************************************* */

const dico = require('./utils/dico'),
    sqls = require('./utils/sql-select'),
    query = require('./utils/query'),
    errors = require('./utils/errors.js'),
    logger = require('./utils/logger'),
    config = require('../config.js');

const schema = '"'+(config.schema || 'evolutility')+'"',
    defaultPageSize = config.pageSize || 50,
    lovSize = config.lovSize || 100;

// - build the header row for CSV export
const csvHeaderColumn = config.csvHeader || 'label'

function fieldId(f){
    if(csvHeaderColumn==='label'){
        return f.label || f.id
    }
    return f.id
}

function csvHeader(fields){
    let h = {'id': 'ID'}

    fields.forEach((f) => {
        if(f.type==='lov'){
            h[f.id] = fieldId(f)+' ID';
            h[f.id+'_txt'] = fieldId(f);
        }else{
            h[f.id] = fieldId(f);
        }
    });
    return h;
}


// --------------------------------------------------------------------------------------
// -----------------    GET MANY   ------------------------------------------------------
// --------------------------------------------------------------------------------------

// - returns SQL for query returning a set of records
function sqlMany(m, req, allFields, wCount){
    let fs = allFields ? m.fields : m.fields.filter(dico.fieldInMany),
        sqlParams = [];
        if(allFields && fs.length===0){
            fs=allFields.slice(0, 5)
        }
    // ---- SELECTION
    let sqlSel = 't1.id, '+sqls.select(fs, false, true);
    dico.systemManyFields.forEach((f) => {
        sqlSel += ', t1.'+f.column
        if(f.type==='integer'){
            sqlSel += '::integer'
        }
    })
    const sqlFrom = m.schemaTable + ' AS t1' + sqls.sqlFromLOVs(fs, schema);

    // ---- FILTERING
    const sqlOperators = {
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
            if(f && ['select', 'filter', 'search', 'order', 'page', 'pageSize'].indexOf(f.column)<0){
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
                            let w='t1."'+f.column+'"'+sqlOperators[cond];
                            if(cond==='in' && (f.type==='lov' || f.type==='list')){
                                sqlWs.push(w+'('+cs[1].split(',').map(li => {
                                    sqlParams.push(li);
                                    return '$'+sqlParams.length
                                }).join(',')+')'); 
                            }else if(cond==='0'){ // false
                                sqlWs.push('('+w+'false OR t1."'+f.column+'" IS NULL)');
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
    if(req.query.search){ // TODO: use FTS
        var sqlWsSearch = [];

        if(!m.searchFields){
            console.error('No searchFields are specified in model.')
        }else{
            logger.logObject('search fields', m.searchFields);
            var sqlP='"'+sqlOperators.ct+'$'+(sqlParams.length+1);
            m.searchFields.forEach(function(fid){
                sqlWsSearch.push('t1."'+m.fieldsH[fid].column+sqlP);
            });
            if(sqlWsSearch.length){
                sqlParams.push('%'+req.query.search.replace(/%/g, '\%')+'%');
                sqlWs.push('('+sqlWsSearch.join(' OR ')+')');
            }
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
                    return sqls.sqlOrderFields(m, qo)
                }).join(',');
            }
        }else{
            sqlOrder+=sqls.sqlOrderFields(m, qOrder);
        }
    }else if(fs.length){
        sqlOrder = '2 ASC';
    }

    // ---- LIMITING & PAGINATION
    let offset=0,
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
    const mid = req.params.entity,
        m = dico.getModel(mid);
    
    if(m){
        const format = req.query.format || null,
            isCSV = format==='csv',
            sq = sqlMany(m, req, isCSV, !isCSV),
            sql = query.sqlQuery(sq);

        query.runQuery(res, sql, sq.params, false, format, isCSV ? csvHeader(m.fields) : null);
    }else{
        errors.badRequest(res, 'Invalid model: "'+mid+'".')
    }
}

// --------------------------------------------------------------------------------------
// -----------------    GET ONE   -------------------------------------------------------
// --------------------------------------------------------------------------------------

// - get one record by ID
function getOne(req, res) {
    logger.logReq('GET ONE', req);

    const mid = req.params.entity,
        m = dico.getModel(mid),
        id = req.params.id;

    if(m){
        let sqlParams = []
        let sql = 'SELECT t1.id, '+sqls.select(m.fields, m.collections, true)

        dico.systemFields.forEach(function(f){
            sql += ', t1.'+f.column
        })
        sql += ' FROM '+m.schemaTable+' AS t1'+sqls.sqlFromLOVs(m.fields, schema)
        if(parseInt(id)){
            sqlParams.push(id)
            sql += ' WHERE t1.id=$1'
        }else{
            return errors.badRequest(res, 'Invalid id: "'+id+'".')
        }
        sql += ' LIMIT 1;';
        if(!sqlParams.length){
            sqlParams = null
        }
        query.runQuery(res, sql, sqlParams, true);        
    }else{
        errors.badRequest(res, 'Invalid model: "'+mid+'".')
    }
}


// --------------------------------------------------------------------------------------
// -----------------    INSERT ONE   ----------------------------------------------------
// --------------------------------------------------------------------------------------

// - insert a single record
function insertOne(req, res) {
    logger.logReq('INSERT ONE', req);

    const m = dico.getModel(req.params.entity),
        q = sqls.namedValues(m, req, 'insert');

    if(q.invalids){
        returnInvalid(res, q.invalids)
    }else if(m && q.names.length){
        const ps = q.names.map((n, idx) => '$'+(idx+1));
        const sql = 'INSERT INTO '+m.schemaTable+
            ' ("'+q.names.join('","')+'") values('+ps.join(',')+')'+
            ' RETURNING id, '+sqls.select(m.fields, false, null, 'C')+';';

        query.runQuery(res, sql, q.values, true);
    }else{
        errors.badRequest(res)
    }
}

function returnInvalid(res, invalids){
    logger.logObject('invalids', invalids)
    res.status('500')
    res.statusMessage = 'Invalid record'
    return res.json({
        error: 'Invalid record',
        invalids: invalids
    });
}

// --------------------------------------------------------------------------------------
// -----------------    UPDATE ONE    ---------------------------------------------------
// --------------------------------------------------------------------------------------

// - update a single record
function updateOne(req, res) {
    logger.logReq('UPDATE ONE', req);

    const m = dico.getModel(req.params.entity),
        id = req.params.id,
        q = sqls.namedValues(m, req, 'update');
    
    if(q.invalids){
        returnInvalid(res, q.invalids)
    }else if(m && id && q.names.length){
        q.values.push(id);
        let sql = 'UPDATE '+m.schemaTable+' AS t1 SET '+ q.names.join(',') + 
            ' WHERE id=$'+q.values.length+
            ' RETURNING id, '+sqls.select(m.fields, false, null, 'U')+';';

        query.runQuery(res, sql, q.values, true);
    }else{
        errors.badRequest(res)
    }
}


// --------------------------------------------------------------------------------------
// -----------------    DELETE ONE   ----------------------------------------------------
// --------------------------------------------------------------------------------------

// - delete a single record
function deleteOne(req, res) {
    logger.logReq('DELETE ONE', req);

    const m = dico.getModel(req.params.entity),
        id = req.params.id;

    if(m && id){
        // SQL Query > Delete Data
        var sql = 'DELETE FROM '+m.schemaTable+
                ' WHERE id=$1 RETURNING id::integer AS id;';
                
        query.runQuery(res, sql, [id], true);
    }else{
        errors.badRequest(res)
    }
}


// --------------------------------------------------------------------------------------
// -----------------    LIST OF VALUES   ------------------------------------------------
// --------------------------------------------------------------------------------------

// - returns list of possible values for a field (usually for dropdown)
function lovOne(req, res) {
    logger.logReq('LOV ONE', req);

    const mid = req.params.entity,
        m = dico.getModel(mid),
        fid = req.params.field
    let f = m.fieldsH[fid];

    if(m){
        if(!f && fid===mid){
            // -- if field id = entity id, then use the entity itself as the lov
            f = {
                id: 'entity',
                lovcolumn: m.fields[0].column,
                lovtable: m.table
            }
        }
        if(f){
            const col = f.lovcolumn||'name'
            let sql = 'SELECT id, "'+col+'" as text'
            
            if(f.lovicon){
                sql+=',icon'
            }
            sql+=' FROM '+schema+'."'+f.lovtable+
                '" ORDER BY UPPER("'+col+'") ASC LIMIT '+lovSize+';';
            query.runQuery(res, sql, null, false);
        }else{
            res.json(logger.errorMsg('Invalid field \''+fid+'\'.', 'lovOne'));
        }
    }else{
        errors.badRequest(res)
    }
}


// --------------------------------------------------------------------------------------
// -----------------    SUB-COLLECTIONS   -----------------------------------------------
// --------------------------------------------------------------------------------------

// - returns sub-collection (nested in UI but relational in DB)
function collecOne(req, res) {
    logger.logReq('GET ONE-COLLEC', req);

    const mid = req.params.entity
        m = dico.getModel(mid),
        collecId = req.params.collec,
        collec = m.collecsH[collecId],
        pId = parseInt(req.query.id, 10);

    if(m && collec){
        const sqlParams = [pId],
            sql = 'SELECT t1.id, '+sqls.select(collec.fields)+
                ' FROM '+schema+'."'+collec.table+'" AS t1'+
                ' WHERE t1."'+collec.column+'"=$1'+
                ' ORDER BY t1.'+collec.fields[0].column+(collec.order==='desc'?' DESC':' ASC')+
                ' LIMIT '+defaultPageSize+';';

        query.runQuery(res, sql, sqlParams, false);        
    }else{
        errors.badRequest(res)
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

    // - LOVs (for dropdowns)
    lovOne: lovOne

}
