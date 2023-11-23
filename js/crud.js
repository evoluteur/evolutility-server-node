/*!
 * evolutility-server-node :: crud.js
 * CRUD (Create, Read, Update, Delete) end-points
 *
 * https://github.com/evoluteur/evolutility-server-node
 * (c) 2022 Olivier Giulieri
 */

const moma = require("./utils/model-manager"),
  dico = require("./utils/dico"),
  sqls = require("./utils/sql-select"),
  query = require("./utils/query"),
  errors = require("./utils/errors.js"),
  logger = require("./utils/logger"),
  config = require("../config.js");

const schema = '"' + (config.schema || "evolutility") + '"',
  defaultPageSize = config.pageSize || 50;

// --------------------------------------------------------------------------------------
// -----------------    GET ONE   -------------------------------------------------------
// --------------------------------------------------------------------------------------

function SQLgetOne(id, m, res) {
  let sqlParams = [];
  let sql =
    "SELECT t1." +
    m.pKey +
    " as id, " +
    sqls.select(m.fields, m.collections, true);

  dico.systemFields.forEach(function (f) {
    sql += ", t1." + f.column;
  });
  sql +=
    " FROM " + m.schemaTable + " AS t1" + sqls.sqlFromLOVs(m.fields, schema);
  if (parseInt(id)) {
    sqlParams.push(id);
    sql += " WHERE t1." + m.pKey + "=$1";
  } else {
    const invalidID = 'Invalid id: "' + id + '".';
    return res ? errors.badRequest(res, invalidID) : "ERROR: " + invalidID;
  }
  sql += " LIMIT 1;";
  return {
    sql: sql,
    sqlParams: sqlParams,
  };
}

// - get one record by ID
// - sample url: http://localhost:3000/api/v1/todo/16
function getOne(req, res) {
  logger.logReq("GET ONE", req);
  const id = req.params.id,
    mid = req.params.entity,
    m = moma.getModel(mid);

  if (m) {
    let { sql, sqlParams } = SQLgetOne(id, m, res);
    if (!(sqlParams && sqlParams.length)) {
      sqlParams = null;
    }
    if (m.collections && !req.query.shallow) {
      const qCollecs = m.collections.map((collec) =>
        query.promiseQuery(SQLCollecOne(collec), [id], false)
      );
      qCollecs.unshift(query.promiseQuery(sql, sqlParams, true));
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
      query.runQuery(res, sql, sqlParams, true);
    }
  } else {
    errors.badRequest(res, 'Invalid model: "' + mid + '".');
  }
}

// --------------------------------------------------------------------------------------
// -----------------    INSERT ONE   ----------------------------------------------------
// --------------------------------------------------------------------------------------

// - insert a single record
function insertOne(req, res) {
  logger.logReq("INSERT ONE", req);
  const m = moma.getModel(req.params.entity);
  if (!m) {
    return errors.badRequest(res);
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
        ")" +
        " RETURNING " +
        selectId +
        ", " +
        sqls.select(m.fields, false, null, "C") +
        ";";

      query.runQuery(res, sql, q.values, true);
    } else {
      errors.badRequest(res);
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

// --------------------------------------------------------------------------------------
// -----------------    UPDATE ONE    ---------------------------------------------------
// --------------------------------------------------------------------------------------

// - update a single record
function updateOne(req, res) {
  logger.logReq("UPDATE ONE", req);
  const m = moma.getModel(req.params.entity),
    id = req.params.id,
    q = sqls.namedValues(m, req, "update");

  if (q.invalids) {
    returnInvalid(res, q.invalids);
  } else if (m && id && q.names.length) {
    q.values.push(id);
    const sql =
      "UPDATE " +
      m.schemaTable +
      " AS t1 SET " +
      q.names.join(",") +
      " WHERE " +
      m.pKey +
      "=$" +
      q.values.length +
      " RETURNING " +
      m.pKey +
      " as id, " +
      sqls.select(m.fields, false, null, "U") +
      ";";
    query.runQuery(res, sql, q.values, true);
  } else {
    errors.badRequest(res);
  }
}

// --------------------------------------------------------------------------------------
// -----------------    DELETE ONE / MANY  ----------------------------------------------
// --------------------------------------------------------------------------------------

// - delete a single record
function deleteX(req, res) {
  logger.logReq("DELETE ONE", req);
  const m = moma.getModel(req.params.entity),
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
          ")" +
          " RETURNING " +
          m.pKey +
          "::integer AS id";
        params = ids;
      } else {
        errors.badRequest(res);
        return;
      }
    }
    query.runQuery(res, sql, params, ids.length === 1);
  } else {
    errors.badRequest(res);
  }
}

// --------------------------------------------------------------------------------------
// -----------------    SUB-COLLECTIONS   -----------------------------------------------
// --------------------------------------------------------------------------------------

// - helper for ORDER BY
const collecOrderBy = (collec) =>
  (collec.orderBy ? collec.orderBy : collec.fields[0].column) +
  (collec.order === "desc" ? " DESC" : " ASC");

// - returns sub-collection (nested in UI but relational in DB)
// - sample url: http://localhost:3000/api/v1/winecellar/collec/wine_tasting?id=1
function collecOne(req, res) {
  logger.logReq("GET ONE-COLLEC", req);
  const mid = req.params.entity;
  (m = moma.getModel(mid)),
    (collecId = req.params.collec),
    (collec = m.collecsH[collecId]);

  if (m && collec) {
    const sqlParams = [parseInt(req.query.id, 10)];
    query.runQuery(res, SQLCollecOne(collec), sqlParams, false);
  } else {
    errors.badRequest(res);
  }
}

const SQLCollecOne = (collec) =>
  "SELECT t1.id, " +
  sqls.select(collec.fields, null, "t1") +
  " FROM " +
  schema +
  '."' +
  collec.table +
  '" AS t1' +
  sqls.sqlFromLOVs(collec.fields, schema) +
  ' WHERE t1."' +
  collec.column +
  '"=$1' +
  " ORDER BY t1." +
  collecOrderBy(collec) +
  " LIMIT " +
  defaultPageSize +
  ";";

// --------------------------------------------------------------------------------------

module.exports = {
  // - CRUD
  getOne: getOne,
  SQLgetOne: SQLgetOne,
  insertOne: insertOne,
  updateOne: updateOne,
  deleteX: deleteX,
  // - Sub-collections
  getCollec: collecOne,
};
