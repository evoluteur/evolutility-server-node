import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  normalizeModel,
  validateModel,
  stripComputed,
} from "../../scripts/utils/model-validate.ts";
import { testModels } from "../fixtures/models/index.ts";
import type { Model } from "../../models/types.ts";

const base = (): Model =>
  ({
    id: "book",
    name: "book",
    namePlural: "books",
    fields: [
      { id: "title", type: "text", label: "Title", inMany: true },
      { id: "pages", type: "integer", label: "Pages" },
    ],
  }) as Model;

const conditions = (m: Model, others = {}) =>
  validateModel(normalizeModel(m), others).invalids.map((i) => i.id);

describe("normalizeModel", () => {
  it("fills in table, pKey and columns", () => {
    const m = normalizeModel(base());
    assert.equal(m.table, "book");
    assert.equal(m.pKey, "id");
    assert.deepEqual(
      m.fields.map((f) => f.column),
      ["title", "pages"],
    );
  });

  it("removes computed props and does not change its input", () => {
    const input = {
      ...base(),
      _version: 3,
      fieldsH: {},
      schemaTable: "x",
    } as unknown as Model;
    const m = normalizeModel(input) as unknown as Record<string, unknown>;
    assert.equal(m._version, undefined);
    assert.equal(m.fieldsH, undefined);
    assert.equal(m.schemaTable, undefined);
    assert.equal((input as unknown as Record<string, unknown>)._version, 3);
  });

  it("stripComputed removes field t2", () => {
    const m = stripComputed({
      ...base(),
      fields: [{ id: "a", t2: "t_0" }],
    } as unknown as Record<string, unknown>);
    assert.equal(m.fields[0].t2, undefined);
  });
});

describe("validateModel", () => {
  it("accepts a valid model", () => {
    assert.deepEqual(conditions(base()), []);
  });

  it("accepts the test models", () => {
    Object.values(testModels).forEach((m) =>
      assert.deepEqual(conditions(m, testModels), [], m.id),
    );
  });

  it("refuses SQL in names", () => {
    const m = base();
    m.table = 'book"; DROP TABLE x; --';
    m.fields[0].column = "title; --";
    m.fields[1].lovTable = "a b";
    const ids = conditions(m);
    assert.ok(ids.includes("table"));
    assert.ok(ids.includes("fields[0] (title).column"));
    assert.ok(ids.includes("fields[1] (pages).lovTable"));
  });

  it("refuses duplicate field ids and unknown types", () => {
    const m = base();
    m.fields.push({ id: "title", type: "nope" as "text", label: "x" });
    const ids = conditions(m);
    assert.ok(ids.includes("fields[2].id"));
    assert.ok(ids.includes("fields[2] (title).type"));
  });

  it("refuses a column w/ the primary key", () => {
    const m = base();
    m.fields[1].column = "id";
    assert.ok(conditions(m).includes("fields[1] (pages).column"));
  });

  it("checks lists of values", () => {
    const m = base();
    m.fields.push({
      id: "genre",
      type: "lov",
      label: "Genre",
      list: [{ id: "x", text: 1 }],
    } as unknown as Model["fields"][0]);
    const ids = conditions(m);
    assert.ok(ids.includes("fields[2] (genre).list[0].id"));
    assert.ok(ids.includes("fields[2] (genre).list[0].text"));
  });

  it("checks references to other models", () => {
    const m = base();
    m.fields.push({ id: "author", type: "lov", label: "Author", object: "author" });
    m.collections = [{ id: "reviews", object: "review" }];
    assert.deepEqual(conditions(m), [
      "fields[2] (author).object",
      "collections[0].object",
    ]);
    assert.deepEqual(
      conditions(m, { author: base(), review: base() }),
      [],
    );
  });

  it("checks collections orderBy", () => {
    const m = base();
    m.collections = [{ id: "a", table: "t", orderBy: "position, t1.id desc" }];
    assert.deepEqual(conditions(m), []);
    m.collections[0].orderBy = "1; DROP TABLE x";
    assert.ok(conditions(m).includes("collections[0].orderBy"));
  });

  it("checks titleField and requires names", () => {
    const m = base();
    m.titleField = "nope";
    m.name = "";
    const ids = conditions(m);
    assert.ok(ids.includes("titleField"));
    assert.ok(ids.includes("name"));
  });

  it("warns about unknown fields in groups", () => {
    const m = base();
    m.groups = [{ id: "g1", fields: ["title", "nope"] }];
    const r = validateModel(normalizeModel(m));
    assert.equal(r.invalids.length, 0);
    assert.equal(r.warnings.length, 1);
  });
});

describe("normalizeModel lovTable", () => {
  it("sets the lov table of lov fields", () => {
    const m = base();
    m.fields.push({ id: "genre", type: "lov", label: "Genre", list: [] });
    m.fields.push({ id: "author", type: "lov", label: "Author", object: "author" });
    const n = normalizeModel(m, {
      author: { ...base(), id: "author", table: "people" },
    });
    assert.equal(n.fields[2].lovTable, "book_genre");
    assert.equal(n.fields[3].lovTable, "people");
  });
});
