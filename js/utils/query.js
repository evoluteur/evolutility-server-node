/*! *******************************************************
 *
 * evolutility-server-node :: utils/query.js
 *
 * https://github.com/evoluteur/evolutility-server-node
 * (c) 2016 Olivier Giulieri
 ********************************************************* */

var csv = require('express-csv'),
    logger = require('./logger');

function sqlQuery(q){
    var sql = 'SELECT '+q.select+
        ' FROM '+q.from;
    if(q.where.length){
        sql += ' WHERE '+q.where.join(' AND ');
    }
    if(q.group) {sql += ' GROUP BY '+q.group;}
    if(q.order) {sql += ' ORDER BY '+q.order;}
    sql += ' LIMIT '+(q.limit || defaultPageSize);
    if(q.offset) {sql += ' OFFSET '+parseInt(q.offset, 10);}
    return sql;
}

// - run a query and return the result in request
function runQuery(pool, res, sql, values, singleRecord, format, header){
    var results = [];

    // Get a Postgres client from the connection pool 
    pool.connect(function(err, client, done) {

        // SQL Query > Select Data
        logger.logSQL(sql);
        var query = values ? client.query(sql, values) : client.query(sql);

        // Stream results back one row at a time
        query.on('row', function(row) {
            results.push(row);
        });

        // After all data is returned, close connection and return results
        query.on('end', function() {
            done();
            if(format==='csv'){
                if(header){
                    var headers={};
                    for (key in results[0]) {
                        headers[key] = header[key] || key;
                    }
                    results.unshift(headers);
                    return res.csv(results);
                }else{
                    return res.csv(results);
                }
            }else if(singleRecord){
                return res.json(results[0]);
            }else{
                res.setHeader('_full_count', 'aaaaaa')
                return res.json(results);
            }
        });

        // Handle Errors
        if(err) {
            done();
            res.status(500).send('Something broke!');
            logger.logError(err);
        }

    });

}

// --------------------------------------------------------------------------------------
// --------------------------------------------------------------------------------------

module.exports = {

    runQuery: runQuery,
    sqlQuery: sqlQuery

}
