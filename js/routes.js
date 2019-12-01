/*!
 * evolutility-server-node :: routes.js
 *
 * https://github.com/evoluteur/evolutility-server-node
 * (c) 2019 Olivier Giulieri
 */

const express = require('express'),
	router = express.Router(),
	logger = require('./utils/logger'),
	upload = require('./utils/upload'),
	config = require('../config'),
	apiPath = config.apiPath,
	crud = require('./crud'),
	list = require('./list'),
	lov = require('./lov'),
	stats = require('./stats'),
	charts = require('./charts'),
	info = require('./info'),
	designer = require('./designer'),
	dbStructure = require('./utils/db-structure');

logger.startupMessage();

/*
// ======  file server ====================================
router.get('/', function(req, res, next) {
  res.sendFile(path.join(__dirname, '../', '../', 'index.html'));
}); */

// ======  APIs DISCOVERY ====================================
if(config.apiInfo){
	router.get(apiPath+'/', info.apis);
}

// ======  Version ====================================
router.get(apiPath+'version', info.version);

// ====== DB: query for list of tables and columns ====================================
if(config.schemaQueries){
	// - all tables (except evol*)
	router.get(apiPath+'db/tables', dbStructure.getTables);
	// - columns of specific table
	router.get(apiPath+'db/:table/columns', dbStructure.getColumns);
}

// ======  Models in DB ====================================
if(config.apiDesigner){
	// - Models
	//router.post(apiPath+'md/model', designer.importModel);
	router.get(apiPath+'md/models', designer.getModels);
	router.get(apiPath+'md/model/:id', designer.getModel);
}

// ======  GET STATS ====================================
router.get(apiPath+':entity/stats', stats.numbers);

// ======  LIST ====================================
// -  GET MANY -
router.get(apiPath+':entity', list.getMany);

// ======  CRUD ====================================
// -  GET ONE   -
router.get(apiPath+':entity/:id', crud.getOne);
// -  INSERT ONE -
router.post(apiPath+':entity', crud.insertOne);
// -  UPDATE ONE  -
router.patch(apiPath+':entity/:id', crud.updateOne);
router.put(apiPath+':entity/:id', crud.updateOne);
router.post(apiPath+':entity/upload/:id', upload.uploadOne);
// -  DELETE ONE -
router.delete(apiPath+':entity/:id', crud.deleteX);
// -  SUB-COLLECTIONS  -
router.get(apiPath+':entity/collec/:collec', crud.getCollec);

// ======  LOV ====================================
router.get(apiPath+':entity/lov/:field', lov.lovOne);

// ======  GET CHARTS ====================================
router.get(apiPath+':entity/chart/:field', charts.chartField);


module.exports = router;
