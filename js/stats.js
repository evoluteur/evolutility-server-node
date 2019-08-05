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

const fnPrep = fields => data => {
    // - nesting data per field
    const pStats = {
        count: data.count,
    }
    if(config.wTimestamp){
        // - last update
        pStats.u_date_max = data.u_date_max
        // - number of updates this week
        pStats.u_date_week_count = data.u_date_week_count
        // - first insert
        pStats.c_date_min = data.c_date_min
    }
    if(config.wComments){
        pStats.nb_comments = data.nb_comments
    }
    fields.forEach((f)=>{
        if(dico.fieldIsNumeric(f)){ 
            let item = {
                min: data[f.id+'_min'],
                max: data[f.id+'_max'],
            }
            if(data[f.id+'_avg']){
                item.avg = data[f.id+'_avg']
            }
            if(data[f.id+'_sum']){
                item.sum = data[f.id+'_sum']
            }
            pStats[f.id] = item
        }
    })
    return pStats
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
        query.runQuery(res, sql, [], true, null, null, fnPrep(m.fields));
    }else{
        errors.badRequest(res, 'Invalid model: "'+mid+'".')
    }
}

// --------------------------------------------------------------------------------------

module.exports = {

    numbers: numbers,

}
