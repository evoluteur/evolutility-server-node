/*!
 * evolutility-server-node :: lov.js
 * Lists of values
 *
 * https://github.com/evoluteur/evolutility-server-node
 * (c) 2026 Olivier Giulieri
 */

import { getModel } from "./utils/model-manager.js";
import { runQuery } from "./utils/query.js";
import { badRequest } from "./utils/errors.js";
import logger from "./utils/logger.js";
import config from "../config.js";

const schema = '"' + (config.schema || "evolutility") + '"',
  lovSize = config.lovSize || 100;

const searchParam = (search) =>
  search ? "%" + search.replace(/%/g, "%") + "%" : "%";

const SQLlovOne = (f, search) => {
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
export const lovOne = (req, res) => {
  logger.logReq("LOV ONE", req);
  const mid = req.params.entity,
    m = getModel(mid),
    fid = req.params.field,
    search = req.query.search;

  if (!m) {
    return badRequest(res, `Model not found: "${mid}".`, 404);
  }

  let f = m.fieldsH[fid];
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
