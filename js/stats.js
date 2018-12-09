/*! *******************************************************
 * 
 * evolutility-server-node :: stats.js
 * Some data on the object like the min, max, average, and total for numeric fields.
 *
 * https://github.com/evoluteur/evolutility-server-node
 * (c) 2018 Olivier Giulieri
 ********************************************************* */

var dico = require('./utils/dico'),
    query = require('./utils/query'),
    errors = require('./utils/errors.js'),
    logger = require('./utils/logger'),
    config = require('../config.js');

function minMax(fn, f, cast){
    const num = f.type==='money' ? '::numeric' : ''
    let tcast = '';

    if(fn!=='avg'){
        switch(f.type){
            case 'integer':
            case 'decimal':
            case 'money':
                tcast = '::'+f.type
                break
        }        
    }else{
        tcast = '::'+f.type
    }
    return ', '+fn+'('+f.column+num+')'+tcast+' AS '+f.id+'_'+fn
}

// - returns a summary on a single table
function numbers(req, res) {
    logger.logReq('GET STATS', req);

    const mid = req.params.entity,
        m = dico.getModel(mid)
        
    if(m){
        let sql = 'SELECT count(*)::integer AS count';
        const sqlFROM = ' FROM '+m.schemaTable;  
            
        m.fields.forEach(function(f){
            if(dico.fieldIsNumeric(f)){
                if(!dico.fieldIsDateOrTime(f)){
                    sql += minMax('avg', f)
                }
                if(f.type==='money' || f.type==='integer'){
                    sql += minMax('sum', f)
                }
                sql += minMax('min', f)
                sql += minMax('max', f)
            }
        })
        if(config.wTimestamp){
            sql += ', max(u_date) AS u_date_max'
            sql += ', (SELECT count(id)::integer '+sqlFROM+' WHERE u_date > NOW() - interval \'7 days\')  AS u_date_week_count'
        }
        if(config.wComments){
            sql += ', sum(nb_comments::int)::int AS nb_comments'
        }
        sql += sqlFROM
        query.runQuery(res, sql, [], true);
    }else{
        errors.badRequest(res, 'Invalid model: "'+mid+'".')
    }
}

// --------------------------------------------------------------------------------------

module.exports = {

    numbers: numbers,

}
