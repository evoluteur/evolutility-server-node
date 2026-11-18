/*!
 * evolutility-server-node :: utils/ddl.ts
 * SQL to create tables from models, and to update them when a model changes.
 *
 * https://github.com/evoluteur/evolutility-server-node
 * (c) 2026 Olivier Giulieri
 */

import config from "../../config.ts";
import { fieldTypes as ft } from "./dico.ts";
import type { Field, Model } from "../types.ts";

export const schema = '"' + (config.schema || "evolutility") + '"';

const noTZ = " without time zone";
export const ft_postgreSQL: Record<string, string> = {
  text: "text",
  textmultiline: "text",
  boolean: "boolean",
  integer: "integer",
  decimal: "double precision",
  money: "money",
  date: "date",
  datetime: "timestamp" + noTZ,
  time: "time" + noTZ,
  lov: "integer",
  list: "integer[]", // many values for one field (array of integer for ids in lovTable)
  html: "text",
  email: "text",
  pix: "text",
  //geoloc: 'geolocation',
  doc: "text",
  url: "text",
  color: "text",
  json: "json",
};

export const pgType = (f: Field) => ft_postgreSQL[f.type as string] || "text";

export const createdDateCol = config.createdDateColumn || "created_at";
export const updatedDateCol = config.updatedDateColumn || "update_at";

export const sysColumns: Record<string, boolean> = {
  [createdDateCol]: true,
  [updatedDateCol]: true,
  created_by: true,
  updated_by: true,
  nb_comments: true,
  nb_ratings: true,
  avg_ratings: true,
};

export const stringValue = (v: string | null | undefined) =>
  v ? "'" + String(v).replace(/'/g, "''") + "'" : "NULL";

export const tableName = (m: Model) => m.table || m.id;
export const tableWithSchema = (name: string) => schema + '."' + name + '"';

export const lovTable = (f: Field, tName: string) =>
  f.lovTable ? f.lovTable : tName + "_" + f.id;
const lovTableWithSchema = (f: Field, tName: string) =>
  tableWithSchema(lovTable(f, tName));

const nowColumn = (name: string) =>
  name + " timestamp" + noTZ + " DEFAULT timezone('utc', now())";

export const sqlComment = (target: string, targetName: string, text?: string) =>
  "COMMENT ON " +
  target +
  " " +
  targetName +
  " IS '" +
  (text ? text.replace(/'/g, "") : "") +
  "';\n";

const sqlIndex = (index: string, table: string, column: string) =>
  "CREATE INDEX IF NOT EXISTS idx_" +
  index +
  " ON " +
  table +
  " USING btree (" +
  column +
  ");\n";

// - columns of the fields stored in the model's table
export const dataFields = (m: Model) => {
  const pKey = m.pKey || "id";
  const seen: Record<string, boolean> = {};
  return m.fields.filter((f) => {
    const keep =
      !f.onlyUI &&
      f.column &&
      f.column !== pKey &&
      f.type !== "formula" &&
      !seen[f.column] &&
      !sysColumns[f.column];
    if (keep) seen[f.column!] = true;
    return keep;
  });
};

const needsLovTable = (f: Field) =>
  (f.type === ft.lov || f.type === ft.list) && !f.object;

// - create (if missing) and populate a table for a list of values.
// - Safe to run on an existing table: existing rows are kept.
export function sqlCreatePopulateLOV(
  f: Field,
  tName: string,
  lovIncluded: string[] = [],
) {
  const t = lovTableWithSchema(f, tName);
  const icons = f.lovIcon || false;
  let sql = "";
  if (lovIncluded.indexOf(t) < 0) {
    sql =
      "\nCREATE TABLE IF NOT EXISTS " +
      t +
      "(\n id serial primary key,\n" +
      " name text NOT NULL" +
      (icons ? ",\n icon text" : "") +
      "\n);\n";
    const list = f.list as { id: number; text: string; icon?: string }[];
    if (Array.isArray(list) && list.length) {
      sql +=
        "INSERT INTO " +
        t +
        "(id, name" +
        (icons ? ", icon" : "") +
        ") VALUES\n" +
        list
          .map(
            (item) =>
              "(" +
              Number(item.id) +
              "," +
              stringValue(item.text) +
              (icons ? "," + stringValue(item.icon || "") : "") +
              ")",
          )
          .join(",\n") +
        "\nON CONFLICT (id) DO NOTHING;\n";
      sql +=
        "SELECT setval(pg_get_serial_sequence('" +
        t.replace(/'/g, "''") +
        "', 'id'), (SELECT COALESCE(MAX(id), 1) FROM " +
        t +
        "));\n";
    }
    lovIncluded.push(t);
  }
  return sql;
}

// - column definition for a field
const columnDef = (f: Field, tName: string, forAlter: boolean) => {
  let sql0 = '"' + f.column + '" ' + pgType(f);
  if (f.type === ft.lov) {
    if (f.deleteTrigger && f.lovTable) {
      sql0 +=
        (forAlter ? "" : " NOT NULL") +
        " REFERENCES " +
        tableWithSchema(f.lovTable) +
        "(id) ON DELETE CASCADE";
    }
  } else if (f.required && !forAlter) {
    // - no "not null" when adding a column to a table that may have rows
    sql0 += " not null";
  }
  return sql0;
};

const lovIndex = (f: Field, tName: string) =>
  sqlIndex(
    tName + "_" + f.column!.toLowerCase(),
    tableWithSchema(tName),
    '"' + f.column + '"',
  );

// - trigger function to set the "updated at" column (created when needed,
// - the database may come from evolutility-models or from older scripts)
const updatedAtFunction = schema + ".evol_updated_at";
const sqlUpdatedAtFunction = () => `
CREATE OR REPLACE FUNCTION ${updatedAtFunction}() RETURNS trigger
  LANGUAGE plpgsql
  AS $$
  BEGIN
    NEW."${updatedDateCol}" = timezone('utc', now());
    RETURN NEW;
  END;
$$;
`;

// - SQL to create the table of a model (and its lov tables)
export function sqlCreateTable(m: Model, ifNotExists = false): string {
  const pKey = m.pKey || "id";
  const tName = tableName(m);
  const tSchema = tableWithSchema(tName);
  const fs = [pKey + " serial primary key"];
  let sqlIdx = "";
  let sqlComments = "";

  dataFields(m).forEach((f) => {
    fs.push(" " + columnDef(f, tName, false));
    if (f.type === ft.lov) {
      sqlIdx += lovIndex(f, tName);
    }
    if (f.label) {
      sqlComments += sqlComment(
        "COLUMN",
        tSchema + '."' + f.column + '"',
        f.label,
      );
    }
  });

  // - "timestamp" columns to track creation and last modification.
  if (config.wTimestamp) {
    fs.push(nowColumn(createdDateCol));
    fs.push(nowColumn(updatedDateCol));
  }
  // - "who-is" columns to track user who created and last modified the record.
  if (config.wWhoIs) {
    fs.push(" created_by integer");
    fs.push(" updated_by integer");
  }
  // - tracking number of comments.
  if (config.wComments) {
    fs.push(" nb_comments integer DEFAULT 0");
  }
  // - tracking ratings.
  if (config.wRating) {
    fs.push(" nb_ratings integer DEFAULT 0");
    fs.push(" avg_ratings integer DEFAULT NULL");
  }

  let sql =
    "\nCREATE TABLE " +
    (ifNotExists ? "IF NOT EXISTS " : "") +
    tSchema +
    "(\n" +
    fs.join(",\n") +
    "\n);\n";
  sql += sqlIdx;

  // - track updates
  if (config.wTimestamp) {
    const trigger = "tr_u_" + tName;
    sql += sqlUpdatedAtFunction();
    if (ifNotExists) {
      sql += "\nDROP TRIGGER IF EXISTS " + trigger + " ON " + tSchema + ";";
    }
    sql +=
      "\nCREATE TRIGGER " +
      trigger +
      " BEFORE UPDATE ON " +
      tSchema +
      " FOR EACH ROW EXECUTE PROCEDURE " +
      updatedAtFunction +
      "();\n";
  }

  // Comments on table and columns with description
  sql += sqlComment("TABLE", tSchema, m.title || m.label || m.table);
  sql += sqlComments;

  // - add lov tables
  const lovIncluded: string[] = [];
  m.fields.filter(needsLovTable).forEach((f) => {
    sql += sqlCreatePopulateLOV(f, tName, lovIncluded);
  });

  return sql;
}

// - SQL to add a column for a field (and its lov table and index)
export function sqlAddColumn(m: Model, f: Field): string {
  const tName = tableName(m);
  let sql =
    "ALTER TABLE " +
    tableWithSchema(tName) +
    " ADD COLUMN IF NOT EXISTS " +
    columnDef(f, tName, true) +
    ";\n";
  if (needsLovTable(f)) {
    sql = sqlCreatePopulateLOV(f, tName) + sql;
  }
  if (f.type === ft.lov) {
    sql += lovIndex(f, tName);
  }
  return sql;
}

export interface ModelDiff {
  sql: string[]; // - SQL to run (non-destructive only)
  warnings: string[]; // - things the user should know (ex: column kept)
  errors: string[]; // - changes that are not supported (save is refused)
}

// - Compare 2 versions of a model and list the changes to the database.
// - Nothing is ever dropped: removed fields keep their columns and data.
export function diffModels(oldM: Model | undefined, newM: Model): ModelDiff {
  const diff: ModelDiff = { sql: [], warnings: [], errors: [] };
  const tName = tableName(newM);
  const newFields = dataFields(newM);

  if (!oldM) {
    diff.sql.push(sqlCreateTable(newM, true));
    // - the table may already exist (model for an existing table)
    newFields.forEach((f) => diff.sql.push(sqlAddColumn(newM, f)));
    diff.warnings.push(
      `Table "${tName}" will be created (or completed if it already exists).`,
    );
    return diff;
  }

  if (tableName(oldM) !== tName) {
    diff.errors.push(
      `Changing the table of a model is not supported ("${tableName(oldM)}" to "${tName}").`,
    );
  }
  if ((oldM.pKey || "id") !== (newM.pKey || "id")) {
    diff.errors.push("Changing the primary key of a model is not supported.");
  }
  if (diff.errors.length) return diff;

  const oldFields = dataFields(oldM);
  const oldById: Record<string, Field> = {};
  const oldByColumn: Record<string, Field> = {};
  oldFields.forEach((f) => {
    oldById[f.id] = f;
    oldByColumn[f.column!] = f;
  });
  const newColumns = new Set(newFields.map((f) => f.column));

  newFields.forEach((f) => {
    const sameCol = oldByColumn[f.column!];
    if (sameCol) {
      if (pgType(sameCol) !== pgType(f)) {
        diff.errors.push(
          `Can't change the type of field "${f.id}" from "${sameCol.type}" to "${f.type}" (column "${f.column}" holds data). Add a new field instead.`,
        );
      } else if (
        needsLovTable(f) &&
        lovTable(f, tName) !== lovTable(sameCol, tName)
      ) {
        diff.sql.push(sqlCreatePopulateLOV(f, tName));
      }
    } else {
      diff.sql.push(sqlAddColumn(newM, f));
      const oldF = oldById[f.id];
      if (oldF && oldF.column !== f.column) {
        diff.warnings.push(
          `Field "${f.id}" now uses column "${f.column}". Column "${oldF.column}" is kept, its data is not copied.`,
        );
      }
    }
  });

  oldFields.forEach((f) => {
    if (!newColumns.has(f.column)) {
      diff.warnings.push(
        `Column "${f.column}" (field "${f.id}") is no longer used. It is kept in table "${tName}" with its data.`,
      );
    }
  });

  return diff;
}

export default {
  sqlCreateTable,
  sqlAddColumn,
  sqlCreatePopulateLOV,
  diffModels,
};
