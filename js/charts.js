/*!
 * evolutility-server-node :: charts.js
 * Charts and grph data
 *
 * https://github.com/evoluteur/evolutility-server-node
 * (c) 2019 Olivier Giulieri
 */

const dico = require('./utils/dico'),
    ft = dico.fieldTypes,
    query = require('./utils/query'),
    errors = require('./utils/errors.js'),
    logger = require('./utils/logger'),
    config = require('../config.js');

const schema = '"'+(config.schema || 'evolutility')+'"',
    defaultPageSize = config.pageSize || 50;

// - returns data for a single charts
// - sample REST url: http://localhost:2000/api/v1/todo/chart/category
function chartField(req, res) {
    logger.logReq('GET CHARTS', req);

    const m = dico.getModel(req.params.entity),
        fid = req.params.field,
        {sql, sqlParams = [], errorMessage} = SQLchartField(m, fid)

    if(errorMessage){ 
        //TODO: proper error handling
        errors.badRequest(res, errorMessage)
    }else{
        query.runQuery(res, sql, sqlParams, false); 
    } 
}

function SQLchartField(m, fid) {
    const sqlCount = 'count(*)::integer AS value';
    let sql,
        sqlParams = [],
        withError = null;

    if(m && fid){
        let f = m.fieldsH[fid];
        if(f){
            if(dico.fieldInCharts(f)){
                const col = '"'+f.column+'"',
                    sqlFrom = ' FROM '+m.schemaTable+' AS t1';
                    
                if(f.type===ft.lov && f.lovTable){
                    const clov = f.lovColumn||'name';
                    sql='SELECT t2.id, t2.'+clov+'::text AS label, '+sqlCount+
                        sqlFrom+
                        ' LEFT JOIN '+schema+'."'+f.lovTable+'" AS t2'+
                            ' ON t1.'+col+'=t2.id'+
                        ' GROUP BY t2.id, t2.'+clov;
                }else if(f.type===ft.bool){
                    const cId = 'CASE '+col+' WHEN true THEN 1 ELSE 0 END',
                        cLabel = 'CASE '+col+' WHEN true THEN \'Yes\' ELSE \'No\' END';
                    sql='SELECT '+cId+'::integer AS id, '+
                            cLabel+'::text AS label, '+sqlCount+
                        sqlFrom+
                        ' GROUP BY '+cId+','+cLabel;
                }else if(dico.fieldIsNumber(f)){
                    const numbersColType = f.type===ft.int ? '::integer' : ''
                    sql='SELECT '+col+numbersColType+' AS id, '+col+'::text AS label, '+sqlCount+
                        sqlFrom+
                        ' GROUP BY '+col;
                }else{ // TODO: bukets
                    sql='SELECT '+col+'::text AS label, '+sqlCount+
                        sqlFrom+
                        ' GROUP BY '+col;
                }
                sql += ' ORDER BY label ASC'+
                    ' LIMIT '+defaultPageSize+';';
            }else{
                withError = 'Field "'+fid+'" not allowed in Charts.'
            }
        }else{
            withError = 'Field not found: "'+fid+'".'
        }
    }else{
        withError = 'Invalid model: "'+mid+'".'
    }
    return withError ? {
        hasError: true,
        errorMessage: withError,
    } : {
        sql: sql,
        sqlParams: sqlParams
    }
}

// --------------------------------------------------------------------------------------

module.exports = {

    chartField: chartField,
    SQLchartField: SQLchartField,

}
