/*! 
 * evolutility-server-node :: lov.js
 * Lists of values
 *
 * https://github.com/evoluteur/evolutility-server-node
 * (c) 2020 Olivier Giulieri
*/

const moma = require('./utils/model-manager'),
    query = require('./utils/query'),
    errors = require('./utils/errors.js'),
    logger = require('./utils/logger'),
    config = require('../config.js');

const schema = '"'+(config.schema || 'evolutility')+'"',
    lovSize = config.lovSize || 100;

const searchParam = search => search ? '%'+search.replace(/%/g, '\%')+'%' : '%'

// - returns list of possible values for a field (usually for dropdown)
// - sample url: http://localhost:2000/api/v1/todo/lov/category
function lovOne(req, res) {
    logger.logReq('LOV ONE', req);
    const mid = req.params.entity,
        m = moma.getModel(mid),
        fid = req.params.field,
        search = req.query.search
    let f = m.fieldsH[fid];

    if(m){
        if(!f && fid===mid){
            // -- if field id = entity id, then use the entity itself as the lov
            f = {
                id: 'entity',
                lovColumn: m.fields[0].column,
                lovTable: m.table
            }
        }
        if(f){
            const col = f.lovColumn || 'name'
            let params = null
            let sql = SQLlovOne(f, search)
            if(search){
                params = [searchParam(search)]
            }
            query.runQuery(res, sql, params, false);
        }else{
            res.json(logger.errorMsg('Invalid field "'+fid+'".', 'lovOne'));
        }
    }else{
        errors.badRequest(res)
    }
}

const SQLlovOne = (f, search) => {
    const col = f.lovColumn || 'name'
    let sql = 'SELECT id, "'+col+'" as text'
    if(f.lovIcon){
        sql+=', icon'
    }
    sql += ' FROM '+schema+'."'+f.lovTable+'"'
    if(search){
        sql += ' WHERE "'+col+'" ILIKE $1'
    }
    sql += ' ORDER BY UPPER("'+col+'") ASC LIMIT '+lovSize+';';
    return sql
}

module.exports = {
    // - LOVs (for dropdowns)
    lovOne: lovOne,
    SQLlovOne: SQLlovOne,
}
