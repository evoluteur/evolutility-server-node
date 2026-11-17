import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  diffModels,
  sqlCreateTable,
  sqlAddColumn,
} from "../../scripts/utils/ddl.ts";
import { normalizeModel } from "../../scripts/utils/model-validate.ts";
import type { Model } from "../../models/types.ts";

const book = (): Model =>
  normalizeModel({
    id: "book",
    name: "book",
    namePlural: "books",
    fields: [
      { id: "title", type: "text", label: "Title", required: true },
      { id: "pages", type: "integer", label: "Pages" },
    ],
  } as Model);

describe("sqlCreateTable", () => {
  it("creates the table w/ its columns", () => {
    const sql = sqlCreateTable(book(), true);
    assert.match(sql, /CREATE TABLE IF NOT EXISTS "evolutility"\."book"\(/);
    assert.match(sql, /"title" text not null/);
    assert.match(sql, /"pages" integer/);
  });

  it("creates and fills lov tables without failing on existing rows", () => {
    const m = book();
    m.fields.push({
      id: "genre",
      type: "lov",
      label: "Genre",
      column: "genre_id",
      list: [{ id: 1, text: "Sci'Fi" }],
    } as Model["fields"][0]);
    const sql = sqlCreateTable(m, true);
    assert.match(sql, /CREATE TABLE IF NOT EXISTS "evolutility"\."book_genre"/);
    assert.match(sql, /\(1,'Sci''Fi'\)\nON CONFLICT \(id\) DO NOTHING/);
  });

  it("skips UI-only and formula fields", () => {
    const m = book();
    m.fields.push({ id: "a", type: "text", label: "A", onlyUI: true });
    m.fields.push({ id: "b", type: "formula", label: "B" });
    const sql = sqlCreateTable(m);
    assert.ok(!sql.includes('"a"'));
    assert.ok(!sql.includes('"b"'));
  });
});

describe("sqlAddColumn", () => {
  it("never adds 'not null' (the table may have rows)", () => {
    const sql = sqlAddColumn(book(), book().fields[0]);
    assert.equal(
      sql,
      'ALTER TABLE "evolutility"."book" ADD COLUMN IF NOT EXISTS "title" text;\n',
    );
  });
});

describe("diffModels", () => {
  it("creates the table of a new model", () => {
    const d = diffModels(undefined, book());
    assert.equal(d.errors.length, 0);
    assert.match(d.sql[0], /CREATE TABLE IF NOT EXISTS/);
  });

  it("does nothing when columns don't change", () => {
    const m = book();
    m.fields[0].label = "Book title";
    m.fields[1].required = true;
    const d = diffModels(book(), m);
    assert.deepEqual(d, { sql: [], warnings: [], errors: [] });
  });

  it("adds a column for a new field", () => {
    const m = book();
    m.fields.push({ id: "isbn", type: "text", label: "ISBN", column: "isbn" });
    const d = diffModels(book(), m);
    assert.deepEqual(d.sql, [
      'ALTER TABLE "evolutility"."book" ADD COLUMN IF NOT EXISTS "isbn" text;\n',
    ]);
  });

  it("keeps the column of a removed field", () => {
    const m = book();
    m.fields.pop();
    const d = diffModels(book(), m);
    assert.equal(d.sql.length, 0);
    assert.match(d.warnings[0], /Column "pages".*kept/);
  });

  it("refuses to change the type of a column w/ data", () => {
    const m = book();
    m.fields[1].type = "text";
    const d = diffModels(book(), m);
    assert.match(d.errors[0], /Can't change the type of field "pages"/);
  });

  it("allows type changes w/ the same column type", () => {
    const m = book();
    m.fields[0].type = "email";
    assert.equal(diffModels(book(), m).errors.length, 0);
  });

  it("adds the new column when a field changes column", () => {
    const m = book();
    m.fields[1].column = "nb_pages";
    const d = diffModels(book(), m);
    assert.match(d.sql[0], /ADD COLUMN IF NOT EXISTS "nb_pages" integer/);
    assert.equal(d.warnings.length, 2); // - new column + old column kept
  });

  it("refuses to change the table or primary key", () => {
    const m = book();
    m.table = "books";
    assert.equal(diffModels(book(), m).errors.length, 1);
    const m2 = book();
    m2.pKey = "book_id";
    assert.equal(diffModels(book(), m2).errors.length, 1);
  });
});

describe("sqlCreateTable (update trigger)", () => {
  it("creates its own trigger function for the updated_at column", () => {
    const sql = sqlCreateTable(book(), true);
    assert.match(sql, /CREATE OR REPLACE FUNCTION "evolutility"\.evol_updated_at\(\)/);
    assert.match(sql, /EXECUTE PROCEDURE "evolutility"\.evol_updated_at\(\);/);
  });
});
