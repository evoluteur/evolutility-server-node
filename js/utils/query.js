/*! *******************************************************
 *
 * evolutility-server-node :: utils/query.js
 *
 * https://github.com/evoluteur/evolutility-server-node
 * (c) 2019 Olivier Giulieri
 ********************************************************* */

const pg = require('pg'),
    csv = require('csv-express'),
    config = require('../../config.js'),
    parseConnection = require('pg-connection-string').parse,
    errors = require('./errors.js'),
    logger = require('./logger');

const dbConfig = parseConnection(config.connectionString)
dbConfig.max = 10; // max number of clients in the pool 
dbConfig.idleTimeoutMillis = 30000; // max client idle time before being closed

const pool = new pg.Pool(dbConfig);

pool.on('error', function (err, client) {
  console.error('Unexpected error on idle client', err.message, err.stack)
  process.exit(-1)
})

// - run a query and return the result in request
function runQuery(res, sql, values, singleRecord, format, header, fnPrep = null){
    logger.logSQL(sql);

    // Get a Postgres client from the connection pool 
    pool.connect((err, client, done) => {
        // SQL Query > Select Data
        if(!client){
            errors.badRequest(res, 'No Database connection.', 500)
        }
        client.query(sql, values)
            .then(data => {
                done();
                var results = (data && data.rows) ? data.rows : [];
                var nbRecords = results.length; 
                if(format==='csv'){
                    if(nbRecords){
                        if(header){
                            var headers={};
                            for (key in results[0]) {
                                headers[key] = header[key] || key;
                            }
                            results.unshift(headers);
                        }
                        logger.logCount(results.length || 0);
                        return res.csv(results);
                    }
                    return null;    
                }else if(singleRecord){
                    if(fnPrep){
                        logger.logCount(1, true);
                        return res.json(fnPrep(results[0]));
                    }else{
                        logger.logCount(1);
                        return res.json(results.length?results[0]:null);
                    }
                }else{
                    res.setHeader('_count', nbRecords);
                    if(nbRecords && results[0]._full_count){
                        res.setHeader('_full_count', results[0]._full_count);
                        // Remove artificual "_full_count" prop (used to return the total number of records) from every record.
                        // results.forEach(r => {delete r._full_count})
                    }
                    logger.logCount(results.length || 0);
                    return res.json(results);
                }
            })
            .catch(err => {
                console.log(err.stack)
                errors.badRequest(res, 'Database error.', 500)
            })
    })
}

// --------------------------------------------------------------------------------------

module.exports = {

    runQuery: runQuery,

}
