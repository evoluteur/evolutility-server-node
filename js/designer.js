/*!
 * evolutility-server-node :: designer.js
 * Tools to build models ( = build apps)
 *
 * https://github.com/evoluteur/evolutility-server-node
 * (c) 2024 Olivier Giulieri
 */

import { db, promiseQuery } from "./utils/query.js";
import logger from "./utils/logger.js";
import { badRequest } from "./utils/errors.js";
import config from "../config.js";

const schema = '"' + (config.schema || "evolutility") + '"';
const camelProp = {
  nameplural: "namePlural",
  pkey: "pKey",
  readonly: "readOnly",
  lovtable: "lovTable",
  lovcolumn: "lovColumn",
  dbcolumn: "column",
  inmany: "inMany",
  minlength: "minLength",
  maxlength: "maxLength",
  minvalue: "minValue",
  maxvalue: "maxValue",
  regexp: "regExp",
  nocharts: "noCharts",
  nostats: "noStats",
};
const camelPropSQL = (p) =>
  't1."' + p + '"' + (camelProp[p] ? ' AS "' + camelProp[p] + '"' : "");
const col2id = (id) => camelProp[id] || id;
const objCols = {
  ui: [
    "entity",
    "title",
    "world_id",
    "active",
    "name",
    "nameplural",
    "icon",
    //"description",
    "nocharts",
    "nostats",
    //"c_date",
    //"u_date",
  ],
  db: [
    "entity",
    "table",
    "pkey",
    "active",
    "nocharts",
    "nostats",
    //"c_date",
    //"u_date",
  ],
};

const fieldCols = {
  ui: [
    //"fid",
    "label",
    "labelshort",
    "position",
    //"fid",
    //"object_id",
    "type_id",
    //"dbcolumn",
    //"lovTable",
    //"lovColumn",
    "format",
    "width",
    "height",
    "css",
    "required",
    "readonly",
    "inmany",
    "minlength",
    "maxlength",
    "minvalue",
    "maxvalue",
    "regexp",
    "help",
    "nocharts",
    "nostats",
    //"c_date",
    //"u_date"
  ],
  db: [
    //"id",
    "label",
    "labelshort",
    "position",
    //"fid",
    //"object_id",
    "type_id",
    "dbcolumn",
    "lovtable",
    "lovcolumn",
    "format",
    "required",
    "readonly",
    "inmany",
    "minlength",
    "maxlength",
    "minvalue",
    "maxvalue",
    "regexp",
    "help",
    "nocharts",
    "nostats",
    //"c_date",
    //"u_date"
  ],
};

const ftMap = {},
  ftMap2 = {},
  arrFieldTypes = [
    // Keep in the same order as DB ids
    "text",
    "textmultiline",
    "boolean",
    "decimal",
    "money",
    "integer",
    "date",
    "time",
    "date-time",
    "image",
    "lov",
    "email",
    "url",
    "list",
    "json",
  ];

arrFieldTypes.forEach((tid, idx) => {
  const id = idx + 1;
  ftMap[tid] = id;
  ftMap2["" + id] = tid;
});

const fieldTypeId2Name = (id) => ftMap2[id];

const trimField = (f, idx) => {
  let field = {};
  field.id = f.id;
  field.position = (idx + 1) * 10;
  fieldCols.ui.forEach((prop) => {
    const fid = col2id(prop);
    const fp = f[fid] || null;
    if (fp !== null) {
      field[fid] = fp;
    }
  });
  field.type = fieldTypeId2Name(field.type_id);
  delete field.type_id;
  return field;
};

const sqlOrderBy = " ORDER BY object_id, position";
function SQLmodelObject(id, modelType = "ui") {
  // - Object
  const pkColumn = Number.isInteger(parseInt(id, 10)) ? "id" : "entity",
    cols = objCols[modelType].map(camelPropSQL).join(","),
    sql =
      "SELECT entity as id, " +
      cols +
      //', t_2.name as world'+
      " FROM " +
      schema +
      ".evol_object AS t1 " +
      //' LEFT JOIN "evolutility"."evol_world" AS t_2 ON t1."world_id"=t_2.id'+
      " WHERE t1." +
      pkColumn +
      "=$1 LIMIT 1";
  logger.logSQL(sql);
  return sql;
}

const sqlModelCollecs = (modelType = "ui", forAllModels, sqlWhere) => {
  const extraCols = forAllModels ? "object_id, " : "";

  return {
    fields: SQLmodelFields((modelType = "ui"), forAllModels, sqlWhere),
    groups:
      'SELECT gid as "id", ' +
      extraCols +
      "label, width, css, header, footer, fields FROM " +
      schema +
      ".evol_object_group t1 WHERE " +
      sqlWhere +
      sqlOrderBy,
    collections:
      'SELECT cid as "id", ' +
      extraCols +
      'label, dbcolumn as "column", fields FROM ' +
      schema +
      ".evol_object_collec t1 WHERE" +
      sqlWhere +
      sqlOrderBy,
  };
};

function SQLmodelFields(modelType = "ui", forAllModels, whereClause) {
  // - Fields
  const cols = fieldCols.ui.map(camelPropSQL).join(","),
    sql =
      "SELECT (CASE WHEN (fid IS NULL) THEN dbcolumn ELSE fid END) AS id, " +
      (forAllModels ? "object_id, " : "") +
      cols + //', t_2.name AS type_name'+
      " FROM " +
      schema +
      ".evol_field AS t1" +
      //' LEFT JOIN "evolutility"."evol_field_type" AS t_2 ON t1."type_id"=t_2.id' +
      " WHERE " +
      whereClause +
      " ORDER BY position, t1.id DESC";
  logger.logSQL(sql);
  return sql;
}

export function getModel(req, res) {
  logger.logReq("GET one MODEL", req);
  const id = req.params.id || 0,
    sqlParams = [id];

  const modelType = "ui"; //'db'

  let qModel = {};
  db.conn
    .task((t) =>
      t
        .one(SQLmodelObject(id, modelType), sqlParams)
        .then((dataM) => {
          if (dataM && dataM.id) {
            const sqlWhere = " object_id=$1";
            qModel = dataM;
            const sqls = sqlModelCollecs(modelType, true, sqlWhere);
            return Promise.all([
              promiseQuery(sqls.fields, sqlParams, false),
              promiseQuery(sqls.groups, sqlParams, false),
              promiseQuery(sqls.collections, sqlParams, false),
            ]);
          } else {
            return null;
          }
        })
        .catch((err) => {
          return null;
        })
    )
    .then((data) => {
      if (data) {
        console.log(data);
        qModel.fields = data[0].map(trimField);
        if (data[1]) {
          qModel.groups = data[1].map(cleanGroup);
        }
        if (data[2]) {
          qModel.collections = data[2];
        }
        return res.json(qModel);
      } else {
        return badRequest(res, "Invalid model ID.");
      }
    })
    .catch((error) => {
      console.log(error);
      return badRequest(res, 'Error querying for model "' + id + '".');
    });
}

const cleanGroup = (g, idx) => {
  delete g.object_id;
  if (!g.id) {
    g.id = "g_" + idx;
  }
  return g;
};

const worlds = {
  0: "test",
  1: "organizer",
  2: "music",
};

export function getModels(req, res) {
  logger.logReq("GET all MODEL", req);
  //var //pkColumn = Number.isInteger(parseInt(id, 10)) ? 'id' : 'entity',
  var maxModels = 20,
    sql,
    sqlFWOL =
      " FROM " +
      schema +
      ".evol_object AS t1 WHERE active=true ORDER BY t1.id LIMIT " +
      maxModels;

  const modelType = "ui"; //'db'

  // - Object
  let cols = objCols[modelType].map(camelPropSQL).join(",");
  cols = objCols.ui.map(camelPropSQL).join(",");
  sql = "SELECT entity as id, id as oid, " + cols + sqlFWOL;
  logger.logSQL(sql);
  const sqlWhere = "object_id IN (SELECT id " + sqlFWOL + ")";
  cols = fieldCols.ui.map(camelPropSQL).join(",");

  let qModel = [];
  db.conn
    .task((t) => {
      return t
        .many(sql)
        .then((dataM) => {
          if (dataM) {
            qModel = dataM;
            const sqlGetFields = SQLmodelFields(modelType, true, sqlWhere);
            logger.logSQL(sqlGetFields);
            return Promise.all([
              promiseQuery(sqlGetFields, null, false),
              promiseQuery(
                'SELECT gid as "id", object_id, label, width, css, header, footer, fields FROM evolutility.evol_object_group WHERE ' +
                  sqlWhere +
                  sqlOrderBy,
                null,
                false
              ),
              promiseQuery(
                'SELECT cid as "id", object_id, label, dbcolumn as "column", fields FROM evolutility.evol_object_collec WHERE ' +
                  sqlWhere +
                  sqlOrderBy,
                null,
                false
              ),
            ]);
          } else {
            return null;
          }
        })
        .catch((error) => {
          console.log(error);
          return null;
        });
    })
    .then((dataCollecs) => {
      if (dataCollecs) {
        const mh = {};
        qModel.forEach((m) => {
          m.world = worlds[m.world_id];
          m.fields = [];
          m.groups = [];
          m.collections = [];
          mh["" + m.oid] = m;
        });
        dataCollecs[0].forEach((f) => {
          const m = mh["" + f.object_id];
          if (m) {
            m.fields.push(trimField(f));
          } else {
            console.log("field - no model " + f.object_id + ".");
          }
        });
        dataCollecs[1].forEach((g, idx) => {
          const m = mh["" + g.object_id];
          if (m) {
            m.groups.push(cleanGroup(g, idx));
          } else {
            console.log("group - no model " + f.object_id + ".");
          }
        });
        dataCollecs[2].forEach((c) => {
          const m = mh["" + c.object_id];
          if (m) {
            delete c.object_id;
            m.collections.push(c);
          } else {
            console.log("collec - no model " + f.object_id + ".");
          }
        });
        return res.json(qModel);
      } else {
        return badRequest(res, "Invalid model ID.");
      }
    })
    .catch((error) => {
      console.log(error);
      return badRequest(res, "Invalid model ID.");
    });
}

export default {
  getModel,
  getModels,
};
