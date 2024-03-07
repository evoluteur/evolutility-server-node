/*!
 * evolutility-server-node :: stats.js
 * Some data on the object like the min, max, average, and total for numeric fields.
 *
 * https://github.com/evoluteur/evolutility-server-node
 * (c) 2024 Olivier Giulieri
 */

import { getModel } from "./utils/model-manager.js";
import dico, { fieldTypes as ft } from "./utils/dico.js";
import { runQuery } from "./utils/query.js";
import errors from "./utils/errors.js";
import logger from "./utils/logger.js";
import config from "../config.js";

function sqlAggregate(fn, f) {
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

const fnPrep = (fields) => (data) => {
  // - nesting data per field
  const pStats = {
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
  const nullsCounts = {};
  fields.forEach((f) => {
    if (!f.noStats) {
      if (dico.fieldIsNumeric(f)) {
        let item = {
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
export function getStats(req, res) {
  logger.logReq("GET STATS", req);

  const mid = req.params.entity,
    m = getModel(mid);
  let sqlNulls = [];

  const sqlFROM = " FROM " + m.schemaTable;
  const sqlNull = (f) =>
    `(SELECT COUNT(*)::integer AS "${f.id}_nulls" ${sqlFROM} WHERE "${f.column}" IS NULL)`;
  const sqlNullorEmpty = (f) =>
    `(SELECT COUNT(*)::integer AS "${f.id}_nulls" ${sqlFROM} WHERE "${f.column}" IS NULL OR "${f.column}"='')`;

  if (m) {
    if (!m.noStats) {
      let sql = "SELECT count(*)::integer AS count";

      m.fields.forEach(function (f) {
        if (!f.noStats) {
          if (dico.fieldIsNumeric(f)) {
            if (!dico.fieldIsDateOrTime(f)) {
              sql +=
                sqlAggregate("avg", f) +
                sqlAggregate("stddev", f) +
                sqlAggregate("variance", f);
            }
            if (f.type === ft.money || f.type === ft.int) {
              // TODO: should we? (it may be too big a number)
              sql += sqlAggregate("sum", f);
            }
            sql += sqlAggregate("min", f);
            sql += sqlAggregate("max", f);
            //}else if(f.type===ft.lov){
            //    sql += ',(select id, count("'+f.column+'")::integer FROM '+m.schemaTable+' GROUP BY id LIMIT 3)'
            sqlNulls.push(sqlNull(f));
          } else {
            if (f.type === "lov" || f.type === "boolean") {
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
        // - number of comments
        sql += ", sum(nb_comments::integer)::integer AS nb_comments";
      }
      sql += ", " + sqlNulls.join(", ");
      sql += sqlFROM;
      runQuery(res, sql, [], true, null, null, fnPrep(m.fields));
    } else {
      errors.badRequest(res, 'noStats=true on model "' + mid + '".', 401);
    }
  } else {
    errors.badRequest(res, 'Model not found: "' + mid + '".', 404);
  }
}

// --------------------------------------------------------------------------------------

export default {
  getStats,
};
