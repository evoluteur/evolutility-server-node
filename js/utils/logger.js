/*! *******************************************************
 *
 * evolutility-server-node :: utils/logger.js
 * Simple formatted console logger (not logging to file).
 *
 * https://github.com/evoluteur/evolutility-server-node
 * (c) 2019 Olivier Giulieri
 ********************************************************* */

const config = require('../../config.js'),
	pkg = require('../../package.json'),
	chalk = require('chalk'),
	consoleLog = config.consoleLog;

const asciiArt = 
'  ______          _           _ _ _\n'+
' |  ____|        | |      /| (_) (_)/|\n'+
' | |____   _____ | |_   _| |_ _| |_| |_ _   _\n'+
' |  __\\ \\ / / _ \\| | | | | __| | | | __| | | |\n'+
' | |___\\ V / (_) | | |_| | |_| | | | |_| |_| |\n'+
' |______\\_/ \\___/|_|\\__,_|\\__|_|_|_|\\__|\\__, |\n'+
'         ___  ___ _ ____   _____ _ __    __/ |\n'+
'  ____  / __|/ _ \\ \'__\\ \\ / / _ \\ \'__|  |___/\n' + 
' |____| \\__ \\  __/ |   \\ V /  __/ |\n'+
'        |___/\\___|_|    \\_/ \\___|_|    v'+pkg.version+'\n'

function green(msg){
	if(consoleLog){
		console.error(chalk.green(msg));
	}
}

function maskedConnection(){
	// TODO: is there other patterns?
	const conn = config.connectionString ||''
	const s = conn.split(':')
	if(s.length>1) {
		s[2] = '(SECRET)'+s[2].substring(s[2].indexOf('@'))
		return s.join(':')
	}
	return 'N/A'
}

module.exports = {

	ascii_art: asciiArt,

	startupMessage: function(){
		if(consoleLog){
			console.log(asciiArt)
		}
		console.log('Evolutility server listening on port '+config.apiPort +
			'\n\n - Evolutility API:     http://localhost:' + config.apiPort + config.apiPath +
			'\n - Postgres connection: ' + maskedConnection() +
			'\n - Postgres schema:     ' + config.schema +
			'\n - Documentation:       ' + pkg.homepage)
	},

	logReq: function(title, req){
		if(consoleLog){
			console.log(chalk.cyan('\n--- '+title+' : '+req.params.entity+' ---'));
			console.log('params = '+JSON.stringify(req.params, null, 2));
			console.log('query = '+JSON.stringify(req.query, null, 2));
			console.log('body = '+JSON.stringify(req.body, null, 2));
		}
	},

	logObject: function(title, obj){
		if(consoleLog){
			console.log(title+' = '+JSON.stringify(obj, null, 2));
		}
	},

	logSQL: function (sql, values){
		if(consoleLog){
			console.log('sql = \n'+sql+'\n');
			if(values){
				this.logObject('values = \n', values)
			}
		}
	},

	logCount: function(nbRecords){
		green('Sending '+nbRecords+' records.');
	},
	
	green: green,

	logSuccess: function(msg){
		green(msg);
	},

	logError: function(err, modeInfo){
		if(consoleLog){
			console.error(chalk.red(err));
			if(modeInfo){
				console.error(chalk.red(modeInfo))
			}
		}
	},

	errorMsg: function(err, method){
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
