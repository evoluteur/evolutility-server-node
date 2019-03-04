/*! *******************************************************
 *
 * evolutility-server-node :: routes.js
 *
 * https://github.com/evoluteur/evolutility-server-node
 * (c) 2018 Olivier Giulieri
 ********************************************************* */

const express = require('express'),
	router = express.Router(),
	logger = require('./utils/logger'),
	upload = require('./utils/upload'),
	config = require('../config'),
	apiPath = config.apiPath,
	crud = require('./crud'),
	stats = require('./stats'),
	charts = require('./charts'),
	info = require('./info');

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

// ======  GET STATS ====================================
router.get(apiPath+':entity/stats', stats.numbers);

// ======  CRUD ====================================
// -  GET MANY ------------------------------------
router.get(apiPath+':entity', crud.getMany);
// -  GET ONE   ------------------------------------
router.get(apiPath+':entity/:id', crud.getOne);
// -  INSERT ONE ------------------------------------
router.post(apiPath+':entity', crud.insertOne);
// -  UPDATE ONE  ------------------------------------
router.patch(apiPath+':entity/:id', crud.updateOne);
router.put(apiPath+':entity/:id', crud.updateOne);
router.post(apiPath+':entity/upload/:id', upload.uploadOne);
// -  DELETE ONE ------------------------------------
router.delete(apiPath+':entity/:id', crud.deleteOne);
// -  LOV -----------------------------------------
router.get(apiPath+':entity/lov/:field', crud.lovOne);
// -  SUB-COLLECTIONS  ------------------------------------
router.get(apiPath+':entity/collec/:collec', crud.getCollec);

// ======  GET CHARTS ====================================
router.get(apiPath+':entity/chart/:field', charts.chartField);


module.exports = router;
