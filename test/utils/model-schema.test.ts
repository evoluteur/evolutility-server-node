import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { modelSchema } from "../../scripts/utils/model-schema.ts";
import {
  fieldTypeIds,
  normalizeModel,
} from "../../scripts/utils/model-validate.ts";
import { testModels } from "../fixtures/models/index.ts";

type Obj = Record<string, unknown>;
const defs = modelSchema.definitions;

// - checks "required" and "additionalProperties: false" (what the editor flags)
const unknownOrMissing = (obj: Obj, schema: { properties: Obj; required: string[] }, path: string) => [
  ...Object.keys(obj)
    .filter((k) => !(k in schema.properties))
    .map((k) => `${path}.${k} (unknown)`),
  ...schema.required.filter((k) => !(k in obj)).map((k) => `${path}.${k} (missing)`),
];

describe("modelSchema", () => {
  it("is plain JSON", () => {
    assert.deepEqual(JSON.parse(JSON.stringify(modelSchema)), modelSchema);
  });

  it("has the same field types as the validation", () => {
    assert.deepEqual(defs.field.properties.type.enum, fieldTypeIds);
  });

  it("uses the same patterns as the validation for SQL names", () => {
    const re = new RegExp(defs.field.properties.column.pattern);
    assert.ok(re.test("category_id"));
    assert.ok(!re.test("x; drop table task"));
    const orderBy = new RegExp(defs.collection.properties.orderBy.pattern, "i");
    assert.ok(orderBy.test("position, t1.id desc"));
    assert.ok(!orderBy.test("1; drop table x"));
  });

  it("describes every property (for hover tooltips)", () => {
    for (const s of [modelSchema, defs.field, defs.group, defs.collection]) {
      for (const [k, p] of Object.entries(s.properties)) {
        assert.ok((p as Obj).description, k);
      }
    }
  });

  it("accepts the test models", () => {
    const problems: string[] = [];
    Object.values(testModels).forEach((m) => {
      const n = normalizeModel(m, testModels) as unknown as Obj;
      problems.push(...unknownOrMissing(n, modelSchema, n.id as string));
      (n.fields as Obj[]).forEach((f) =>
        problems.push(...unknownOrMissing(f, defs.field, `${n.id}.${f.id}`)),
      );
      ((n.groups as Obj[]) || []).forEach((g) =>
        problems.push(...unknownOrMissing(g, defs.group, `${n.id}.group`)),
      );
      ((n.collections as Obj[]) || []).forEach((c) =>
        problems.push(...unknownOrMissing(c, defs.collection, `${n.id}.${c.id}`)),
      );
    });
    assert.deepEqual(problems, []);
  });
});
