/*!
 * evolutility-server-node :: crud.ts
 * CRUD (Create, Read, Update, Delete) end-points
 *
 * https://github.com/evoluteur/evolutility-server-node
 * (c) 2026 Olivier Giulieri
 */

import type { Request, Response } from "express";
import { getModel } from "./utils/model-manager.ts";
import { systemFields } from "./utils/dico.ts";
import sqls from "./utils/sql-select.ts";
import { runQuery, promiseQuery } from "./utils/query.ts";
import { badRequest } from "./utils/errors.ts";
import logger from "./utils/logger.ts";
import config from "../config.ts";
import type { Model, Collection, Field } from "../models/types.ts";

const schema = '"' + (config.schema || "evolutility") + '"',
  defaultPageSize = config.pageSize || 50;

// #region --------  GET ONE  -------------------------------------------------------
function SQLgetOne(id: string, m: Model) {
  if (!parseInt(id, 10)) {
    return null;
  }
  let sql =
    "SELECT t1." +
    m.pKey +
    " as id, " +
    sqls.select(m.fields, m.collections, true);

  systemFields.forEach(function (f) {
    sql += ", t1." + f.column;
  });
  sql +=
    " FROM " +
    m.schemaTable +
    " AS t1" +
    sqls.sqlFromLOVs(m.fields, schema) +
    " WHERE t1." +
    m.pKey +
    "=$1 LIMIT 1;";

  return { sql, sqlParams: [id] };
}

// - get one record by ID
// - sample url: http://localhost:3000/api/v1/todo/16
export const getOne = async (req: Request, res: Response) => {
  logger.logReq("GET ONE", req);
  const id = req.params.id as string,
    mid = req.params.entity as string,
    m = getModel(mid);

  if (m) {
    const query = SQLgetOne(id, m);
    if (!query) {
      return badRequest(res, `Invalid id: "${id}".`, 400);
    }
    const { sql, sqlParams } = query;
    if (m.collections && !req.query.shallow) {
      const qCollecs = m.collections.map((collec) =>
        promiseQuery(SQLCollecOne(collec), [id], false),
      );
      qCollecs.unshift(promiseQuery(sql, sqlParams, true));
      const data = await Promise.all(qCollecs) as (Record<string, unknown> | null)[];
      if (data && data.length) {
        const d = data[0];
        if (data.length > 1) {
          (d as Record<string, unknown>).collections = {};
          m.collections.forEach((collec, idx) => {
            ((d as Record<string, unknown>).collections as Record<string, unknown>)[collec.id] = data[idx + 1];
          });
        }
        res.json(d);
      } else {
        res.json(data);
      }
    } else {
      runQuery(res, sql, sqlParams, true);
    }
  } else {
    badRequest(res, 'Model not found: "' + mid + '".', 404);
  }
};
// #endregion

// #region --------  INSERT ONE  ----------------------------------------------------

// - insert a single record
export const insertOne = (req: Request, res: Response) => {
  logger.logReq("INSERT ONE", req);
  const m = getModel(req.params.entity as string);
  if (!m) {
    return badRequest(res, "Model not found.", 404);
  }
  const pKey = m.pKey || "id",
    q = sqls.namedValues(m, req, "insert");

  if (q.invalids) {
    returnInvalid(res, q.invalids);
  } else if (q.names.length) {
    const ps = q.names.map((n, idx) => "$" + (idx + 1));
    const selectId = pKey === "id" ? pKey : '"' + pKey + '" as id';
    const sql =
      "INSERT INTO " +
      m.schemaTable +
      ' ("' +
      q.names.join('","') +
      '") values(' +
      ps.join(",") +
      ") RETURNING " +
      selectId +
      ", " +
      sqls.select(m.fields, false, null, "C") +
      ";";

    runQuery(res, sql, q.values, true);
  } else {
    badRequest(res);
  }
};

function returnInvalid(res: Response, invalids: unknown) {
  logger.logObject("invalids", invalids);
  res.status(500);
  return res.json({
    error: "Invalid record",
    invalids: invalids,
  });
}
// #endregion

// #region --------  UPDATE ONE  ---------------------------------------------------

// - update a single record
export const updateOne = (req: Request, res: Response) => {
  logger.logReq("UPDATE ONE", req);
  const m = getModel(req.params.entity as string),
    id = req.params.id as string;

  if (!m) {
    return badRequest(res, "Model not found.", 404);
  }

  const q = sqls.namedValues(m, req, "update");

  if (q.invalids) {
    returnInvalid(res, q.invalids);
  } else if (id && q.names.length) {
    q.values.push(id);
    const sql =
      `UPDATE ${m.schemaTable} AS t1 SET ${q.names.join(",")}` +
      " WHERE " +
      m.pKey +
      "=$" +
      q.values.length +
      " RETURNING " +
      m.pKey +
      " as id, " +
      sqls.select(m.fields, false, null, "U") +
      ";";
    runQuery(res, sql, q.values, true);
  } else {
    badRequest(res);
  }
};
// #endregion

// #region --------  DELETE ONE / MANY  ----------------------------------------------

// - delete a single record
export function deleteX(req: Request, res: Response) {
  logger.logReq("DELETE ONE", req);
  const m = getModel(req.params.entity as string),
    id = req.params.id as string;

  if (!m) {
    return badRequest(res);
  }

  const ids = id.split(",");
  let sql = "DELETE FROM " + m.schemaTable + " WHERE " + m.pKey;
  let params: string[];

  if (ids.length === 1) {
    sql += "=$1 RETURNING " + m.pKey + "::integer AS id;";
    params = [id];
  } else {
    sql +=
      " IN(" +
      ids.map((_i, idx) => "$" + (idx + 1)).join(",") +
      ") RETURNING " +
      m.pKey +
      "::integer AS id";
    params = ids;
  }
  runQuery(res, sql, params, ids.length === 1);
}
// #endregion

// #region --------  SUB-COLLECTIONS  -----------------------------------------------

// - helper for ORDER BY
const collecOrderBy = (collec: Collection) => {
  const firstField = collec.fields![0];
  const col = collec.orderBy
    ? collec.orderBy
    : typeof firstField === "string" ? firstField : firstField.column;
  return col + (collec.order === "desc" ? " DESC" : " ASC");
};

// - returns sub-collection (nested in UI but relational in DB)
// - sample url: http://localhost:3000/api/v1/winecellar/collec/wine_tasting?id=1
export function getCollectionsOne(req: Request, res: Response) {
  logger.logReq("GET ONE-COLLEC", req);
  const mid = req.params.entity as string;
  const m = getModel(mid),
    collecId = req.params.collec as string,
    collec = m && m.collecsH![collecId];

  if (m && collec) {
    const parentId = parseInt(req.query.id as string, 10);
    if (!parentId) {
      return badRequest(res, "Invalid id.", 400);
    }
    runQuery(res, SQLCollecOne(collec), [parentId], false);
  } else {
    badRequest(res);
  }
}

const SQLCollecOne = (collec: Collection) =>
  "SELECT t1.id, " +
  sqls.select(collec.fields as Field[], null, "t1") +
  ` FROM ${schema}."${collec.table}" AS t1` +
  sqls.sqlFromLOVs(collec.fields as Field[], schema) +
  ' WHERE t1."' +
  collec.column +
  '"=$1 ORDER BY t1.' +
  collecOrderBy(collec) +
  " LIMIT " +
  defaultPageSize +
  ";";

// #endregion

export default {
  getOne,
  SQLgetOne,
  insertOne,
  updateOne,
  deleteX,
  getCollectionsOne,
};
