/*! *******************************************************
 *
 * evolutility-server-node :: utils/routes.js
 *
 * https://github.com/evoluteur/evolutility-server-node
 * (c) 2016 Olivier Giulieri
 ********************************************************* */

var express = require('express');
var router = express.Router();
var logger = require('./utils/logger');
var orm = require('./utils/orm');
var upload = require('./utils/upload');

var config = require('../config');
var apiPath = config.apiPath;


logger.ascii_art();

/*
// ======  file server ====================================
router.get('/', function(req, res, next) {
  res.sendFile(path.join(__dirname, '../', '../', 'index.html'));
}); */

// ======  GET MANY ====================================
router.get(apiPath+':entity', orm.getMany);

// ======  GET ONE   ====================================
router.get(apiPath+':entity/:id', orm.getOne);

// ======  INSERT ONE ====================================
router.post(apiPath+':entity', orm.insertOne);

// ======  UPDATE ONE  ====================================
router.patch(apiPath+':entity/:id', orm.updateOne);
router.put(apiPath+':entity/:id', orm.updateOne);
router.post(apiPath+':entity/upload/:id', upload.uploadOne);

// ======  DELETE ONE ====================================
router.delete(apiPath+':entity/:id', orm.deleteOne);

// ======  GET CHARTS ====================================
router.get(apiPath+':entity/chart/:field', orm.chartField);

// ======  LOV ===========================================
router.get(apiPath+':entity/lov/:field', orm.lovOne);

// ======  SUB-COLLECTIONS  ==============================
router.get(apiPath+':entity/collec/:collec', orm.getCollec);


module.exports = router;
