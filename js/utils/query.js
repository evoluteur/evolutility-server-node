/*!
 * evolutility-server-node :: utils/query.js
 *
 * https://github.com/evoluteur/evolutility-server-node
 * (c) 2026 Olivier Giulieri
 */

import pgPromise from "pg-promise";
import pgConnection from "pg-connection-string";
import config from "../../config.js";
import { badRequest } from "./errors.js";
import logger from "./logger.js";

const pgp = pgPromise();

const dbConfig = pgConnection.parse(config.connectionString);
dbConfig.max = 10; // max number of clients in the pool
dbConfig.connectionTimeoutMillis = 60000;
dbConfig.idleTimeoutMillis = 10000; // max client idle time before being closed
export const db = { conn: pgp(config.connectionString) };

function sendCSV(res, rows) {
  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", "attachment; filename=export.csv");
  if (!rows || !rows.length) return res.end("");
  const keys = Object.keys(rows[0]);
  const escape = (v) => {
    const s = v == null ? "" : String(v);
    return s.includes(",") || s.includes('"') || s.includes("\n")
      ? `"${s.replace(/"/g, '""')}"`
      : s;
  };
  const lines = rows.map((row) => keys.map((k) => escape(row[k])).join(","));
  res.end(lines.join("\r\n"));
}

export function promiseQuery(sql, values, singleRecord) {
  logger.logSQL(sql);
  return new Promise((resolve, reject) =>
    db.conn[singleRecord ? "one" : "many"](sql, values)
      .then((data) => {
        resolve(data);
      })
      .catch((err) => {
        if (err.message === "No data returned from the query.") {
          resolve(singleRecord ? null : []);
        } else {
          reject(err);
        }
      }),
  );
}

// - run a query and return the result in request
export function runQuery(
  res,
  sql,
  values,
  singleRecord,
  format,
  header,
  fnPrep,
) {
  logger.logSQL(sql);
  // SQL Query > Select Data
  db.conn[singleRecord ? "one" : "many"](sql, values)
    .then((data) => {
      const results = data || [];
      const nbRecords = results ? results.length : 0;
      if (format === "csv") {
        if (nbRecords) {
          if (header) {
            const keys = Object.keys(results[0]);
            const headerRow = {};
            keys.forEach((key) => (headerRow[key] = header[key] || key));
            results.unshift(headerRow);
          }
          logger.logCount(results.length || 0);
          return sendCSV(res, results);
        }
        return sendCSV(res, null);
      } else if (singleRecord) {
        logger.logCount(1);
        if (fnPrep) {
          return res.json(fnPrep(results));
        }
        return res.json(results);
      } else {
        res.setHeader("_count", nbRecords);
        if (nbRecords && results[0]._full_count) {
          res.setHeader("_full_count", results[0]._full_count);
          // Remove artificual "_full_count" prop (used to return the total number of records) from every record.
          // results.forEach(r => {delete r._full_count})
        }
        logger.logCount(results.length || 0);
        if (fnPrep) {
          return res.json(fnPrep(results));
        }
        return res.json(results);
      }
    })
    .catch((err) => {
      logger.logError(err);
      if (err.code === 0) {
        if (format === "csv") {
          return sendCSV(res, [{ id: null }]);
        } else {
          return res.json(singleRecord ? null : []);
        }
      }
      return badRequest(res, "Database error - " + err.message, 500);
    });
}

export default {
  db,
  runQuery,
  promiseQuery,
};
