/*!
 * evolutility-server-node :: stats.js
 * Some data on the object like the min, max, average, and total for numeric fields.
 *
 * https://github.com/evoluteur/evolutility-server-node
 * (c) 2019 Olivier Giulieri
 */

const dico = require('./utils/dico'),
    query = require('./utils/query'),
    errors = require('./utils/errors.js'),
    logger = require('./utils/logger'),
    config = require('../config.js'),
    ft = dico.fieldTypes

function sqlAggregate(fn, f){
    let num = tcast = '';

    if(f.type===ft.money){
        tcast = '::numeric::float8'
        num = '::numeric'
    }else if(fn==='avg'){
        // - note: update the code below if we add avg for date fields
        tcast = '::numeric::float8'
    }else{ // min, max, sum
        switch(f.type){
            case ft.int:
                tcast = '::'+f.type
                break
            case ft.dec:
                tcast = '::numeric::float8'
                break
        }  
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
    fields.forEach(f => {
        if(dico.fieldIsNumeric(f) && !f.noStats){ 
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
        if(!m.noStats){
            let sql = 'SELECT count(*)::integer AS count';
            const sqlFROM = ' FROM '+m.schemaTable;  

            m.fields.forEach(function(f){
                if(dico.fieldIsNumeric(f) && !f.noStats){
                    if(!dico.fieldIsDateOrTime(f)){
                        sql += sqlAggregate('avg', f)
                    }
                    if(f.type===ft.money || f.type===ft.int){
                        sql += sqlAggregate('sum', f)
                    }
                    sql += sqlAggregate('min', f)
                    sql += sqlAggregate('max', f)
                //}else if(f.type===ft.lov){
                //    sql += ',(select id, count("'+f.column+'")::integer FROM '+m.schemaTable+' GROUP BY id LIMIT 3)'
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
            errors.badRequest(res, 'noStats set on model "'+mid+'".')
        }
    }else{
        errors.badRequest(res, 'Invalid model: "'+mid+'".')
    }
}

// --------------------------------------------------------------------------------------

module.exports = {

    numbers: numbers,

}
