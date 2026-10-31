import { describe, it } from "node:test";
import assert from "node:assert/strict";
import chartsModule from "../../scripts/charts.ts";
import { getModel } from "../../scripts/utils/model-manager.ts";

// The test model has all field types: text, lov, boolean, integer, decimal, money, date, etc.
const m = getModel("test")!;

describe("SQLchartField", () => {
  it("returns 404 error for unknown field", () => {
    const result = chartsModule.SQLchartField(m, "nonexistent");
    assert.ok(result.errorMessage);
    assert.equal(result.errorCode, 404);
    assert.equal(result.sql, undefined);
  });
  it("returns 400 error for non-chartable text field", () => {
    const result = chartsModule.SQLchartField(m, "name");
    assert.ok(result.errorMessage);
    assert.equal(result.errorCode, 400);
  });
  it("returns 400 error for non-chartable date field", () => {
    const result = chartsModule.SQLchartField(m, "date");
    assert.ok(result.errorMessage);
    assert.equal(result.errorCode, 400);
  });
  it("returns 400 error for non-chartable image field", () => {
    const result = chartsModule.SQLchartField(m, "image");
    assert.ok(result.errorMessage);
    assert.equal(result.errorCode, 400);
  });
  it("generates SQL for boolean field with CASE labels", () => {
    const { sql, errorMessage } = chartsModule.SQLchartField(m, "boolean");
    assert.ok(!errorMessage, `unexpected error: ${errorMessage}`);
    assert.ok(sql!.includes("CASE"));
    assert.ok(sql!.includes("'Yes'"));
    assert.ok(sql!.includes("'No'"));
    assert.ok(sql!.includes("GROUP BY"));
  });
  it("generates SQL for integer field grouped by value", () => {
    const { sql, errorMessage } = chartsModule.SQLchartField(m, "integer");
    assert.ok(!errorMessage, `unexpected error: ${errorMessage}`);
    assert.ok(sql!.includes('"f_integer"'));
    assert.ok(sql!.includes("GROUP BY"));
  });
  it("generates SQL for decimal field", () => {
    const { sql, errorMessage } = chartsModule.SQLchartField(m, "decimal");
    assert.ok(!errorMessage, `unexpected error: ${errorMessage}`);
    assert.ok(sql!.includes('"f_decimal"'));
  });
  it("generates SQL for lov field with LEFT JOIN on lovTable", () => {
    const { sql, errorMessage } = chartsModule.SQLchartField(m, "lov");
    assert.ok(!errorMessage, `unexpected error: ${errorMessage}`);
    assert.ok(sql!.includes("LEFT JOIN"));
    assert.ok(sql!.includes('"z_test_flavor"'));
    assert.ok(sql!.includes("GROUP BY t2.id"));
  });
  it("SQL ends with ORDER BY label ASC", () => {
    const { sql } = chartsModule.SQLchartField(m, "boolean");
    assert.ok(sql!.includes("ORDER BY label ASC"));
  });
  it("SQL includes LIMIT", () => {
    const { sql } = chartsModule.SQLchartField(m, "boolean");
    assert.match(sql!, /LIMIT \d+/);
  });
});
