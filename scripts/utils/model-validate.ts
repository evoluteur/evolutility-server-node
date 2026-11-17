/*!
 * evolutility-server-node :: utils/model-validate.ts
 * Checks models before they are saved in the database.
 *
 * Models used to be trusted code. Now that they can be edited in the app,
 * every name that ends up in SQL (table, column, lovTable...) is checked here.
 *
 * https://github.com/evoluteur/evolutility-server-node
 * (c) 2026 Olivier Giulieri
 */

import type { Field, Model, Collection } from "../../models/types.ts";

export interface Invalid {
  id: string; // - path of the property (ex: "fields[2].column")
  value: unknown;
  condition: string;
}

export interface ValidationResult {
  invalids: Invalid[];
  warnings: string[];
}

// - SQL identifiers (quoted in SQL, but restricted anyway)
export const identifierRegex = /^[A-Za-z_][A-Za-z0-9_]{0,62}$/;
export const isIdentifier = (v: unknown) =>
  typeof v === "string" && identifierRegex.test(v);

// - "position, t1.id desc" (ORDER BY of collections)
const orderByPart = "(t1\\.)?[A-Za-z_][A-Za-z0-9_]{0,62}( (asc|desc))?";
const orderByRegex = new RegExp(
  `^${orderByPart}(\\s*,\\s*${orderByPart})*$`,
  "i",
);

// - collection ids are not used in SQL (only as keys and in urls)
const collecIdRegex = /^[A-Za-z_][A-Za-z0-9_-]{0,62}$/;

export const fieldTypeIds = [
  "text",
  "textmultiline",
  "boolean",
  "integer",
  "decimal",
  "money",
  "date",
  "datetime",
  "time",
  "lov",
  "list",
  "html",
  "formula",
  "email",
  "image",
  "url",
  "color",
  "hidden",
  "json",
  "document",
];

const maxModelSize = 500 * 1024; // - 500 KB of JSON
const maxFields = 500;

// - remove props added by the API or by model preparation (not part of the model)
export function stripComputed(m: Record<string, unknown>): Model {
  const copy: Record<string, unknown> = {};
  Object.keys(m).forEach((k) => {
    if (!k.startsWith("_")) copy[k] = m[k];
  });
  delete copy.fieldsH;
  delete copy.collecsH;
  delete copy.schemaTable;
  delete copy.searchFields;
  const model = copy as unknown as Model;
  if (Array.isArray(model.fields)) {
    model.fields = model.fields.map((f) => {
      if (f && typeof f === "object") {
        const fc = { ...f };
        delete fc.t2;
        return fc;
      }
      return f;
    });
  }
  return model;
}

// - fill in defaults so the stored model is explicit (table, pKey, columns,
// - lovTable). "otherModels" gives the tables of the objects lov fields point to.
export function normalizeModel(
  input: Model,
  otherModels: Record<string, Model> = {},
): Model {
  const m = stripComputed(
    structuredClone(input) as unknown as Record<string, unknown>,
  );
  if (!m.table && m.id) m.table = m.id;
  if (!m.pKey) m.pKey = "id";
  if (Array.isArray(m.fields)) {
    m.fields.forEach((f) => {
      if (
        f &&
        typeof f === "object" &&
        !f.column &&
        !f.onlyUI &&
        f.type !== "formula"
      ) {
        f.column = f.dbcolumn || f.id;
      }
      if (
        f &&
        typeof f === "object" &&
        (f.type === "lov" || f.type === "list") &&
        !f.lovTable &&
        !f.onlyUI
      ) {
        if (f.object) {
          const om = f.object === m.id ? m : otherModels[f.object];
          if (om) f.lovTable = om.table || om.id;
        } else if (m.table) {
          f.lovTable = m.table + "_" + f.id;
        }
      }
    });
  }
  return m;
}

// - check a model (normalized) against the metamodel and the other models
export function validateModel(
  m: Model,
  otherModels: Record<string, Model> = {},
): ValidationResult {
  const invalids: Invalid[] = [];
  const warnings: string[] = [];
  const bad = (id: string, value: unknown, condition: string) =>
    invalids.push({ id, value, condition });
  const ident = (id: string, value: unknown, required = false) => {
    if (value === undefined || value === null || value === "") {
      if (required) bad(id, value, "required");
    } else if (!isIdentifier(value)) {
      bad(id, value, "letters, digits and _ only (not starting w/ a digit)");
    }
  };
  const str = (id: string, value: unknown) => {
    if (value !== undefined && value !== null && typeof value !== "string") {
      bad(id, value, "must be a string");
    }
  };

  if (!m || typeof m !== "object" || Array.isArray(m)) {
    bad("model", m, "must be an object");
    return { invalids, warnings };
  }
  if (JSON.stringify(m).length > maxModelSize) {
    bad("model", null, `must be smaller than ${maxModelSize / 1024} KB`);
  }

  // - Model
  ident("id", m.id, true);
  ident("table", m.table, true);
  ident("pKey", m.pKey, true);
  ["title", "label", "name", "namePlural", "icon", "world", "titleFunction"].forEach(
    (p) => str(p, (m as unknown as Record<string, unknown>)[p]),
  );
  if (!m.name) bad("name", m.name, "required");
  if (!m.namePlural) bad("namePlural", m.namePlural, "required");

  // - Fields
  const fields = m.fields;
  if (!Array.isArray(fields) || fields.length === 0) {
    bad("fields", fields, "must be a list w/ at least one field");
    return { invalids, warnings };
  }
  if (fields.length > maxFields) {
    bad("fields", fields.length, `at most ${maxFields} fields`);
  }
  const ids = new Set<string>();
  const columns = new Set<string>();
  fields.forEach((f: Field, idx) => {
    const p = `fields[${idx}]`;
    if (!f || typeof f !== "object") {
      bad(p, f, "must be an object");
      return;
    }
    const pf = `${p} (${f.id})`;
    ident(`${p}.id`, f.id, true);
    if (f.id && ids.has(f.id)) bad(`${p}.id`, f.id, "must be unique");
    ids.add(f.id);
    if (!fieldTypeIds.includes(f.type as string)) {
      bad(`${pf}.type`, f.type, "must be one of " + fieldTypeIds.join(", "));
    }
    if (!f.label) bad(`${pf}.label`, f.label, "required");
    str(`${pf}.label`, f.label);
    if (!f.onlyUI && f.type !== "formula") {
      ident(`${pf}.column`, f.column, true);
      if (f.column) {
        if (f.column === m.pKey) {
          bad(`${pf}.column`, f.column, "can't be the primary key");
        } else if (columns.has(f.column)) {
          warnings.push(`Column "${f.column}" is used by several fields.`);
        }
        columns.add(f.column);
      }
    }
    ident(`${pf}.lovTable`, f.lovTable);
    ident(`${pf}.lovColumn`, f.lovColumn);
    ident(`${pf}.lovKey`, f.lovKey);
    if (f.type === "lov" || f.type === "list") {
      if (f.object) {
        if (!otherModels[f.object] && f.object !== m.id) {
          bad(`${pf}.object`, f.object, "must be the id of a model");
        }
      } else if (f.list !== undefined) {
        if (!Array.isArray(f.list)) {
          bad(`${pf}.list`, f.list, "must be a list of { id, text }");
        } else {
          (f.list as { id: unknown; text: unknown; icon?: unknown }[]).forEach(
            (item, i) => {
              if (!item || !Number.isInteger(Number(item.id))) {
                bad(`${pf}.list[${i}].id`, item?.id, "must be an integer");
              }
              if (typeof item?.text !== "string") {
                bad(`${pf}.list[${i}].text`, item?.text, "must be a string");
              }
              if (item?.icon !== undefined) str(`${pf}.list[${i}].icon`, item.icon);
            },
          );
        }
      }
    }
    ["minLength", "maxLength", "min", "max"].forEach((k) => {
      const v = (f as unknown as Record<string, unknown>)[k];
      if (v !== undefined && v !== null && typeof v !== "number") {
        bad(`${pf}.${k}`, v, "must be a number");
      }
    });
    if (f.regExp) {
      try {
        new RegExp(f.regExp);
      } catch {
        bad(`${pf}.regExp`, f.regExp, "must be a valid regular expression");
      }
    }
  });

  if (m.titleField && !ids.has(m.titleField)) {
    bad("titleField", m.titleField, "must be the id of a field");
  }
  if (Array.isArray(m.searchFields)) {
    m.searchFields.forEach((fid, i) => {
      if (!ids.has(fid)) bad(`searchFields[${i}]`, fid, "must be a field id");
    });
  }

  // - Groups (only used by the UI)
  if (m.groups !== undefined) {
    if (!Array.isArray(m.groups)) {
      bad("groups", m.groups, "must be a list");
    } else {
      (m.groups as { id?: string; fields?: unknown[] }[]).forEach((g, idx) => {
        if (!g || !Array.isArray(g.fields)) {
          bad(`groups[${idx}].fields`, g?.fields, "must be a list of field ids");
          return;
        }
        g.fields.forEach((fid) => {
          if (!ids.has(fid as string)) {
            warnings.push(`Group "${g.id || idx}" has an unknown field "${fid}".`);
          }
        });
      });
    }
  }

  // - Collections
  if (m.collections !== undefined) {
    if (!Array.isArray(m.collections)) {
      bad("collections", m.collections, "must be a list");
    } else {
      m.collections.forEach((c: Collection, idx) => {
        const p = `collections[${idx}]`;
        if (!c?.id || !collecIdRegex.test(c.id)) {
          bad(`${p}.id`, c?.id, "letters, digits, _ and - only");
        }
        ident(`${p}.table`, c?.table);
        ident(`${p}.column`, c?.column);
        if (c?.orderBy && !orderByRegex.test(c.orderBy)) {
          bad(`${p}.orderBy`, c.orderBy, 'column names (ex: "position, t1.id desc")');
        }
        if (c?.object && !otherModels[c.object] && c.object !== m.id) {
          bad(`${p}.object`, c.object, "must be the id of a model");
        }
        if (!c?.object && !c?.table) {
          bad(`${p}.object`, c?.object, 'required (or "table")');
        }
      });
    }
  }

  return { invalids, warnings };
}

export default {
  normalizeModel,
  validateModel,
  stripComputed,
  isIdentifier,
};
