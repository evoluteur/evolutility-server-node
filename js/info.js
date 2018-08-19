/*! *******************************************************
 *
 * evolutility-server-node :: info.js
 *
 * https://github.com/evoluteur/evolutility-server-node
 * (c) 2018 Olivier Giulieri
 ********************************************************* */

var logger = require('./utils/logger'),
    pkg = require('../package.json');


// - returns version number (from package.json)
function version(req, res) {
    logger.logReq('GET VERSION', req);

    return res.json({ version: pkg.version});
}

// --------------------------------------------------------------------------------------

module.exports = {

    version: version,

}
