import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import fs from "fs";
import os from "os";
import path from "path";
import express from "express";
import type { Server } from "http";
import config from "../../config.ts";
import {
  uploadOne,
  safeFileName,
  dedupFileName,
  isAllowedFile,
} from "../../scripts/utils/upload.ts";

describe("safeFileName", () => {
  it("keeps normal names", () => {
    assert.equal(safeFileName("photo.png"), "photo.png");
    assert.equal(safeFileName("my-pic_2.JPG"), "my-pic_2.jpg");
  });
  it("strips directories (path traversal)", () => {
    assert.equal(safeFileName("../../app.ts"), "app.ts");
    assert.equal(safeFileName("..\\..\\evil.png"), "evil.png");
    assert.equal(safeFileName("/etc/passwd"), "passwd");
  });
  it("replaces unsafe characters", () => {
    assert.equal(safeFileName('a b"c<d>.png'), "a_b_c_d_.png");
  });
  it("removes leading dots and handles empty names", () => {
    assert.equal(safeFileName(".htaccess"), "htaccess");
    assert.equal(safeFileName(""), "file");
    assert.equal(safeFileName(null), "file");
    assert.equal(safeFileName(".png"), "png");
  });
});

describe("dedupFileName", () => {
  it("adds a suffix before the extension", () => {
    assert.match(dedupFileName("a.png"), /^a_[0-9a-f]{8}\.png$/);
  });
  it("works without extension", () => {
    assert.match(dedupFileName("readme"), /^readme_[0-9a-f]{8}$/);
  });
});

describe("isAllowedFile", () => {
  it("accepts images and documents", () => {
    assert.ok(isAllowedFile("a.png"));
    assert.ok(isAllowedFile("A.JPEG"));
    assert.ok(isAllowedFile("report.pdf"));
  });
  it("rejects scripts, html, svg and no extension", () => {
    assert.ok(!isAllowedFile("x.js"));
    assert.ok(!isAllowedFile("x.html"));
    assert.ok(!isAllowedFile("x.svg"));
    assert.ok(!isAllowedFile("x.png.exe"));
    assert.ok(!isAllowedFile("noext"));
  });
});

describe("POST /:entity/upload/:id", () => {
  let server: Server;
  let base: string;
  let tmpDir: string;
  const saved = {
    uploadPath: config.uploadPath,
    uploadMaxSize: config.uploadMaxSize,
  };

  before(async () => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "evol-upload-"));
    config.uploadPath = tmpDir;
    config.uploadMaxSize = 1000;
    const app = express();
    app.post("/:entity/upload/:id", uploadOne);
    await new Promise<void>((resolve) => {
      server = app.listen(0, () => resolve());
    });
    const addr = server.address() as { port: number };
    base = `http://localhost:${addr.port}`;
  });

  after(() => {
    server.close();
    config.uploadPath = saved.uploadPath;
    config.uploadMaxSize = saved.uploadMaxSize;
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  const post = (entity: string, name: string, content = "hello") => {
    const body = new FormData();
    body.append("pix", new Blob([content]), name);
    return fetch(`${base}/${entity}/upload/1`, { method: "POST", body });
  };

  it("saves a valid file in the model folder", async () => {
    const r = await post("todo", "pic.png");
    assert.equal(r.status, 200);
    const d = await r.json();
    assert.deepEqual(d, {
      duplicate: false,
      fileName: "pic.png",
      id: "1",
      model: "todo",
    });
    assert.ok(fs.existsSync(path.join(tmpDir, "todo", "pic.png")));
  });

  it("does not overwrite an existing file", async () => {
    const r = await post("todo", "pic.png", "other");
    const d = await r.json();
    assert.equal(d.duplicate, true);
    assert.match(d.fileName, /^pic_[0-9a-f]{8}\.png$/);
    assert.equal(
      fs.readFileSync(path.join(tmpDir, "todo", "pic.png"), "utf8"),
      "hello",
    );
  });

  it("blocks path traversal in the file name", async () => {
    const r = await post("todo", "../../escape.png");
    assert.equal(r.status, 200);
    assert.equal((await r.json()).fileName, "escape.png");
    assert.ok(!fs.existsSync(path.join(tmpDir, "..", "escape.png")));
    assert.ok(fs.existsSync(path.join(tmpDir, "todo", "escape.png")));
  });

  it("rejects disallowed file types with 415", async () => {
    const r = await post("todo", "evil.html", "<script>");
    assert.equal(r.status, 415);
    assert.equal((await r.json()).uploaded, false);
    assert.ok(!fs.existsSync(path.join(tmpDir, "todo", "evil.html")));
  });

  it("rejects files over the size limit with 413", async () => {
    const r = await post("todo", "big.png", "x".repeat(2000));
    assert.equal(r.status, 413);
    assert.ok(!fs.existsSync(path.join(tmpDir, "todo", "big.png")));
  });

  it("returns 404 for an unknown model", async () => {
    const r = await post("nope", "pic.png");
    assert.equal(r.status, 404);
  });

  it("returns 400 when no file is sent", async () => {
    const r = await fetch(`${base}/todo/upload/1`, {
      method: "POST",
      body: new FormData(),
    });
    assert.equal(r.status, 400);
  });

  it("leaves no temporary files behind", () => {
    const files = fs.readdirSync(path.join(tmpDir, "todo"));
    assert.ok(files.every((f) => /\.png$/.test(f)), files.join(", "));
  });
});
