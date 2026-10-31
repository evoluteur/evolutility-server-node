import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import type { Server } from "http";
import config from "../../config.ts";

// - Checks that fixed routes are not swallowed by the generic ":entity" routes.
// - No database is needed: we only check which handler answers.

describe("route order", () => {
  let server: Server;
  let base: string;

  before(async () => {
    config.schemaQueries = true; // - enable "db/..." routes for this test
    config.apiDesigner = true;
    config.apiInfo = true;
    config.logToConsole = false;
    const { default: app } = await import("../../app.ts");
    await new Promise<void>((resolve) => {
      server = app.listen(0, () => resolve());
    });
    base = `http://localhost:${(server.address() as { port: number }).port}${config.apiPath}`;
  });

  after(() => server.close());

  const get = async (path: string) => {
    const r = await fetch(base + path);
    return { status: r.status, text: await r.text() };
  };
  const notModelNotFound = (text: string) =>
    assert.ok(!text.includes("Model not found"), text);

  it("GET version is served by the version route", async () => {
    const r = await get("version");
    assert.equal(r.status, 200);
    notModelNotFound(r.text);
  });

  it("GET meta/models is served by the designer route", async () => {
    notModelNotFound((await get("meta/models")).text);
  });

  it("GET db/tables is served by the db route", async () => {
    notModelNotFound((await get("db/tables")).text);
  });

  it("GET openapi.json still works", async () => {
    const r = await get("openapi.json");
    assert.equal(r.status, 200);
    assert.ok(JSON.parse(r.text).openapi);
  });

  it("API discovery answers on the API root, with and without trailing slash", async () => {
    const r1 = await get("");
    assert.equal(r1.status, 200);
    assert.ok(Array.isArray(JSON.parse(r1.text)));
    const r2 = await fetch(base.replace(/\/$/, ""));
    assert.equal(r2.status, 200);
  });

  it("unknown models still get a 404 from the generic routes", async () => {
    const r = await get("nope");
    assert.equal(r.status, 404);
    assert.ok(r.text.includes("Model not found"));
    assert.equal((await get("nope/1")).status, 404);
  });
});
