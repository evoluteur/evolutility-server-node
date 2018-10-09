const logger = require('./logger')

function badRequest(res, msg) {
	const errorMsg = msg || "Bad request";
	
	logger.logError(msg)
    res.statusMessage = errorMsg
    res.status(400).end();
}

module.exports = {

    badRequest: badRequest,

}
