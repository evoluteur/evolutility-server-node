import { describe, it } from "node:test";
import assert from "node:assert/strict";
import sqls from "../../scripts/utils/sql-select.ts";
import type { Field } from "../../models/types.ts";

const f = (id: string, column: string, type: string, extra: Partial<Field> = {}): Field =>
  ({ id, column, type, ...extra } as Field);

const textField = f("name", "name", "text");
const intField = f("age", "f_age", "integer");
const moneyField = f("price", "f_price", "money");
const lovField = f("category", "f_cat", "lov", { lovTable: "categories", t2: "t_1" });
const lovFieldWithIcon = f("status", "f_status", "lov", { lovTable: "statuses", t2: "t_2", lovIcon: true });
const lovFieldCustomCol = f("flavor", "f_flavor", "lov", { lovTable: "flavors", t2: "t_3", lovColumn: "label" });

describe("sqlQuery", () => {
  it("builds basic SELECT FROM with default limit", () => {
    const sql = sqls.sqlQuery({ select: "id, name", from: "test", where: [] });
    assert.match(sql, /^SELECT id, name FROM test/);
    assert.ok(sql.includes("LIMIT"));
  });
  it("joins WHERE conditions with AND", () => {
    const sql = sqls.sqlQuery({ select: "*", from: "t", where: ["id=$1", "active=TRUE"] });
    assert.ok(sql.includes("WHERE id=$1 AND active=TRUE"));
  });
  it("omits WHERE when array is empty", () => {
    const sql = sqls.sqlQuery({ select: "*", from: "t", where: [] });
    assert.ok(!sql.includes("WHERE"));
  });
  it("includes GROUP BY", () => {
    const sql = sqls.sqlQuery({ select: "name, count(*)", from: "t", where: [], group: "name" });
    assert.ok(sql.includes("GROUP BY name"));
  });
  it("includes ORDER BY", () => {
    const sql = sqls.sqlQuery({ select: "*", from: "t", where: [], order: "name ASC" });
    assert.ok(sql.includes("ORDER BY name ASC"));
  });
  it("uses provided limit", () => {
    const sql = sqls.sqlQuery({ select: "*", from: "t", where: [], limit: 10 });
    assert.ok(sql.includes("LIMIT 10"));
  });
  it("includes OFFSET when provided", () => {
    const sql = sqls.sqlQuery({ select: "*", from: "t", where: [], offset: 50 });
    assert.ok(sql.includes("OFFSET 50"));
  });
  it("omits OFFSET when not provided", () => {
    const sql = sqls.sqlQuery({ select: "*", from: "t", where: [] });
    assert.ok(!sql.includes("OFFSET"));
  });
});

describe("sqlFromLOVs", () => {
  const schema = '"evolutility"';

  it("generates LEFT JOIN for a lov field", () => {
    const sql = sqls.sqlFromLOVs([lovField], schema);
    assert.ok(sql.includes('LEFT JOIN "evolutility"."categories" AS t_1'));
    assert.ok(sql.includes('t1."f_cat"=t_1.id'));
  });
  it("returns empty string when no lov fields", () => {
    assert.equal(sqls.sqlFromLOVs([textField, intField], schema), "");
  });
  it("joins multiple lov fields", () => {
    const sql = sqls.sqlFromLOVs([lovField, lovFieldWithIcon], schema);
    assert.ok(sql.includes('"categories"'));
    assert.ok(sql.includes('"statuses"'));
  });
  it("skips lov field with no lovTable", () => {
    const noTable = f("x", "x_id", "lov");
    const sql = sqls.sqlFromLOVs([noTable], schema);
    assert.equal(sql, "");
  });
});

describe("select", () => {
  it("adds AS alias when column differs from id", () => {
    const sql = sqls.select([intField], null, true);
    assert.ok(sql.includes('"f_age"'));
    assert.ok(sql.includes('AS "age"'));
  });
  it("omits AS alias when column equals id", () => {
    const sql = sqls.select([textField], null, true);
    assert.ok(sql.includes('"name"'));
    assert.ok(!sql.includes('AS "name"'));
  });
  it("appends ::numeric::float8 for money fields", () => {
    const sql = sqls.select([moneyField], null, true);
    assert.ok(sql.includes("::numeric::float8"));
  });
  it("adds lov text column in read mode", () => {
    const sql = sqls.select([lovField], null, true);
    assert.ok(sql.includes('"category_txt"'));
  });
  it("uses custom lovColumn for text alias", () => {
    const sql = sqls.select([lovFieldCustomCol], null, true);
    assert.ok(sql.includes("label"));
  });
  it("adds icon column for lovIcon fields", () => {
    const sql = sqls.select([lovFieldWithIcon], null, true);
    assert.ok(sql.includes("icon"));
  });
  it("omits lov text column on create action", () => {
    const sql = sqls.select([lovField], null, true, "C");
    assert.ok(!sql.includes('"category_txt"'));
  });
  it("omits lov text column on update action", () => {
    const sql = sqls.select([lovField], null, true, "U");
    assert.ok(!sql.includes('"category_txt"'));
  });
  it("uses no table prefix when table param is falsy", () => {
    const sql = sqls.select([intField], null, false);
    assert.ok(sql.includes('"f_age"'));
    assert.ok(!sql.includes("t1."));
  });
});

import {
  likeEscape,
  likeContains,
  pageSizeParam,
  pageParam,
} from "../../scripts/utils/sql-select.ts";
import config from "../../config.ts";

describe("likeEscape / likeContains", () => {
  it("escapes LIKE wildcards and backslash", () => {
    assert.equal(likeEscape("50%"), "50\\%");
    assert.equal(likeEscape("a_b"), "a\\_b");
    assert.equal(likeEscape("c:\\dir"), "c:\\\\dir");
    assert.equal(likeEscape("plain"), "plain");
  });
  it("wraps search in % for contains", () => {
    assert.equal(likeContains("50%"), "%50\\%%");
    assert.equal(likeContains(""), "%");
    assert.equal(likeContains(null), "%");
  });
});

describe("pageSizeParam / pageParam", () => {
  it("uses the default page size when missing or invalid", () => {
    assert.equal(pageSizeParam(undefined), config.pageSize);
    assert.equal(pageSizeParam("abc"), config.pageSize);
    assert.equal(pageSizeParam("0"), config.pageSize);
    assert.equal(pageSizeParam("-5"), config.pageSize);
  });
  it("keeps valid sizes and caps big ones at maxPageSize", () => {
    assert.equal(pageSizeParam("10"), 10);
    assert.equal(pageSizeParam("10000000"), config.maxPageSize);
  });
  it("never returns a negative or invalid page", () => {
    assert.equal(pageParam("3"), 3);
    assert.equal(pageParam("-1"), 0);
    assert.equal(pageParam("abc"), 0);
    assert.equal(pageParam(undefined), 0);
  });
});
