/*!
 * evolutility-server-node :: utils/sql-select.ts
 *
 * https://github.com/evoluteur/evolutility-server-node
 * (c) 2026 Olivier Giulieri
 */

import { fieldIsNumber, fieldTypes as ft } from "./dico.ts";
import config from "../../config.ts";
import type { Field, Model, Collection } from "../../models/types.ts";
import type { Request } from "express";

const defaultPageSize = config.pageSize || 50;

// - SQL for a single field/column in update/create/order
const columnName = {
  update: (f: Field, idx: number) => `"${f.column}"=$${idx}`,

  insert: (f: Field) => f.column,

  order: (f: Field) => {
    // - generate sql ORDER BY clause (for 1 field)
    if (f) {
      if (f.type === ft.lov && f.lovTable) {
        return `"${f.id}_txt"`;
      } else {
        const col = 't1."' + f.column + '"';
        if (f.type === ft.bool) {
          return "CASE WHEN " + col + "=TRUE THEN TRUE ELSE FALSE END";
        } else if (f.type === ft.text) {
          // TODO: better way?
          return "LOWER(" + col + ")";
        }
        return col;
      }
    }
    return "";
  },
};

// - concatenate SQL query
function sqlQuery(q: {
  select: string;
  from: string;
  where: string[];
  group?: string;
  order?: string;
  limit?: number;
  offset?: number;
}) {
  let sql = "SELECT " + q.select + " FROM " + q.from;
  if (q.where.length) {
    sql += " WHERE " + q.where.join(" AND ");
  }
  if (q.group) {
    sql += " GROUP BY " + q.group;
  }
  if (q.order) {
    sql += " ORDER BY " + q.order;
  }
  sql += " LIMIT " + (q.limit || defaultPageSize);
  if (q.offset) {
    sql += " OFFSET " + parseInt(String(q.offset), 10);
  }
  return sql;
}

// - returns the SELECT clause for SQL queries
function select(fields: Field[], collecs: Collection[] | false | null | undefined, table: boolean | string | null, action?: string) {
  const sqlfs: string[] = [];
  const tQuote = table ? 't1."' : '"';

  if (fields) {
    fields.forEach(function (f) {
      if (f.type === ft.lov && action !== "C" && action !== "U") {
        sqlfs.push(
          f.t2 +
            "." +
            (f.lovColumn ? f.lovColumn : "name") +
            ` AS "${f.id}_txt"`,
        );
        if (f.lovIcon) {
          sqlfs.push(f.t2 + '.icon AS "' + f.id + '_icon"');
        }
      }
      let sql = tQuote + f.column + '"';
      if (f.type === ft.money) {
        sql += "::numeric::float8";
      }
      if (f.column && f.id != f.column) {
        sql += ` AS "${f.id}"`;
      }
      sqlfs.push(sql);
    });
  }
  return sqlfs.join(",");
}

// - returns lists of names, values, invalids (for Insert or Update)
function namedValues(m: Model, req: Request, action: string) {
  const fnName = columnName[action as keyof typeof columnName] as (f: Field, idx: number) => string | undefined;
  const ns: (string | undefined)[] = [];
  const vs: unknown[] = [];
  const invalids: { id: string; value: unknown; condition: string }[] = [];

  function addInvalid(fid: string, value: unknown, condition: string) {
    invalids.push({
      id: fid,
      value: value,
      condition: condition,
    });
  }

  m.fields.forEach(function (f) {
    if (f.column != "id" && f.type != "formula" && !f.readOnly) {
      let fv: unknown = (req.body as Record<string, unknown>)[f.id];
      if (fv !== null && fv !== undefined) {
        const isNum = fieldIsNumber(f);
        if (fv === "" && isNum) {
          fv = null;
        }
        switch (f.type) {
          case ft.bool:
            if (f.required && fv === "false") {
              addInvalid(f.id, fv, "required");
            }
            vs.push(fv && fv !== "false" ? "TRUE" : "FALSE");
            ns.push(fnName(f, vs.length));
            break;
          case ft.date:
          case ft.time:
          case "datetime": // TODO: date validation
          case ft.lov:
            vs.push(!fv ? null : fv);
            ns.push(fnName(f, vs.length));
            break;
          default:
            if (fieldIsNumber(f)) {
              if (f.min && (fv as number) < f.min) {
                addInvalid(f.id, fv, "min = " + f.min);
              }
              if (f.max && (fv as number) > f.max) {
                addInvalid(f.id, fv, "max = " + f.max);
              }
            }
            if (!isNum) {
              if (f.maxLength && (fv as string).length > f.maxLength) {
                addInvalid(f.id, fv, "maxLength = " + f.maxLength);
              }
              if (f.minLength && (fv as string).length < f.minLength) {
                addInvalid(f.id, fv, "minLength = " + f.minLength);
              }
            }
            vs.push(fv);
            ns.push(fnName(f, vs.length));
        }
      } else if (f.required && action === "insert") {
        addInvalid(f.id, fv, "required");
      }
    }
  });
  if (m.collections) {
    m.collections.forEach(function (f) {
      const fv = (req.body as Record<string, unknown>)[f.id];
      if (fv != null) {
        vs.push(JSON.stringify(fv));
        ns.push(fnName(f as unknown as Field, vs.length));
      }
    });
  }
  return {
    names: ns,
    values: vs,
    invalids: invalids.length > 0 ? invalids : null,
  };
}

// - returns sql (obj) ORDER BY clause for many fields
function sqlOrderFields(m: Model, fullOrder: string) {
  const qos = fullOrder.split(",");

  return qos
    .map(function (qo) {
      const ows = qo.split(".");
      const f = m.fieldsH![ows[0]];
      const col = f ? columnName.order(f) : "id"; // -- sort by id if invalid param

      if (ows.length === 1) {
        return col;
      } else {
        return col + (ows[1] === "desc" ? " DESC" : " ASC");
      }
    })
    .join(",");
}

// - returns SQL list of joined tables for lov fields
function sqlFromLOVs(fields: Field[], schema: string) {
  let sql = "";

  fields.forEach(function (f) {
    if (f.type === "lov" && f.lovTable) {
      sql +=
        ` LEFT JOIN ${schema}."${f.lovTable}" AS ${f.t2}` +
        ` ON t1."${f.column}"=${f.t2}.id`;
    }
  });
  return sql;
}

export default {
  select,
  namedValues,
  sqlOrderFields,
  sqlFromLOVs,
  sqlQuery,
};
