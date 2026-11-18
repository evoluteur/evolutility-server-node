import { describe, it, after } from "node:test";
import assert from "node:assert/strict";
import { testModels as fileModels } from "../fixtures/models/index.ts";
import mm, {
  models,
  getModel,
  setModel,
  setModels,
  removeModel,
} from "../../scripts/utils/model-manager.ts";
import type { Model } from "../../scripts/types.ts";

describe("model-manager (hot reload)", () => {
  after(() => setModels(fileModels));

  it("has the models that were set", () => {
    assert.ok(getModel("todo"));
    assert.equal(models.todo.schemaTable, '"evolutility"."task"');
  });

  it("setModel adds or replaces a model in the same 'models' object", () => {
    const ref = models;
    const todo = structuredClone(fileModels.todo) as Model;
    todo.fields.push({ id: "tag", type: "text", label: "Tag", column: "tag" });
    setModel(todo);
    assert.equal(ref, models);
    assert.ok(getModel("todo")!.fieldsH!.tag);
    assert.ok(!fileModels.todo.fields.find((f) => f.id === "tag"));
  });

  it("ignores UI-only fields", () => {
    const todo = structuredClone(fileModels.todo) as Model;
    todo.fields.push({ id: "ui", type: "text", label: "UI", onlyUI: true });
    setModel(todo);
    assert.equal(getModel("todo")!.fieldsH!.ui, undefined);
    assert.ok(mm.getRawModel("todo"));
  });

  it("re-prepares collections that point to a changed model", () => {
    const track = structuredClone(fileModels.track) as Model;
    track.fields[0].label = "Changed";
    setModel(track);
    const collec = getModel("album")!.collecsH!.tracks ||
      Object.values(getModel("album")!.collecsH!)[0];
    assert.ok(collec);
  });

  it("removeModel removes it", () => {
    removeModel("todo");
    assert.equal(getModel("todo"), undefined);
    assert.ok(!mm.modelIds.includes("todo"));
  });
});
