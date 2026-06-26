/*!
 * evolutility-server-node :: list.ts
 * Get list of items w/ filtering, and search...
 *
 * https://github.com/evoluteur/evolutility-server-node
 * (c) 2026 Olivier Giulieri
 */

import type { Request, Response } from "express";
import dico, { fieldTypes as ft } from "./utils/dico.ts";
import { getModel } from "./utils/model-manager.ts";
import sqls from "./utils/sql-select.ts";
import { runQuery } from "./utils/query.ts";
import { badRequest } from "./utils/errors.ts";
import logger from "./utils/logger.ts";
import config from "../config.ts";
import type { Field, Model } from "../models/types.ts";

const schema = '"' + (config.schema || "evolutility") + '"',
  defaultPageSize = config.pageSize || 50;

// - build the header row for CSV export
const csvHeaderColumn = config.csvHeader || "label";

const fieldId = (f: Field) => (csvHeaderColumn === "label" ? f.label || f.id : f.id);
const searchParam = (search: string) =>
  search ? "%" + search.replace(/%/g, "%") + "%" : "%";
const sqlOperators: Record<string, string> = {
  eq: "=",
  ne: "<>",
  gt: ">",
  lt: "<",
  gte: ">=",
  lte: "<=",
  ct: " ILIKE ",
  sw: " ILIKE ",
  fw: " ILIKE ",
  in: " IN ",
  0: "=",
  1: "=",
  null: " IS ",
  nn: " IS ",
};

function csvHeader(fields: Field[]) {
  const h: Record<string, string> = { id: "ID" };

  fields.forEach((f) => {
    if (f.type === ft.lov) {
      h[f.id] = fieldId(f) + " ID";
      h[f.id + "_txt"] = fieldId(f);
    } else {
      h[f.id] = fieldId(f);
    }
  });
  return h;
}

// --------------------------------------------------------------------------------------
// -----------------    GET MANY   ------------------------------------------------------
// --------------------------------------------------------------------------------------

// - returns SQL for query returning a set of records
function SQLgetMany(m: Model, req: Request, isCSV: boolean, wCount: boolean) {
  const pKey = m.pKey!;
  let sqlParams: unknown[] = [];
  let fs: Field[];

  // Use typed query params for easier access
  const query = req.query as Record<string, string | undefined>;

  if (isCSV) {
    // - get all fields for CSV download
    fs = m.fields;
  } else {
    // - only get fields w/ inMany=true
    fs = m.fields.filter(dico.fieldInMany);
    // - if no fields are inMany then take the first 5 fields
    if (fs.length === 0) {
      fs = m.fields.slice(0, 5);
    }
  }

  // ---- SELECTION
  let sqlSel = "t1." + pKey + " as id, " + sqls.select(fs, false, true);
  dico.systemFields.forEach((f) => {
    sqlSel += ", t1." + f.column;
    if (f.type === ft.int) {
      sqlSel += "::integer";
    }
  });
  const sqlFrom = m.schemaTable + " AS t1" + sqls.sqlFromLOVs(fs, schema);

  // ---- FILTERING
  const sqlWs: string[] = [];
  for (const n in query) {
    const qVal = query[n];
    if (qVal && qVal !== "") {
      const f = n === pKey ? ({ column: pKey } as Field) : m.fieldsH![n as string];
      if (
        f &&
        ["select", "filter", "search", "order", "page", "pageSize"].indexOf(
          f.column!,
        ) < 0
      ) {
        const cs = qVal.split(".");
        if (cs.length) {
          const cond = cs[0];
          if (sqlOperators[cond]) {
            if ((cond === "eq" || cond === "ne") && dico.fieldIsText(f)) {
              if (cs[1] === "null") {
                if (cond === "eq") {
                  sqlWs.push(' t1."' + f.column + '" IS NULL');
                } else {
                  sqlWs.push(' t1."' + f.column + '" IS NOT NULL');
                }
              } else {
                sqlParams.push(cs[1]);
                if (
                  f.type === ft.text ||
                  f.type === ft.textml ||
                  f.type === ft.html
                ) {
                  sqlWs.push(
                    'LOWER(t1."' +
                      f.column +
                      '")' +
                      sqlOperators[cond] +
                      "LOWER($" +
                      sqlParams.length +
                      ")",
                  );
                } else {
                  sqlWs.push(
                    `t1."${f.column}"${sqlOperators[cond]}$${sqlParams.length}`,
                  );
                }
              }
            } else {
              let w = 't1."' + f.column + '"' + sqlOperators[cond];
              if (cond === "in" && (f.type === ft.lov || f.type === ft.list)) {
                // - in list
                sqlWs.push(
                  w +
                    "(" +
                    cs[1]
                      .split(",")
                      .map((li) => {
                        sqlParams.push(li);
                        return "$" + sqlParams.length;
                      })
                      .join(",") +
                    ")",
                );
              } else if (cond === "0") {
                // - false
                sqlWs.push("(" + w + 'false OR t1."' + f.column + '" IS NULL)');
              } else if (cond === "1") {
                // - true
                sqlWs.push(w + "true");
              } else if (cond === "nn") {
                // - not empty
                sqlWs.push(" NOT " + w + "NULL");
              } else if (cond === "null") {
                // - empty
                sqlWs.push(w + "NULL");
              } else {
                if (cond === "nct") {
                  // not contains
                  sqlParams.push(`%${cs[1]}%`);
                  sqlWs.push(` NOT ${w}$${sqlParams.length}`);
                } else {
                  if (cond === "sw") {
                    // - start with
                    sqlParams.push(cs[1] + "%");
                  } else if (cond === "fw") {
                    // - finishes with
                    sqlParams.push("%" + cs[1]);
                  } else if (cond === "ct") {
                    // - contains
                    sqlParams.push(`%${cs[1]}%`);
                  } else {
                    sqlParams.push(cs[1]);
                  }
                  sqlWs.push(w + "$" + sqlParams.length);
                }
              }
            }
          } else {
            console.log('Invalid condition "' + cond + '"');
          }
        }
      }
    }
  }

  // ---- SEARCHING
  if (query.search) {
    // TODO: use FTS
    if (!m.searchFields) {
      console.error("No searchFields are specified in model.");
    } else {
      const sqlWsSearch: string[] = [];
      const sqlP = '"' + sqlOperators.ct + "$" + (sqlParams.length + 1);
      m.searchFields.forEach(function (fid) {
        sqlWsSearch.push('t1."' + m.fieldsH![fid].column + sqlP);
      });
      if (sqlWsSearch.length) {
        sqlParams.push(searchParam(query.search));
        sqlWs.push("(" + sqlWsSearch.join(" OR ") + ")");
      }
    }
  }

  // ---- RECORD COUNT (added to selection)
  if (wCount) {
    if (sqlWs.length) {
      sqlSel +=
        ",(SELECT count(*) FROM " + m.schemaTable + ")::integer AS _full_count";
    } else {
      sqlSel += ",count(*) OVER()::integer AS _full_count";
    }
  }

  // ---- ORDERING
  let sqlOrder = "";
  const qOrder = query.order || null;
  if (qOrder) {
    if (qOrder.indexOf(",") > -1) {
      const qOs = qOrder.split(",");
      if (qOs) {
        sqlOrder += qOs.map((qo) => sqls.sqlOrderFields(m, qo)).join(",");
      }
    } else {
      sqlOrder += sqls.sqlOrderFields(m, qOrder);
    }
  } else if (fs.length) {
    sqlOrder = "2 ASC";
  }

  // ---- SIZE & PAGINATION
  let offset = 0,
    qPage = parseInt(query.page || "0", 10) || 0,
    qPageSize: number;

  if (query.format === "csv") {
    qPageSize = config.csvSize || 1000;
  } else {
    qPageSize = parseInt(query.pageSize || String(defaultPageSize), 10);
    if (qPage) {
      offset = qPage * qPageSize;
    }
  }

  return {
    select: sqlSel,
    from: sqlFrom,
    where: sqlWs, // = array
    //group: '',
    order: sqlOrder,
    limit: qPageSize,
    offset,
    params: sqlParams,
  };
}

// - returns a set of records (filtered and sorted)
// - sample url: http://localhost:3000/api/v1/todo?category=eq.3&order=title.asc&pageSize=50
export const getMany = async (req: Request, res: Response) => {
  logger.logReq("GET MANY", req);
  const mid = req.params.entity as string,
    m = getModel(mid);

  if (m) {
    const format = (req.query.format as string) || null,
      isCSV = format === "csv",
      sq = SQLgetMany(m, req, isCSV, !isCSV),
      sql = sqls.sqlQuery(sq);

    runQuery(
      res,
      sql,
      sq.params,
      false,
      format,
      isCSV ? csvHeader(m.fields) : null,
    );
  } else {
    badRequest(res, 'Model not found: "' + mid + '".', 404);
  }
};

export default {
  getMany,
  SQLgetMany,
};
