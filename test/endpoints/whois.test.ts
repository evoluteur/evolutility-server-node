import { describe, it } from "node:test";
import assert from "node:assert/strict";
import type { Request } from "express";
import "../fixtures/models/index.ts";
import { getModel } from "../../scripts/utils/model-manager.ts";
import sqls from "../../scripts/utils/sql-select.ts";
import crudModule from "../../scripts/crud.ts";
import config from "../../config.ts";

const m = getModel("todo")!;
const req = (body: Record<string, unknown>, user?: { id: number }) =>
  ({ body, user }) as unknown as Request;

describe("who-is columns (wWhoIs)", () => {
  it("sets created_by and updated_by to the user on insert", () => {
    const q = sqls.namedValues(m, req({ title: "x" }, { id: 7 }), "insert");
    const i = q.names.indexOf("created_by");
    assert.ok(i > -1);
    assert.equal(q.values[i], 7);
    assert.equal(q.values[q.names.indexOf("updated_by")], 7);
  });

  it("sets only updated_by on update", () => {
    const q = sqls.namedValues(m, req({ title: "x" }, { id: 9 }), "update");
    assert.ok(q.names.some((n) => n?.startsWith('"updated_by"=')));
    assert.ok(!q.names.some((n) => n?.includes("created_by")));
    assert.ok(q.values.includes(9));
  });

  it("ignores who-is values sent by the client", () => {
    const q = sqls.namedValues(
      m,
      req({ title: "x", created_by: 1, updated_by: 1 }, { id: 7 }),
      "insert",
    );
    assert.equal(q.names.filter((n) => n === "created_by").length, 1);
    assert.equal(q.values[q.names.indexOf("created_by")], 7);
  });

  it("sets nothing w/o logged-in user, or when the option is off", () => {
    let q = sqls.namedValues(m, req({ title: "x" }), "insert");
    assert.ok(!q.names.includes("created_by"));
    config.wWhoIs = false;
    try {
      q = sqls.namedValues(m, req({ title: "x" }, { id: 7 }), "insert");
      assert.ok(!q.names.includes("created_by"));
    } finally {
      config.wWhoIs = true;
    }
  });

  it("returns the names of the users w/ one record", () => {
    const q = crudModule.SQLgetOne("1", m)!;
    assert.match(q.sql, /AS created_by_txt/);
    assert.match(q.sql, /AS updated_by_txt/);
    assert.match(q.sql, /evol_user u WHERE u\.id = t1\.created_by/);
  });
});
