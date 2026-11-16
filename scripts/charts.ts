/*!
 * evolutility-server-node :: charts.ts
 * Charts and graph data
 *
 * https://github.com/evoluteur/evolutility-server-node
 * (c) 2026 Olivier Giulieri
 */

import type { Request, Response } from "express";
import {
  fieldTypes as ft,
  fieldInCharts,
  fieldIsNumber,
} from "./utils/dico.ts";
import { getModel } from "./utils/model-manager.ts";
import { runQuery } from "./utils/query.ts";
import { sqlFilters } from "./list.ts";
import { badRequest } from "./utils/errors.ts";
import logger from "./utils/logger.ts";
import config from "../config.ts";
import type { Model } from "../models/types.ts";

const schema = '"' + (config.schema || "evolutility") + '"',
  defaultPageSize = config.pageSize || 50;

// - returns data for a single chart
// - sample REST url: http://localhost:2000/api/v1/todo/chart/category
// - accepts the same filters and search as the list end-point
//   (ex: /todo/chart/category?complete=0&search=abc)
export function getChart(req: Request, res: Response) {
  logger.logReq("GET CHARTS", req);

  const m = getModel(req.params.entity as string),
    fid = req.params.field as string;

  if (!m) {
    return badRequest(res, `Model not found: "${req.params.entity}".`, 404);
  }

  const { sql, params, errorMessage, errorCode } = SQLchartField(
    m,
    fid,
    req.query as Record<string, string | undefined>,
  );

  if (errorMessage) {
    return badRequest(res, errorMessage, errorCode);
  }
  runQuery(res, sql!, params || [], false);
}

function SQLchartField(
  m: Model,
  fid: string,
  query: Record<string, string | undefined> = {},
): {
  sql?: string;
  params?: unknown[];
  errorMessage?: string;
  errorCode?: number;
} {
  const sqlCount = "count(*)::integer AS value";
  let sql: string;

  const f = m.fieldsH![fid];
  if (!f) {
    return { errorMessage: `Field not found: "${fid}".`, errorCode: 404 };
  }
  if (!fieldInCharts(f)) {
    return {
      errorMessage: `Field "${fid}" not allowed in Charts.`,
      errorCode: 400,
    };
  }

  // - filters and search (values are parameterized)
  const params: unknown[] = [];
  const sqlWs = sqlFilters(m, query, params);
  const sqlWhere = sqlWs.length ? " WHERE " + sqlWs.join(" AND ") : "";

  const col = `"${f.column}"`,
    sqlFrom = " FROM " + m.schemaTable + " AS t1";

  if (f.type === ft.lov && f.lovTable) {
    const clov = f.lovColumn || "name";
    const t2PK = `t2.${f.lovKey || "id"}`;
    sql =
      `SELECT ${t2PK}, t2.${clov}::text AS label, ${sqlCount}` +
      `${sqlFrom} LEFT JOIN ${schema}."${f.lovTable}" AS t2 ON t1.${col}=${t2PK}${sqlWhere} GROUP BY ${t2PK}, t2.${clov}`;
  } else if (f.type === ft.bool) {
    const cId = "CASE " + col + " WHEN true THEN 1 ELSE 0 END",
      cLabel = "CASE " + col + " WHEN true THEN 'Yes' ELSE 'No' END";
    sql =
      `SELECT ${cId}::integer AS id, ${cLabel}::text AS label, ${sqlCount}${sqlFrom}${sqlWhere}` +
      ` GROUP BY ${cId}, ${cLabel}`;
  } else if (fieldIsNumber(f)) {
    const numbersColType = f.type === ft.int ? "::integer" : "";
    sql = `SELECT ${col}${numbersColType} AS id, ${col}::text AS label, ${sqlCount}${sqlFrom}${sqlWhere} GROUP BY ${col}`;
  } else {
    // TODO: buckets
    sql = `SELECT ${col}::text AS label, ${sqlCount}${sqlFrom}${sqlWhere} GROUP BY ${col}`;
  }

  sql += " ORDER BY label ASC LIMIT " + defaultPageSize + ";";
  return { sql, params };
}

export default {
  getChart,
  SQLchartField,
};
