/*! *******************************************************
 *
 * evolutility-server-node :: charts.js
 * Charts and grph data
 *
 * https://github.com/evoluteur/evolutility-server-node
 * (c) 2018 Olivier Giulieri
 ********************************************************* */

const dico = require('./utils/dico'),
    logger = require('./utils/logger'),
    query = require('./utils/query'),
    config = require('../config.js');

const schema = '"'+(config.schema || 'evolutility')+'"',
    defaultPageSize = config.pageSize || 50;

// - returns data for a single charts
function chartField(req, res) {
    logger.logReq('GET CHART', req);

    const m = dico.getModel(req.params.entity),
        fid = req.params.field;
    let sqlParams = [],
        sql;
    const sqlCount = 'count(*)::integer AS value';

    if(m && fid){
        let f = m.fieldsH[fid];
        if(f){
            const col = '"'+f.column+'"',
                sqlFrom = ' FROM '+m.schemaTable+' AS t1';
            if(f.type==='lov' && f.lovtable){
                const clov = f.lovcolumn||'name';

                sql='SELECT t2.id, t2.'+clov+'::text AS label, '+sqlCount+
                    sqlFrom+
                    ' LEFT JOIN '+schema+'."'+f.lovtable+'" AS t2'+
                        ' ON t1.'+col+'=t2.id'+
                    ' GROUP BY t2.id, t2.'+clov;
            }else if(f.type==='boolean'){
                const cId = 'CASE '+col+' WHEN true THEN 1 ELSE 0 END',
                    cLabel = 'CASE '+col+' WHEN true THEN \'Yes\' ELSE \'No\' END';

                sql='SELECT '+cId+'::integer AS id, '+
                        cLabel+'::text AS label, '+sqlCount+
                    sqlFrom+
                    ' GROUP BY '+cId+','+cLabel;
            }else{ // TODO: bukets
                sql='SELECT '+col+'::text AS label, '+sqlCount+
                    sqlFrom+
                    ' GROUP BY '+col;
            }
            sql += ' ORDER BY label ASC'+
                   ' LIMIT '+defaultPageSize+';';

            query.runQuery(res, sql, sqlParams, false);
        }
    }else{
        return res.json(logger.errorMsg('Invalid entity or field.', 'chartField'));
    }
}

// --------------------------------------------------------------------------------------

module.exports = {

    chartField: chartField,

}
