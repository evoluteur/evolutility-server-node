/*!
 * evolutility-server-node :: utils/query.js
 *
 * https://github.com/evoluteur/evolutility-server-node
 * (c) 2019 Olivier Giulieri
 */

const pgp = require('pg-promise')(),
    csv = require('csv-express'),
    config = require('../../config.js'),
    parseConnection = require('pg-connection-string').parse,
    errors = require('./errors.js'),
    logger = require('./logger');

const dbConfig = parseConnection(config.connectionString)
dbConfig.max = 10; // max number of clients in the pool 
dbConfig.idleTimeoutMillis = 30000; // max client idle time before being closed

const db = {}
db.conn = pgp(config.connectionString);

// - run a query and return the result in request
function runQuery(res, sql, values, singleRecord, format, header, fnPrep){
    logger.logSQL(sql);
    // SQL Query > Select Data
    db.conn[singleRecord ? 'one' : 'many'](sql, values)
        .then(data => {
            const results = data || [];
            const nbRecords = results ? results.length : 0; 
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
                return res.csv(null);
            }else if(singleRecord){
                logger.logCount(1);
                if(fnPrep){
                    return res.json(fnPrep(results));
                }
                return res.json(results);
            }else{
                res.setHeader('_count', nbRecords);
                if(nbRecords && results[0]._full_count){
                    res.setHeader('_full_count', results[0]._full_count);
                    // Remove artificual "_full_count" prop (used to return the total number of records) from every record.
                    // results.forEach(r => {delete r._full_count})
                }
                logger.logCount(results.length || 0);
                if(fnPrep){
                    return res.json(fnPrep(results));
                }
                return res.json(results);
            }
        })
        .catch(err => {
            logger.logError(err)
            if(err.code===0){
                if(format==='csv'){
                    // - sending something to avoid empty page in browser
                    return res.csv(singleRecord ? {id: null} : [{id: null}]);
                }else if(singleRecord){
                    return res.json(null);
                }else{
                    return res.json([]);
                }
            }
            return errors.badRequest(res, 'Database error - '+err.message, 500)
        })
}

// --------------------------------------------------------------------------------------

module.exports = {

    db: db,
    runQuery: runQuery,

}
