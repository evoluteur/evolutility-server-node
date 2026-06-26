/*!
 * evolutility-server-node :: utils/query.ts
 *
 * https://github.com/evoluteur/evolutility-server-node
 * (c) 2026 Olivier Giulieri
 */

import pgPromise from "pg-promise";
import type { Response } from "express";
import config from "../../config.ts";
import { badRequest } from "./errors.ts";
import logger from "./logger.ts";

const pgp = pgPromise();

export const db = { conn: pgp(config.connectionString) };

function sendCSV(res: Response, rows: Record<string, unknown>[] | null) {
  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", "attachment; filename=export.csv");
  if (!rows || !rows.length) return res.end("");
  const keys = Object.keys(rows[0]);
  const escape = (v: unknown) => {
    const s = v == null ? "" : String(v);
    return s.includes(",") || s.includes('"') || s.includes("\n")
      ? `"${s.replace(/"/g, '""')}"`
      : s;
  };
  const lines = rows.map((row) => keys.map((k) => escape(row[k])).join(","));
  res.end(lines.join("\r\n"));
}

export function promiseQuery(sql: string, values: unknown[] | null, singleRecord: boolean) {
  logger.logSQL(sql);
  return new Promise((resolve, reject) =>
    db.conn[singleRecord ? "one" : "many"](sql, values)
      .then((data) => {
        resolve(data);
      })
      .catch((err: Error) => {
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
  res: Response,
  sql: string,
  values: unknown[],
  singleRecord?: boolean,
  format?: string | null,
  header?: Record<string, string> | null,
  fnPrep?: (data: unknown) => unknown,
) {
  logger.logSQL(sql);
  // SQL Query > Select Data
  db.conn[singleRecord ? "one" : "many"](sql, values)
    .then((data: unknown) => {
      const results = (data || []) as Record<string, unknown>[];
      const nbRecords = results ? results.length : 0;
      if (format === "csv") {
        if (nbRecords) {
          if (header) {
            const keys = Object.keys(results[0]);
            const headerRow: Record<string, unknown> = {};
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
        if (nbRecords && (results[0] as Record<string, unknown>)._full_count) {
          res.setHeader("_full_count", (results[0] as Record<string, unknown>)._full_count as string);
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
    .catch((err: { code?: number; message: string }) => {
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
