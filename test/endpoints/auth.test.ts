import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import type { Server } from "http";
import config from "../../config.ts";
import {
  hashPassword,
  verifyPassword,
  newToken,
  tokenId,
  parseCookies,
  sessionCookie,
  requiredRole,
  hasRole,
} from "../../scripts/utils/auth.ts";

describe("passwords", () => {
  it("hashes w/ scrypt and a random salt", async () => {
    const h1 = await hashPassword("secret-pass");
    const h2 = await hashPassword("secret-pass");
    assert.match(h1, /^scrypt\$16384\$8\$1\$/);
    assert.notEqual(h1, h2);
    assert.ok(!h1.includes("secret-pass"));
  });

  it("verifies the right password only", async () => {
    const h = await hashPassword("secret-pass");
    assert.equal(await verifyPassword("secret-pass", h), true);
    assert.equal(await verifyPassword("wrong-pass", h), false);
    assert.equal(await verifyPassword("secret-pass", "not-a-hash"), false);
    assert.equal(await verifyPassword("secret-pass", ""), false);
  });
});

describe("sessions and cookies", () => {
  it("makes random tokens, stored as a hash", () => {
    const t = newToken();
    assert.notEqual(t, newToken());
    assert.ok(t.length >= 40);
    assert.equal(tokenId(t), tokenId(t));
    assert.match(tokenId(t), /^[0-9a-f]{64}$/);
  });

  it("parses cookies", () => {
    assert.deepEqual(parseCookies("a=1; evol_session=abc%3D; b"), {
      a: "1",
      evol_session: "abc=",
    });
    assert.deepEqual(parseCookies(undefined), {});
  });

  it("sets an httpOnly SameSite cookie", () => {
    const c = sessionCookie("tok", 3600);
    assert.match(c, /^evol_session=tok; Path=\/; HttpOnly; SameSite=Strict; Max-Age=3600/);
    assert.match(sessionCookie("", 0), /Max-Age=0/);
  });
});

describe("roles", () => {
  const p = config.apiPath;
  it("needs viewer to read, editor to write, admin for models and db", () => {
    assert.equal(requiredRole("GET", p + "todo"), "viewer");
    assert.equal(requiredRole("GET", p + "meta/models"), "viewer");
    assert.equal(requiredRole("POST", p + "todo"), "editor");
    assert.equal(requiredRole("PATCH", p + "todo/1"), "editor");
    assert.equal(requiredRole("DELETE", p + "todo/1"), "editor");
    assert.equal(requiredRole("POST", p + "todo/upload/1"), "editor");
    assert.equal(requiredRole("PUT", p + "meta/models/todo"), "admin");
    assert.equal(requiredRole("DELETE", p + "meta/models/todo"), "admin");
    assert.equal(requiredRole("GET", p + "db/tables"), "admin");
  });

  it("leaves login and version public", () => {
    assert.equal(requiredRole("POST", p + "auth/login"), null);
    assert.equal(requiredRole("GET", p + "auth/me"), null);
    assert.equal(requiredRole("GET", p + "version"), null);
  });

  it("ranks roles", () => {
    assert.equal(hasRole("admin", "editor"), true);
    assert.equal(hasRole("editor", "editor"), true);
    assert.equal(hasRole("viewer", "editor"), false);
    assert.equal(hasRole(null, "viewer"), false);
  });
});

// - requests w/o session cookie: no database needed
describe("API w/ login required", () => {
  let server: Server;
  let base: string;
  const ui = "http://localhost:5173";

  before(async () => {
    config.auth.enabled = true;
    config.auth.anonymousRole = null;
    config.corsOrigins = [ui];
    config.logToConsole = false;
    const { default: app } = await import("../../app.ts");
    await new Promise<void>((resolve) => {
      server = app.listen(0, () => resolve());
    });
    base = `http://localhost:${(server.address() as { port: number }).port}${config.apiPath}`;
  });

  after(() => server.close());

  const call = (path: string, method = "GET", headers: Record<string, string> = {}, body?: unknown) =>
    fetch(base + path, {
      method,
      headers: { "Content-Type": "application/json", ...headers },
      body: body ? JSON.stringify(body) : undefined,
    });

  it("refuses reads and writes w/o login (401)", async () => {
    assert.equal((await call("todo")).status, 401);
    assert.equal((await call("meta/models")).status, 401);
    assert.equal((await call("todo", "POST", {}, { title: "x" })).status, 401);
    assert.equal((await call("meta/models/todo", "DELETE")).status, 401);
  });

  it("answers public routes", async () => {
    assert.equal((await call("version")).status, 200);
    const me = await (await call("auth/me")).json();
    assert.deepEqual(me, { authEnabled: true, user: null, role: null });
  });

  it("needs email and password to log in", async () => {
    assert.equal((await call("auth/login", "POST", {}, { email: "a@b.c" })).status, 400);
  });

  it("lets anonymous visitors read w/ anonymousRole viewer", async () => {
    config.auth.anonymousRole = "viewer";
    try {
      assert.equal((await call("meta/schema")).status, 200);
      assert.equal((await call("todo", "POST", {}, { title: "x" })).status, 401);
      assert.equal((await call("meta/models/todo", "PUT", {}, {})).status, 401);
    } finally {
      config.auth.anonymousRole = null;
    }
  });

  it("allows the UI's site w/ cookies (CORS)", async () => {
    const r = await call("version", "GET", { Origin: ui });
    assert.equal(r.headers.get("access-control-allow-origin"), ui);
    assert.equal(r.headers.get("access-control-allow-credentials"), "true");
  });

  it("refuses writes from other sites", async () => {
    const r = await call("auth/login", "POST", { Origin: "https://evil.example" }, {
      email: "a@b.c",
      password: "x",
    });
    assert.equal(r.status, 403);
    const read = await call("version", "GET", { Origin: "https://evil.example" });
    assert.equal(read.headers.get("access-control-allow-origin"), null);
  });
});
