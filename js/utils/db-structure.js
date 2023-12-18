/*!
 * evolutility :: utils/db-structure.js
 * Helper functions for getting the list of tables and columns
 *
 * https://github.com/evoluteur/evolutility
 * (c) 2023 Olivier Giulieri
 */

import { runQuery } from "./query.js";
import { badRequest } from "./errors.js";
import logger from "./logger.js";
import config from "../../config.js";

// - Get list of schema tables
function getTables(req, res) {
  logger.logHeader("REST", "DB", "tables");
  const sql =
    "SELECT table_name as table, table_type as type" +
    ", CASE WHEN is_insertable_into='YES' THEN false ELSE true END as \"readOnly\"" +
    " FROM information_schema.tables" +
    " WHERE table_schema=$1 AND table_name NOT LIKE 'evol%' ORDER BY table_name";
  runQuery(res, sql, [config.schema]);
}

// - Get list of columns for the specified table
function getColumns(req, res) {
  const table = req.params.table;
  logger.logHeader("REST", "DB", table + " columns");
  if (table) {
    const sql =
        "SELECT column_name as column, data_type as type" +
        ", CASE WHEN is_nullable='YES' THEN false ELSE true END as \"required\"" +
        " FROM information_schema.columns AS t1" +
        " WHERE table_name=$1 AND table_schema=$2 ",
      params = [table, config.schema];
    runQuery(res, sql, params);
    //TODO: add comments and constraints
    //sql = 'SELECT * FROM information_schema.constraint_column_usage '+
    //' WHERE table_name=$1 AND table_schema=$2';
  } else {
    badRequest(res, "No table specified.");
  }
}

// -----------------------------------------------------------------------

export default {
  getTables,
  getColumns,
};
