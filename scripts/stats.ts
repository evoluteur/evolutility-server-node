/*!
 * evolutility-server-node :: stats.ts
 * Some data on the object like the min, max, average, and total for numeric fields.
 *
 * https://github.com/evoluteur/evolutility-server-node
 * (c) 2026 Olivier Giulieri
 */

import type { Request, Response } from "express";
import { getModel } from "./utils/model-manager.ts";
import dico, { fieldTypes as ft } from "./utils/dico.ts";
import { runQuery } from "./utils/query.ts";
import { badRequest } from "./utils/errors.ts";
import logger from "./utils/logger.ts";
import config from "../config.ts";
import type { Field } from "../models/types.ts";

function sqlAggregate(fn: string, f: Field) {
  let num = "";
  let tcast = "";

  if (f.type === ft.money) {
    tcast = "::numeric::float8";
    num = "::numeric";
  } else if (fn === "avg") {
    // - note: update the code below if we add avg for date fields
    tcast = "::numeric::float8";
  } else {
    // min, max, sum
    switch (f.type) {
      case ft.int:
        tcast = "::" + f.type;
        break;
      case ft.dec:
        tcast = "::numeric::float8";
        break;
    }
  }
  return ", " + fn + `("${f.column}"${num})${tcast} AS "${f.id}_${fn}"`;
}

const fnPrep = (fields: Field[]) => (data: Record<string, unknown>) => {
  // - nesting data per field
  const pStats: Record<string, unknown> = {
    count: data.count,
  };
  if (config.wTimestamp) {
    // - last update
    pStats.u_date_max = data.u_date_max;
    // - number of updates this week
    pStats.u_date_week_count = data.u_date_week_count;
    // - first insert
    pStats.c_date_min = data.c_date_min;
  }
  if (config.wComments) {
    pStats.nb_comments = data.nb_comments;
  }
  const nullsCounts: Record<string, unknown> = {};
  fields.forEach((f) => {
    if (!f.noStats) {
      if (dico.fieldIsNumeric(f)) {
        const item: Record<string, unknown> = {
          min: data[f.id + "_min"],
          max: data[f.id + "_max"],
        };
        ["avg", "sum", "stddev", "variance"].forEach((k) => {
          const fn = f.id + "_" + k;
          if (data[fn] !== undefined) {
            item[k] = data[fn];
          }
        });
        pStats[f.id] = item;
      }
      const fn = f.id + "_nulls";
      nullsCounts[f.id] = data[fn];
    }
  });
  pStats.nulls = nullsCounts;
  return pStats;
};

// - returns a summary on a single table
export function getStats(req: Request, res: Response) {
  logger.logReq("GET STATS", req);

  const mid = req.params.entity as string,
    m = getModel(mid);

  if (!m) {
    return badRequest(res, `Model not found: "${mid}".`, 404);
  }
  if (m.noStats) {
    return badRequest(res, `noStats=true on model "${mid}".`, 400);
  }

  const sqlFROM = " FROM " + m.schemaTable;
  const sqlNull = (f: Field) =>
    `(SELECT COUNT(*)::integer AS "${f.id}_nulls" ${sqlFROM} WHERE "${f.column}" IS NULL)`;
  const sqlNullorEmpty = (f: Field) =>
    `(SELECT COUNT(*)::integer AS "${f.id}_nulls" ${sqlFROM} WHERE "${f.column}" IS NULL OR "${f.column}"='')`;

  let sql = "SELECT count(*)::integer AS count";
  const sqlNulls: string[] = [];

  m.fields.forEach((f) => {
    if (!f.noStats) {
      if (dico.fieldIsNumeric(f)) {
        if (!dico.fieldIsDateOrTime(f)) {
          sql +=
            sqlAggregate("avg", f) +
            sqlAggregate("stddev", f) +
            sqlAggregate("variance", f);
        }
        if (f.type === ft.money || f.type === ft.int) {
          sql += sqlAggregate("sum", f);
        }
        sql += sqlAggregate("min", f);
        sql += sqlAggregate("max", f);
        sqlNulls.push(sqlNull(f));
      } else {
        if (f.type === ft.lov || f.type === ft.bool) {
          sqlNulls.push(sqlNull(f));
        } else {
          sqlNulls.push(sqlNullorEmpty(f));
        }
      }
    }
  });

  if (config.wTimestamp) {
    // - last update
    sql += `, max(${config.updatedDateColumn}) AS u_date_max`;
    // - number of insert & updates this week
    sql +=
      `, (SELECT count(${m.pKey})::integer ${sqlFROM}` +
      " WHERE " +
      config.updatedDateColumn +
      " > NOW() - interval '7 days') AS u_date_week_count" +
      // - first insert
      `, min(${config.createdDateColumn}) AS c_date_min`;
  }
  if (config.wComments) {
    sql += ", sum(nb_comments::integer)::integer AS nb_comments";
  }
  sql += ", " + sqlNulls.join(", ");
  sql += sqlFROM;
  runQuery(res, sql, [], true, null, null, fnPrep(m.fields) as (data: unknown) => unknown);
}

// --------------------------------------------------------------------------------------

export default {
  getStats,
};
