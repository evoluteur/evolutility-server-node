import { describe, it } from "node:test";
import assert from "node:assert/strict";
import listModule from "../../scripts/list.ts";
import sqls from "../../scripts/utils/sql-select.ts";
import { getModel } from "../../scripts/utils/model-manager.ts";
import type { Request } from "express";
import config from "../../config.ts";

const m = getModel("test")!;

const req = (query: Record<string, string> = {}): Request =>
  ({ query } as unknown as Request);

describe("SQLgetMany", () => {
  it("returns a query object with required keys", () => {
    const q = listModule.SQLgetMany(m, req(), false, false);
    assert.ok(typeof q.select === "string");
    assert.ok(typeof q.from === "string");
    assert.ok(Array.isArray(q.where));
    assert.ok(typeof q.limit === "number");
  });
  it("FROM clause contains the model table", () => {
    const q = listModule.SQLgetMany(m, req(), false, false);
    assert.ok(q.from.includes('"z_test"'));
  });
  it("SELECT starts with primary key as id", () => {
    const q = listModule.SQLgetMany(m, req(), false, false);
    assert.ok(q.select.startsWith("t1.id as id"));
  });
  it("builds full SQL via sqlQuery", () => {
    const q = listModule.SQLgetMany(m, req(), false, false);
    const sql = sqls.sqlQuery(q);
    assert.ok(sql.startsWith("SELECT"));
    assert.ok(sql.includes("FROM"));
    assert.ok(sql.includes("LIMIT"));
  });
  it("includes count when wCount is true", () => {
    const q = listModule.SQLgetMany(m, req(), false, true);
    assert.ok(q.select.includes("_full_count"));
  });
  it("omits count when wCount is false", () => {
    const q = listModule.SQLgetMany(m, req(), false, false);
    assert.ok(!q.select.includes("_full_count"));
  });
  it("applies search param to WHERE clause", () => {
    const q = listModule.SQLgetMany(m, req({ search: "hello" }), false, false);
    assert.ok(q.where.length > 0);
    assert.ok(q.params.length > 0);
  });
  it("uses CSV size limit for isCSV=true", () => {
    const qNormal = listModule.SQLgetMany(m, req(), false, false);
    const qCSV = listModule.SQLgetMany(m, req({ format: "csv" }), true, false);
    assert.ok(qCSV.limit >= qNormal.limit);
  });
  it("applies page offset", () => {
    const q = listModule.SQLgetMany(m, req({ page: "2", pageSize: "10" }), false, false);
    assert.equal(q.offset, 20);
  });
  it("zero offset for page 0", () => {
    const q = listModule.SQLgetMany(m, req({ page: "0" }), false, false);
    assert.equal(q.offset, 0);
  });
  it("ORDER BY defaults to '2 ASC' when no order param", () => {
    const q = listModule.SQLgetMany(m, req(), false, false);
    assert.equal(q.order, "2 ASC");
  });
  it("applies ORDER BY from query param", () => {
    const q = listModule.SQLgetMany(m, req({ order: "name.asc" }), false, false);
    assert.ok(q.order.length > 0);
    assert.ok(!q.order.includes("2 ASC"));
  });
});

describe("SQLgetMany - input limits and filters", () => {
  const todo = getModel("todo")!;

  it("caps pageSize at maxPageSize", () => {
    const q = listModule.SQLgetMany(todo, req({ pageSize: "10000000" }), false, false);
    assert.equal(q.limit, config.maxPageSize);
  });
  it("falls back to the default for a non-numeric pageSize", () => {
    const q = listModule.SQLgetMany(todo, req({ pageSize: "abc" }), false, false);
    assert.equal(q.limit, config.pageSize);
    assert.ok(!sqls.sqlQuery(q).includes("NaN"));
  });
  it("ignores a negative page", () => {
    const q = listModule.SQLgetMany(todo, req({ page: "-3" }), false, false);
    assert.equal(q.offset, 0);
  });
  it("escapes wildcards in search", () => {
    const q = listModule.SQLgetMany(todo, req({ search: "100%_off" }), false, false);
    assert.ok(q.params.includes("%100\\%\\_off%"));
  });
  it("escapes wildcards in ct / sw / fw filters", () => {
    const ct = listModule.SQLgetMany(todo, req({ title: "ct.50%" }), false, false);
    assert.deepEqual(ct.params, ["%50\\%%"]);
    const sw = listModule.SQLgetMany(todo, req({ title: "sw.a_b" }), false, false);
    assert.deepEqual(sw.params, ["a\\_b%"]);
    const fw = listModule.SQLgetMany(todo, req({ title: "fw.a_b" }), false, false);
    assert.deepEqual(fw.params, ["%a\\_b"]);
  });
  it("keeps dots in filter values", () => {
    const q = listModule.SQLgetMany(todo, req({ title: "ct.v1.2.3" }), false, false);
    assert.deepEqual(q.params, ["%v1.2.3%"]);
  });
  it("supports the nct (does not contain) filter", () => {
    const q = listModule.SQLgetMany(todo, req({ title: "nct.draft" }), false, false);
    assert.deepEqual(q.params, ["%draft%"]);
    assert.ok(q.where.some((w) => w.includes("NOT") && w.includes("ILIKE")));
  });
});
