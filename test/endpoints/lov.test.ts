import { describe, it } from "node:test";
import assert from "node:assert/strict";
import lovModule from "../../scripts/lov.ts";

describe("SQLlovOne", () => {
  it("generates basic select with default name column", () => {
    const sql = lovModule.SQLlovOne({ lovTable: "task_category" });
    assert.ok(sql.includes('SELECT id, "name" as text'));
    assert.ok(sql.includes('FROM "evolutility"."task_category"'));
    assert.ok(!sql.includes("ILIKE"));
  });
  it("uses custom lovColumn", () => {
    const sql = lovModule.SQLlovOne({ lovTable: "task_category", lovColumn: "label" });
    assert.ok(sql.includes('"label" as text'));
    assert.ok(!sql.includes('"name" as text'));
  });
  it("adds icon column when lovIcon is true", () => {
    const sql = lovModule.SQLlovOne({ lovTable: "task_category", lovIcon: true });
    assert.ok(sql.includes(", icon"));
  });
  it("omits icon column when lovIcon is false", () => {
    const sql = lovModule.SQLlovOne({ lovTable: "task_category", lovIcon: false });
    assert.ok(!sql.includes("icon"));
  });
  it("adds ILIKE filter when search is provided", () => {
    const sql = lovModule.SQLlovOne({ lovTable: "task_category" }, "work");
    assert.ok(sql.includes('WHERE "name" ILIKE $1'));
  });
  it("orders by UPPER of the label column", () => {
    const sql = lovModule.SQLlovOne({ lovTable: "task_category" });
    assert.ok(sql.includes('ORDER BY UPPER("name") ASC'));
  });
  it("applies LIMIT from config", () => {
    const sql = lovModule.SQLlovOne({ lovTable: "task_category" });
    assert.match(sql, /LIMIT \d+/);
  });
});
