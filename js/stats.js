/*!
 * evolutility-server-node :: stats.js
 * Some data on the object like the min, max, average, and total for numeric fields.
 *
 * https://github.com/evoluteur/evolutility-server-node
 * (c) 2019 Olivier Giulieri
 */

var dico = require('./utils/dico'),
    query = require('./utils/query'),
    errors = require('./utils/errors.js'),
    logger = require('./utils/logger'),
    config = require('../config.js');

const ft = dico.fieldTypes

function sqlAggregate(fn, f){
    const num = f.type===ft.money ? '::numeric' : ''
    let tcast = '';

    if(fn!=='avg'){
        switch(f.type){
            case ft.int:
            case ft.dec:
            case ft.money:
                tcast = '::'+f.type
                break
        }        
    }else{
        tcast = '::'+f.type
    }
    return ', '+fn+'("'+f.column+'"'+num+')'+tcast+' AS "'+f.id+'_'+fn+'"'
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
                    sql += sqlAggregate('avg', f)
                }
                if(f.type===ft.money || f.type===ft.int){
                    sql += sqlAggregate('sum', f)
                }
                sql += sqlAggregate('min', f)
                sql += sqlAggregate('max', f)
            }
        })
        if(config.wTimestamp){
            // - last update
            sql += ', max('+config.updatedDateColumn+') AS u_date_max' +
                // - number of insert & updates this week
                ', (SELECT count('+m.pKey+')::integer '+sqlFROM+
                    ' WHERE '+config.updatedDateColumn+' > NOW() - interval \'7 days\')'+
                    ' AS u_date_week_count' +
                // - first insert
                ', min('+config.createdDateColumn+') AS c_date_min' 
        }
        if(config.wComments){
            // - number of comments
            sql += ', sum(nb_comments::integer)::integer AS nb_comments'
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
