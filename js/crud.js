/*!
 * evolutility-server-node :: crud.js
 * CRUD (Create, Read, Update, Delete) end-points
 *
 * https://github.com/evoluteur/evolutility-server-node
 * (c) 2024 Olivier Giulieri
 */

import { getModel } from "./utils/model-manager.js";
import { systemFields } from "./utils/dico.js";
import sqls from "./utils/sql-select.js";
import { runQuery, promiseQuery } from "./utils/query.js";
import { badRequest } from "./utils/errors.js";
import logger from "./utils/logger.js";
import config from "../config.js";

const schema = '"' + (config.schema || "evolutility") + '"',
  defaultPageSize = config.pageSize || 50;

// #region --------  GET ONE  -------------------------------------------------------
function SQLgetOne(id, m, res) {
  let sqlParams = [];
  let sql =
    "SELECT t1." +
    m.pKey +
    " as id, " +
    sqls.select(m.fields, m.collections, true);

  systemFields.forEach(function (f) {
    sql += ", t1." + f.column;
  });
  sql +=
    " FROM " + m.schemaTable + " AS t1" + sqls.sqlFromLOVs(m.fields, schema);
  if (parseInt(id)) {
    sqlParams.push(id);
    sql += " WHERE t1." + m.pKey + "=$1";
  } else {
    const invalidID = 'Invalid id: "' + id + '".';
    return res ? badRequest(res, invalidID, 404) : "ERROR: " + invalidID;
  }
  sql += " LIMIT 1;";
  return {
    sql,
    sqlParams,
  };
}

// - get one record by ID
// - sample url: http://localhost:3000/api/v1/todo/16
export function getOne(req, res) {
  logger.logReq("GET ONE", req);
  const id = req.params.id,
    mid = req.params.entity,
    m = getModel(mid);

  if (m) {
    let { sql, sqlParams } = SQLgetOne(id, m, res);
    if (!(sqlParams && sqlParams.length)) {
      sqlParams = null;
    }
    if (m.collections && !req.query.shallow) {
      const qCollecs = m.collections.map((collec) =>
        promiseQuery(SQLCollecOne(collec), [id], false)
      );
      qCollecs.unshift(promiseQuery(sql, sqlParams, true));
      Promise.all(qCollecs)
        .then((data) => {
          if (data && data.length) {
            const d = data[0];
            if (data.length > 1) {
              d.collections = {};
              m.collections.forEach((collec, idx) => {
                d.collections[collec.id] = data[idx + 1];
              });
            }
            res.json(d);
          } else {
            res.json(data);
          }
        })
        .catch((err) => {
          console.log(err);
          res.json(err);
        });
    } else {
      runQuery(res, sql, sqlParams, true);
    }
  } else {
    badRequest(res, 'Model not found: "' + mid + '".', 404);
  }
}
// #endregion

// #region --------  INSERT ONE  ----------------------------------------------------

// - insert a single record
export function insertOne(req, res) {
  logger.logReq("INSERT ONE", req);
  const m = getModel(req.params.entity);
  if (!m) {
    return badRequest(res, "Model not found.", 404);
  } else {
    const pKey = m.pKey || "id",
      q = sqls.namedValues(m, req, "insert");

    if (q.invalids) {
      returnInvalid(res, q.invalids);
    } else if (m && q.names.length) {
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
  }
}

function returnInvalid(res, invalids) {
  logger.logObject("invalids", invalids);
  res.status("500");
  res.statusMessage = "Invalid record";
  return res.json({
    error: "Invalid record",
    invalids: invalids,
  });
}
// #endregion

// #region --------  UPDATE ONE  ---------------------------------------------------

// - update a single record
export function updateOne(req, res) {
  logger.logReq("UPDATE ONE", req);
  const m = getModel(req.params.entity),
    id = req.params.id,
    q = sqls.namedValues(m, req, "update");

  if (q.invalids) {
    returnInvalid(res, q.invalids);
  } else if (m && id && q.names.length) {
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
}
// #endregion

// #region --------  DELETE ONE / MANY  ----------------------------------------------

// - delete a single record
export function deleteX(req, res) {
  logger.logReq("DELETE ONE", req);
  const m = getModel(req.params.entity),
    id = req.params.id;
  let sql = "DELETE FROM " + m.schemaTable + " WHERE " + m.pKey,
    params = null;

  if (m) {
    const ids = id.split(",");
    if (ids.length === 1) {
      // SQL Query > Delete Data
      sql += "=$1 RETURNING " + m.pKey + "::integer AS id;";
      params = [id];
    } else {
      if (ids.length) {
        console.log(ids);
        sql +=
          " IN(" +
          ids.map((i, idx) => "$" + (idx + 1)).join(",") +
          ") RETURNING " +
          m.pKey +
          "::integer AS id";
        params = ids;
      } else {
        badRequest(res);
        return;
      }
    }
    runQuery(res, sql, params, ids.length === 1);
  } else {
    badRequest(res);
  }
}
// #endregion

// #region --------  SUB-COLLECTIONS  -----------------------------------------------

// - helper for ORDER BY
const collecOrderBy = (collec) =>
  (collec.orderBy ? collec.orderBy : collec.fields[0].column) +
  (collec.order === "desc" ? " DESC" : " ASC");

// - returns sub-collection (nested in UI but relational in DB)
// - sample url: http://localhost:3000/api/v1/winecellar/collec/wine_tasting?id=1
export function getCollectionsOne(req, res) {
  logger.logReq("GET ONE-COLLEC", req);
  const mid = req.params.entity;
  (m = getModel(mid)),
    (collecId = req.params.collec),
    (collec = m.collecsH[collecId]);

  if (m && collec) {
    const sqlParams = [parseInt(req.query.id, 10)];
    runQuery(res, SQLCollecOne(collec), sqlParams, false);
  } else {
    badRequest(res);
  }
}

const SQLCollecOne = (collec) =>
  "SELECT t1.id, " +
  sqls.select(collec.fields, null, "t1") +
  ` FROM ${schema}."${collec.table}" AS t1` +
  sqls.sqlFromLOVs(collec.fields, schema) +
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
