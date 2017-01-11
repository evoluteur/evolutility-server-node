/*! *******************************************************
 *
 * evolutility-server-node :: utils/query.js
 *
 * https://github.com/evoluteur/evolutility-server-node
 * (c) 2017 Olivier Giulieri
 ********************************************************* */

var csv = require('express-csv'),
    logger = require('./logger');

// - show error in console
function consoleError(err){
    if(err){
        logger.logError(err);
    }
}

// - concatenate SQL query
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
        var query = values ? client.query(sql, values, consoleError) : client.query(sql, consoleError);

        // Stream results back one row at a time
        query.on('row', function(row) {
            results.push(row);
        });

        // After all data is returned, close connection and return results
        query.on('end', function() {
            var nbRecords = results.length;
            done();
            if(format==='csv'){
                if(header){
                    var headers={};
                    for (key in results[0]) {
                        headers[key] = header[key] || key;
                    }
                    results.unshift(headers);
                }
                logger.logCount(results.length || 0);
                return res.csv(results);
            }else if(singleRecord){
                logger.logCount(results.length || 0);
                return res.json(results.length?results[0]:null);
            }else{
                res.setHeader('_count', nbRecords);
                if(nbRecords && results[0]._full_count){
                    res.setHeader('_full_count', results[0]._full_count);
                }else{
                    res.setHeader('_full_count', 0);
                }
                logger.logCount(results.length || 0);
                return res.json(results);
            }
        });

        // Handle Errors
        if(err) {
            logger.logError(err);
            done();
            res.status(500).send('Something broke!');
        }

    });

}

// --------------------------------------------------------------------------------------
// --------------------------------------------------------------------------------------

module.exports = {

    runQuery: runQuery,
    sqlQuery: sqlQuery

}
