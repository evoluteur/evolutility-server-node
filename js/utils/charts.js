
// --------------------------------------------------------------------------------------
// -----------------    GET CHARTS   ----------------------------------------------------
// --------------------------------------------------------------------------------------

var dico = require('./dico'),
    logger = require('./logger'),
    query = require('./query'),
    config = require('../../config.js');

var schema = '"'+(config.schema || 'evol_demo')+'"',
    defaultPageSize = config.pageSize || 50;

// - returns data for a single charts
function chartField(req, res) {
    logger.logReq('GET CHART', req);

    var m = dico.getModel(req.params.entity),
        fid = req.params.field,
        sqlParams = [],
        sql;
    var sqlCount = 'count(*)::integer AS value';

    if(m && fid){
        var f = m.fieldsH[fid];
        if(f){
            var col = '"'+f.column+'"',
                sqlFrom = ' FROM '+m.schemaTable+' AS t1';
            if(f.type==='lov' && f.lovtable){
                var clov = f.lovcolumn||'name';

                sql='SELECT t2.id, t2.'+clov+'::text AS label, '+sqlCount+
                    sqlFrom+
                    ' LEFT JOIN '+schema+'."'+f.lovtable+'" AS t2'+
                        ' ON t1.'+col+'=t2.id'+
                    ' GROUP BY t2.id, t2.'+clov;
            }else if(f.type==='boolean'){
                var cId = 'CASE '+col+' WHEN true THEN 1 ELSE 0 END',
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

module.exports = {

    chartField: chartField,

}
