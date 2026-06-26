/*!
 * evolutility-server-node :: routes.ts
 *
 * https://github.com/evoluteur/evolutility-server-node
 * (c) 2026 Olivier Giulieri
 */

import express from "express";
import logger from "./utils/logger.ts";
import { uploadOne } from "./utils/upload.ts";
import config from "../config.ts";
import crud from "./crud.ts";
import { getMany } from "./list.ts";
import { lovOne } from "./lov.ts";
import { getStats } from "./stats.ts";
import { getChart } from "./charts.ts";
import { getAPIs, getVersion } from "./info.ts";
import { getOpenAPISpec } from "./openapi.ts";
import designer from "./designer.ts";
import dbStructure from "./utils/db-structure.ts";

const apiPath = config.apiPath;
const router = express.Router();

logger.startupMessage();

// #region ===== OpenAPI spec ====================================
router.get(apiPath + "openapi.json", getOpenAPISpec);
// #endregion

// #region ===== GET STATS ====================================
router.get(apiPath + ":entity/stats", getStats);
// #endregion

// #region ===== LIST ====================================
// -  GET MANY -
router.get(apiPath + ":entity", getMany);
// #endregion

// #region ===== CRUD ====================================
// -  GET ONE   -
router.get(apiPath + ":entity/:id", crud.getOne);
// -  INSERT ONE -
router.post(apiPath + ":entity", crud.insertOne);
// -  UPDATE ONE  -
router.patch(apiPath + ":entity/:id", crud.updateOne);
router.put(apiPath + ":entity/:id", crud.updateOne);
router.post(apiPath + ":entity/upload/:id", uploadOne);
// -  DELETE ONE -
router.delete(apiPath + ":entity/:id", crud.deleteX);
// -  SUB-COLLECTIONS  -
router.get(apiPath + ":entity/collec/:collec", crud.getCollectionsOne);
// #endregion

// #region ===== LOV ====================================
router.get(apiPath + ":entity/lov/:field", lovOne);
//TODO:
// lovUpdate
// lovAdd
// #endregion

// #region ===== GET CHARTS ====================================
router.get(apiPath + ":entity/chart/:field", getChart);
// #endregion

// #region ===== APIs DISCOVERY ====================================
if (config.apiInfo) {
  router.get(apiPath + "/", getAPIs);
}
// #endregion

// #region ===== Version ====================================
router.get(apiPath + "version", getVersion);
// #endregion

// #region =====DB: query for list of tables and columns ====================================
if (config.schemaQueries) {
  // - all tables (except evol*)
  router.get(apiPath + "db/tables", dbStructure.getTables);
  // - columns of specific table
  router.get(apiPath + "db/:table/columns", dbStructure.getColumns);
}
// #endregion

// #region ===== Models in DB ====================================
if (config.apiDesigner) {
  // - Models
  //router.post(apiPath+'meta/model', designer.importModel);
  router.get(apiPath + "meta/models", designer.getModels);
  router.get(apiPath + "meta/model/:id", designer.getModel);
}

export default router;
