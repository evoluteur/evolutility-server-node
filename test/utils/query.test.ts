import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { csvFileName } from "../../scripts/utils/query.ts";

describe("csvFileName", () => {
  it("names the file after the model", () => {
    assert.equal(csvFileName("todo"), "todo.csv");
    assert.equal(csvFileName("winecellar"), "winecellar.csv");
  });
  it("falls back to export.csv w/o a name", () => {
    assert.equal(csvFileName(), "export.csv");
    assert.equal(csvFileName(null), "export.csv");
    assert.equal(csvFileName(""), "export.csv");
  });
  it("keeps dots, dashes and underscores", () => {
    assert.equal(csvFileName("wine_tasting-2"), "wine_tasting-2.csv");
  });
  it("replaces characters unsafe in a file name or header", () => {
    assert.equal(csvFileName('a"b c/d\\e'), "a_b_c_d_e.csv");
    assert.equal(csvFileName("../../etc/passwd"), ".._.._etc_passwd.csv");
  });
});
