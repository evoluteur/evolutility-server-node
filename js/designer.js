/*! 
 * evolutility-server-node :: designer.js
 * Tools to build models ( = build apps)
 *
 * https://github.com/evoluteur/evolutility-server-node
 * (c) 2019 Olivier Giulieri
*/

const query = require('./utils/query'),
    db = query.db,
    logger = require('./utils/logger'),
    errors = require('./utils/errors'),
    config = require('../config.js');

const schema = '"'+(config.schema || 'evolutility')+'"';
const camelProp = {
    'nameplural': 'namePlural',
    'pkey': 'pKey',
    'readonly': 'readOnly',
    'lovtable': 'lovTable',
    'inmany': 'inMany',
    'minlength': 'minLength',
    'maxlength': 'maxLength',
    'minvalue': 'minValue',
    'maxvalue': 'maxValue',
    'regexp': 'regExp',
    'nocharts': 'noCharts',
}
const camelPropSQL = p => 't1."'+p+'"'+(camelProp[p] ? (' AS "'+camelProp[p]+'"') : '')
const col2id = id => camelProp[id] || id
const objProps = {
    ui: [
        "entity",
        "title",
        //"world_id",
        "active",
        "name",
        "nameplural",
        "icon",
        "description",
        "groups",
        //"c_date",
        //"u_date",
    ],
    db: [
        "entity",
        "table",
        "pkey",
        "active",
    ]
}
/*
const groupProps = [
    "id",
    "type",
    "label",
    "icon",
    "css",
    "fields",
    "width",
    "header",
    "footer",
    "help",
    //"c_date",
    //"u_date",
]
*/
const fldProps = {
    ui: [
        //"fid",
        "label",
        "labelshort",
        "position",
        //"fid",
        //"object_id",
        "type_id",
        //"dbcolumn",
        //"lovTable",
        //"lovColumn",
        "format",
        "width",
        "height",
        "css",
        "required",
        "readonly",
        "inmany",
        "minlength",
        "maxlength",
        "minvalue",
        "maxvalue",
        "regexp",
        "help",
        "nocharts",
        //"c_date",
        //"u_date"
    ],
    db: [
        //"id",
        "label",
        "labelshort",
        "position",
        //"fid",
        //"object_id",
        "type_id",
        //"dbcolumn",
        //"lovTable",
        //"lovColumn",
        "format",
        "required",
        "readonly",
        "inmany",
        "minlength",
        "maxlength",
        "minvalue",
        "maxvalue",
        "regexp",
        "help",
        "nocharts",
        //"c_date",
        //"u_date"
    ],
}

const ftMap = {},
    ftMap2 = {},
    arrFieldTypes = [ 
        // Keep in the same order as DB ids
        "text",
        "textmultiline",
        "boolean",
        "decimal",
        "money",
        "integer",
        "date",
        "time",
        "date-time",
        "image",
        "lov",
        "email",
        "url",
        "list",
        "json",
    ]

arrFieldTypes.forEach((tid, idx) => {
    const id = idx + 1
    ftMap[tid] = id
    ftMap2[''+id] = tid
})

const fieldTypeId2Name = id => ftMap2[id]

const trimField = (f, idx) => {
    let field = {}
    field.id=f.id
    field.position = (idx+1)*10
    fldProps.ui.forEach(prop => {
        const fid = col2id(prop)
        const fp = f[fid] || null
        if(fp!==null){
            field[fid] = fp
        }
    })
    field.type = fieldTypeId2Name(field.type_id)
    delete field.type_id
    return field
}

function getModel(req, res) {
    logger.logReq('GET one MODEL', req);
    var id = req.params.id || 0,
        pkColumn = Number.isInteger(parseInt(id, 10)) ? 'id' : 'entity',
        sqlParams = [id], //t1.entity AS id2, 
        sql, sql2
        
    const modelType = 'ui' //'db'
    
    // - Object
    let cols = objProps[modelType].map(camelPropSQL).join(',')
    sql = 'SELECT entity as id, '+cols+
            ' FROM '+schema+'.evol_object AS t1 WHERE t1.'+pkColumn+'=$1 LIMIT 1';
    cols = fldProps.ui.map(camelPropSQL).join(',')
    sql2 = 'SELECT (CASE WHEN (fid IS NULL) THEN dbcolumn ELSE fid END) AS id, '+ cols +//', t_2.name AS type_name'+
            ' FROM '+schema+'.evol_field AS t1' +
                //' LEFT JOIN "evolutility"."evol_field_type" AS t_2 ON t1."type_id"=t_2.id' +
            ' WHERE object_id=$1'+
            ' ORDER BY position, t1.id DESC';
    logger.logSQL(sql)
    logger.logSQL(sql2)

    let qModel = {}
    db.conn.task(t => {
        return t.one(sql, sqlParams)
            .then(dataM => {
                if(dataM){
                    qModel = dataM
                    return t.many(sql2, sqlParams)
                }else{
                    return null
                }
            })
            .catch(error => {
                return null
            });
    })
    .then((data) => {
        if(data){
            qModel.fields = data.map(trimField)
            return res.json(qModel);
        }else{
            return errors.badRequest(res, 'Invalid model ID.')
        }
    })
    .catch(error => {
        console.log(error)
        return errors.badRequest(res, 'Invalid model ID.')
    });
/*
    // - Field Groups
    sql = 'SELECT t1."'+groupProps.join('", t1."')+'"'+
    ' FROM '+schema+'.evol_field_group AS t1 WHERE id=$1';
    promises.push(runQueriesPromise(sql, sqlParams))

    // TODO: Collection
*/     
}

function getModels(req, res) {
    logger.logReq('GET all MODEL', req);
    //var //pkColumn = Number.isInteger(parseInt(id, 10)) ? 'id' : 'entity',
    var maxModels = 20,
        sqlParams = [true],
        sql, sql2,
        sqlFWOL = ' FROM '+schema+'.evol_object AS t1 WHERE active=true ORDER BY t1.id LIMIT '+maxModels

    const modelType = 'ui' //'db'
    
    // - Object
    let cols = objProps[modelType].map(camelPropSQL).join(',')
    cols = objProps.ui.map(camelPropSQL).join(',')
    sql = 'SELECT entity as id, id as oid, '+cols+sqlFWOL
    cols = fldProps.ui.map(camelPropSQL).join(',')
    sql2 = 'SELECT (CASE WHEN (fid IS NULL) THEN dbcolumn ELSE fid END) AS id, object_id, '+ cols +//', t_2.name AS type_name'+
            ' FROM '+schema+'.evol_field AS t1' +
                //' LEFT JOIN "evolutility"."evol_field_type" AS t_2 ON t1."type_id"=t_2.id' +
            ' WHERE object_id IN (SELECT id '+sqlFWOL+')'+
            ' ORDER BY object_id, t1.position, t1.id';
    logger.logSQL(sql)
    logger.logSQL(sql2)

    let qModel = []
    db.conn.task(t => {
        return t.many(sql)
            .then(dataM => {
                if(dataM){
                    qModel = dataM
                    return t.many(sql2, sqlParams)
                }else{
                    return null
                }
            })
            .catch(error => {
                console.log(error)
                return null
            });
        })
        .then((dataFs) => {
            if(dataFs){
                const mh = {}
                qModel.forEach(m => {
                    m.fields = [ ]
                    mh[''+m.oid] = m
                })
                dataFs.forEach(f => {
                    const m = mh[''+f.object_id]
                    if(m){
                        m.fields.push(trimField(f))
                    }else{
                        console.log('no model '+f.object_id+'.')
                    }
                })
                return res.json(qModel);
            }else{
                return errors.badRequest(res, 'Invalid model ID 2.')
            }
        })
        .catch(error => {
            console.log(error)
            return errors.badRequest(res, 'Invalid model ID 1.')
        });
            
}

module.exports = {
    getModel: getModel, 
    getModels: getModels,
}
