/*!
 * evolutility-server-node :: utils/logger.js
 * Simple formatted console logger (not logging to file).
 *
 * https://github.com/evoluteur/evolutility-server-node
 * (c) 2019 Olivier Giulieri
 */

const config = require('../../config.js'),
	pkg = require('../../package.json'),
	chalk = require('chalk'),
	consoleLog = config.consoleLog;

const asciiArt = 
`  ______          _           _ _ _
 |  ____|        | |      /| (_) (_)/|
 | |____   _____ | |_   _| |_ _| |_| |_ _   _
 |  __\\ \\ / / _ \\| | | | | __| | | | __| | | |
 | |___\\ V / (_) | | |_| | |_| | | | |_| |_| |
 |______\\_/ \\___/|_|\\__,_|\\__|_|_|_|\\__|\\__, |
         ___  ___ _ ____   _____ _ __    __/ |
  ____  / __|/ _ \\ \'__\\ \\ / / _ \\ \'__|  |___/
 |____| \\__ \\  __/ |   \\ V /  __/ |
        |___/\\___|_|    \\_/ \\___|_|    v`+pkg.version

function green(msg){
	if(consoleLog){
		console.error(chalk.green(msg));
	}
}

function maskedConnection(){
	// TODO: is there other patterns?
	const conn = config.connectionString || ''
	const s = conn.split(':')
	if(s.length>1){
		s[2] = '(SECRET)'+s[2].substring(s[2].indexOf('@'))
		return s.join(':')
	}
	return 'N/A'
}

module.exports = {

	ascii_art: asciiArt,

	startupMessage(){
		if(consoleLog){
			console.log(asciiArt)
		}
		console.log('\nEvolutility server listening on port '+config.apiPort + '\n' +
			'\n - REST API:            http://localhost:' + config.apiPort + config.apiPath +
			(config.graphQL ? 
				'\n - GraphQL UI:          http://localhost:' + config.apiPort + '/graphql' 
				: '') +
			'\n - Postgres connection: ' + maskedConnection() +
			'\n - Postgres schema:     ' + config.schema +
			'\n - Documentation:       ' + pkg.homepage)
	},

	logHeader(ql, action, entity){
		console.log(chalk.cyan('\n'+ql+' > '+action+' : '+(entity?entity:'')))
	},

	logReq(title, req, reqType = 'REST'){
		if(consoleLog){
			this.logHeader(reqType, title, req.params && req.params.entity)
			console.log('params = '+JSON.stringify(req.params, null, 2));
			console.log('query = '+JSON.stringify(req.query, null, 2));
			console.log('body = '+JSON.stringify(req.body, null, 2));
		}
	},

	logObject(title, obj){
		if(consoleLog){
			console.log(title+' = '+JSON.stringify(obj, null, 2));
		}
	},

	logSQL(sql, values){
		if(consoleLog){
			console.log('sql = \n'+sql+'\n');
			if(values){
				this.logObject('values = \n', values)
			}
		}
	},

	logCount(nbRecords){
		green('Sending '+nbRecords+' records.');
	},
	
	green: green,

	logSuccess(msg){
		green(msg);
	},

	logError(err, moreInfo){
		if(consoleLog){
			console.error(chalk.red(err));
			if(moreInfo){
				console.error(chalk.red(moreInfo))
			}
		}
	},

	errorMsg(err, method){
		if(consoleLog){
			this.logError(err);
			return {
				error: err,
				method: method
			}
		}else{
			return {
				error: 'Error'
			}
		}
	},

};
