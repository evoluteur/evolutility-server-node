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
import authApi from "./auth-api.ts";
import usersApi from "./users-api.ts";
import { authenticate, authorize } from "./utils/auth.ts";
import dbStructure from "./utils/db-structure.ts";

const apiPath = config.apiPath;
const router = express.Router();

logger.startupMessage();

// - Routes with fixed paths ("version", "meta/models"...) must be declared
// - before the generic ":entity" routes, otherwise ":entity" matches them first.

// #region ===== Login ====================================
// - who is calling (session cookie), then is it allowed (role per route,
// - see requiredRole in utils/auth.ts)
router.use(authenticate);
router.use(authorize);
router.post(apiPath + "auth/login", authApi.loginLimiter, authApi.login);
router.post(apiPath + "auth/logout", authApi.logout);
router.get(apiPath + "auth/me", authApi.me);
// - users (admin role)
router.get(apiPath + "auth/users", usersApi.list);
router.post(apiPath + "auth/users", usersApi.create);
router.patch(apiPath + "auth/users/:id", usersApi.update);
router.delete(apiPath + "auth/users/:id", usersApi.remove);
// #endregion

// #region ===== OpenAPI spec ====================================
router.get(apiPath + "openapi.json", getOpenAPISpec);
// #endregion

// #region ===== APIs DISCOVERY ====================================
if (config.apiInfo) {
  router.get(apiPath, getAPIs);
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

// #region ===== Models (stored as JSON in table "evol_model") ==========
// - read (used by the UI to get the models)
router.get(apiPath + "meta/schema", designer.getSchema);
router.get(apiPath + "meta/models", designer.getModels);
router.get(apiPath + "meta/models/:id/history", designer.getHistory);
router.get(
  apiPath + "meta/models/:id/history/:version",
  designer.getHistoryVersion,
);
router.get(apiPath + "meta/models/:id", designer.getModel);
// - edit (Designer)
if (config.apiDesigner) {
  router.post(apiPath + "meta/models", designer.createModel);
  router.put(apiPath + "meta/models/:id", designer.updateModel);
  router.delete(apiPath + "meta/models/:id", designer.deleteModel);
}
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

export default router;
