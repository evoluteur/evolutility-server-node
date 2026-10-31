import { describe, it } from "node:test";
import assert from "node:assert/strict";
import crudModule from "../../scripts/crud.ts";
import { getModel } from "../../scripts/utils/model-manager.ts";

const m = getModel("test")!;

describe("SQLgetOne", () => {
  it("returns null for non-numeric id", () => {
    assert.equal(crudModule.SQLgetOne("abc", m), null);
  });
  it("returns null for id '0'", () => {
    assert.equal(crudModule.SQLgetOne("0", m), null);
  });
  it("returns null for empty string id", () => {
    assert.equal(crudModule.SQLgetOne("", m), null);
  });
  it("returns sql and sqlParams for a valid numeric id", () => {
    const result = crudModule.SQLgetOne("42", m);
    assert.ok(result);
    assert.ok(typeof result.sql === "string");
    assert.deepEqual(result.sqlParams, ["42"]);
  });
  it("SQL selects from the model's table", () => {
    const result = crudModule.SQLgetOne("1", m);
    assert.ok(result!.sql.includes('"z_test"'));
  });
  it("SQL uses t1 alias for the main table", () => {
    const result = crudModule.SQLgetOne("1", m);
    assert.ok(result!.sql.includes("AS t1"));
  });
  it("SQL filters by primary key with $1 param", () => {
    const result = crudModule.SQLgetOne("1", m);
    assert.ok(result!.sql.includes("WHERE t1.id=$1"));
  });
  it("SQL has LIMIT 1", () => {
    const result = crudModule.SQLgetOne("1", m);
    assert.ok(result!.sql.includes("LIMIT 1"));
  });
  it("SQL joins lov tables", () => {
    const result = crudModule.SQLgetOne("1", m);
    assert.ok(result!.sql.includes("LEFT JOIN"));
  });
  it("SQL includes id in SELECT", () => {
    const result = crudModule.SQLgetOne("5", m);
    assert.ok(result!.sql.startsWith("SELECT t1.id as id"));
  });
});
