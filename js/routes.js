/*! *******************************************************
 *
 * evolutility-server :: utils/routes.js
 *
 * https://github.com/evoluteur/evolutility-server
 * Copyright (c) 2016 Olivier Giulieri
 ********************************************************* */

var express = require('express');
var router = express.Router();
//var {router} = require('express').Router();
var logger = require('./utils/logger');
var orm = require('./utils/orm');

var config = require('../config');
var apiPath = config.apiPath;


logger.ascii_art();

/*
// ======  file server ====================================
router.get('/', function(req, res, next) {
  res.sendFile(path.join(__dirname, '../', '../', 'client', 'views', 'index.html'));
}); */

// ======  GET MANY ====================================
router.get(apiPath+':objectId', orm.getMany);

// ======  GET ONE   ====================================index-
router.get(apiPath+':objectId/:id', orm.getOne);

// ======  INSERT ONE ====================================
router.post(apiPath+':objectId', orm.insertOne);

// ======  UPDATE ONE  ====================================
router.patch(apiPath+':objectId/:id', orm.updateOne);
router.put(apiPath+':objectId/:id', orm.updateOne);

// ======  DELETE ONE ====================================
router.delete(apiPath+':objectId/:id', orm.deleteOne);

module.exports = router;
