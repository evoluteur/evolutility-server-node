/*!
 * evolutility-server-node :: lov.ts
 * Lists of values
 *
 * https://github.com/evoluteur/evolutility-server-node
 * (c) 2026 Olivier Giulieri
 */

import type { Request, Response } from "express";
import { getModel } from "./utils/model-manager.ts";
import { runQuery } from "./utils/query.ts";
import { badRequest } from "./utils/errors.ts";
import logger from "./utils/logger.ts";
import config from "../config.ts";
import type { Field } from "../models/types.ts";

const schema = '"' + (config.schema || "evolutility") + '"',
  lovSize = config.lovSize || 100;

const searchParam = (search: string) =>
  search ? "%" + search.replace(/%/g, "%") + "%" : "%";

const SQLlovOne = (f: Partial<Field>, search?: string) => {
  const col = f.lovColumn || "name";
  let sql = 'SELECT id, "' + col + '" as text';
  if (f.lovIcon) {
    sql += ", icon";
  }
  sql += ` FROM ${schema}."${f.lovTable}"`;
  if (search) {
    sql += ' WHERE "' + col + '" ILIKE $1';
  }
  sql += ' ORDER BY UPPER("' + col + '") ASC LIMIT ' + lovSize + ";";
  return sql;
};

// - returns list of possible values for a field (usually for dropdown)
// - sample url: http://localhost:2000/api/v1/todo/lov/category
export const lovOne = (req: Request, res: Response) => {
  logger.logReq("LOV ONE", req);
  const mid = req.params.entity as string,
    m = getModel(mid),
    fid = req.params.field as string,
    search = req.query.search as string | undefined;

  if (!m) {
    return badRequest(res, `Model not found: "${mid}".`, 404);
  }

  let f: Partial<Field> | undefined = m.fieldsH![fid as string];
  if (!f && fid === mid) {
    // if field id = entity id, use the entity itself as the lov
    f = {
      id: "entity",
      lovColumn: m.fields[0].column,
      lovTable: m.table,
    };
  }
  if (!f) {
    return badRequest(res, `Invalid field "${fid}".`, 400);
  }

  const sql = SQLlovOne(f, search);
  const params = search ? [searchParam(search)] : [];
  runQuery(res, sql, params, false);
};

export default {
  lovOne,
  SQLlovOne,
};
