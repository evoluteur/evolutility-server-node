/*!
 * evolutility-server-node :: designer.ts
 * Tools to build models ( = build apps)
 *
 * https://github.com/evoluteur/evolutility-server-node
 * (c) 2026 Olivier Giulieri
 */

import type { Request, Response } from "express";
import { db, promiseQuery } from "./utils/query.ts";
import logger from "./utils/logger.ts";
import { badRequest } from "./utils/errors.ts";
import config from "../config.ts";

const schema = '"' + (config.schema || "evolutility") + '"';
const camelProp: Record<string, string> = {
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
const camelPropSQL = (p: string) =>
  't1."' + p + '"' + (camelProp[p] ? ' AS "' + camelProp[p] + '"' : "");
const col2id = (id: string) => camelProp[id] || id;
const objCols: Record<string, string[]> = {
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

const fieldCols: Record<string, string[]> = {
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

const ftMap: Record<string, number> = {},
  ftMap2: Record<string, string> = {},
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

const fieldTypeId2Name = (id: string) => ftMap2[id];

const trimField = (f: Record<string, unknown>, idx: number) => {
  const field: Record<string, unknown> = {};
  field.id = f.id;
  field.position = (idx + 1) * 10;
  fieldCols.ui.forEach((prop) => {
    const fid = col2id(prop);
    const fp = f[fid] || null;
    if (fp !== null) {
      field[fid] = fp;
    }
  });
  field.type = fieldTypeId2Name(field.type_id as string);
  delete field.type_id;
  return field;
};

const sqlOrderBy = " ORDER BY object_id, position";
function SQLmodelObject(id: string | number, modelType = "ui") {
  // - Object
  const pkColumn = Number.isInteger(parseInt(String(id), 10)) ? "id" : "entity",
    cols = objCols[modelType].map(camelPropSQL).join(","),
    sql =
      "SELECT entity as id, " +
      cols +
      " FROM " +
      schema +
      ".evol_object AS t1 " +
      " WHERE t1." +
      pkColumn +
      "=$1 LIMIT 1";
  logger.logSQL(sql);
  return sql;
}

const sqlModelCollecs = (modelType = "ui", forAllModels: boolean, sqlWhere: string) => {
  const extraCols = forAllModels ? "object_id, " : "";

  return {
    fields: SQLmodelFields(modelType, forAllModels, sqlWhere),
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

// eslint-disable-next-line no-unused-vars
function SQLmodelFields(modelType = "ui", forAllModels: boolean, whereClause: string) {
  // - Fields
  const cols = fieldCols.ui.map(camelPropSQL).join(","),
    sql =
      "SELECT (CASE WHEN (fid IS NULL) THEN dbcolumn ELSE fid END) AS id, " +
      (forAllModels ? "object_id, " : "") +
      cols +
      " FROM " +
      schema +
      ".evol_field AS t1" +
      " WHERE " +
      whereClause +
      " ORDER BY position, t1.id DESC";
  logger.logSQL(sql);
  return sql;
}

export function getModel(req: Request, res: Response) {
  logger.logReq("GET one MODEL", req);
  const id = (req.params.id as string) || "",
    sqlParams = [id];

  const modelType = "ui"; //'db'

  let qModel: Record<string, unknown> = {};
  db.conn
    .task((t) =>
      t
        .one(SQLmodelObject(id, modelType), sqlParams)
        .then((dataM: Record<string, unknown>) => {
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
        .catch(() => {
          return null;
        }),
    )
    .then((data: unknown) => {
      if (data) {
        const dataArr = data as [unknown[], unknown[], unknown[]];
        console.log(data);
        qModel.fields = (dataArr[0] as Record<string, unknown>[]).map(trimField);
        if (dataArr[1]) {
          qModel.groups = (dataArr[1] as Record<string, unknown>[]).map(cleanGroup);
        }
        if (dataArr[2]) {
          qModel.collections = dataArr[2];
        }
        return res.json(qModel);
      } else {
        return badRequest(res, "Invalid model ID.");
      }
    })
    .catch((error: unknown) => {
      console.log(error);
      return badRequest(res, 'Error querying for model "' + id + '".');
    });
}

const cleanGroup = (g: Record<string, unknown>, idx: number) => {
  delete g.object_id;
  if (!g.id) {
    g.id = "g_" + idx;
  }
  return g;
};

const worlds: Record<number, string> = {
  0: "test",
  1: "organizer",
  2: "music",
  3: "designer",
};

export function getModels(req: Request, res: Response) {
  logger.logReq("GET all MODEL", req);
  let maxModels = 20,
    sql: string,
    sqlFWOL =
      " FROM " +
      schema +
      ".evol_object AS t1 WHERE active=true ORDER BY t1.id LIMIT " +
      maxModels;

  const modelType = "ui"; //'db'

  // - Object
  let cols = objCols[modelType].map(camelPropSQL).join(",");
  sql = "SELECT entity as id, id as oid, " + cols + sqlFWOL;
  logger.logSQL(sql);
  const sqlWhere = "object_id IN (SELECT id " + sqlFWOL + ")";

  let qModel: Record<string, unknown>[] = [];
  db.conn
    .task((t) => {
      return t
        .many(sql)
        .then((dataM: Record<string, unknown>[]) => {
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
                false,
              ),
              promiseQuery(
                'SELECT cid as "id", object_id, label, dbcolumn as "column", fields FROM evolutility.evol_object_collec WHERE ' +
                  sqlWhere +
                  sqlOrderBy,
                null,
                false,
              ),
            ]);
          } else {
            return null;
          }
        })
        .catch((error: unknown) => {
          console.log(error);
          return null;
        });
    })
    .then((dataCollecs: unknown) => {
      if (dataCollecs) {
        const dc = dataCollecs as [Record<string, unknown>[], Record<string, unknown>[], Record<string, unknown>[]];
        const mh: Record<string, Record<string, unknown>> = {};
        qModel.forEach((m) => {
          m.world = worlds[m.world_id as number];
          m.fields = [];
          m.groups = [];
          m.collections = [];
          mh["" + m.oid] = m;
        });
        dc[0].forEach((f) => {
          const m = mh["" + f.object_id];
          if (m) {
            (m.fields as unknown[]).push(trimField(f, 0));
          } else {
            console.log("field - no model " + f.object_id + ".");
          }
        });
        dc[1].forEach((g, idx) => {
          const m = mh["" + g.object_id];
          if (m) {
            (m.groups as unknown[]).push(cleanGroup(g, idx));
          } else {
            console.log("group - no model " + g.object_id + ".");
          }
        });
        dc[2].forEach((c) => {
          const m = mh["" + c.object_id];
          if (m) {
            delete c.object_id;
            (m.collections as unknown[]).push(c);
          } else {
            console.log("collec - no model " + c.object_id + ".");
          }
        });
        return res.json(qModel);
      } else {
        return badRequest(res);
      }
    })
    .catch((error: unknown) => {
      console.log(error);
      return badRequest(res, "Invalid model ID.");
    });
}

export default {
  getModel,
  getModels,
};
