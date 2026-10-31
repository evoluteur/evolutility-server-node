import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  fieldIsNumber,
  fieldIsText,
  fieldIsDateOrTime,
  fieldIsNumeric,
  fieldChartable,
  fieldInCharts,
} from "../../scripts/utils/dico.ts";
import type { Field } from "../../models/types.ts";

const f = (type: string, extra: Partial<Field> = {}): Field =>
  ({ id: "f", label: "F", type, ...extra } as Field);

describe("fieldIsNumber", () => {
  it("is true for integer, decimal, money", () => {
    assert.ok(fieldIsNumber(f("integer")));
    assert.ok(fieldIsNumber(f("decimal")));
    assert.ok(fieldIsNumber(f("money")));
  });
  it("is false for text, boolean, lov, date", () => {
    assert.ok(!fieldIsNumber(f("text")));
    assert.ok(!fieldIsNumber(f("boolean")));
    assert.ok(!fieldIsNumber(f("lov")));
    assert.ok(!fieldIsNumber(f("date")));
  });
});

describe("fieldIsText", () => {
  it("is true for text, textmultiline, url, html, email", () => {
    assert.ok(fieldIsText(f("text")));
    assert.ok(fieldIsText(f("textmultiline")));
    assert.ok(fieldIsText(f("url")));
    assert.ok(fieldIsText(f("html")));
    assert.ok(fieldIsText(f("email")));
  });
  it("is false for integer, boolean, lov, date", () => {
    assert.ok(!fieldIsText(f("integer")));
    assert.ok(!fieldIsText(f("boolean")));
    assert.ok(!fieldIsText(f("lov")));
    assert.ok(!fieldIsText(f("date")));
  });
});

describe("fieldIsDateOrTime", () => {
  it("is true for date, datetime, time", () => {
    assert.ok(fieldIsDateOrTime(f("date")));
    assert.ok(fieldIsDateOrTime(f("datetime")));
    assert.ok(fieldIsDateOrTime(f("time")));
  });
  it("is false for text, integer, boolean", () => {
    assert.ok(!fieldIsDateOrTime(f("text")));
    assert.ok(!fieldIsDateOrTime(f("integer")));
    assert.ok(!fieldIsDateOrTime(f("boolean")));
  });
});

describe("fieldIsNumeric", () => {
  it("is true for numbers and date/time types", () => {
    assert.ok(fieldIsNumeric(f("integer")));
    assert.ok(fieldIsNumeric(f("decimal")));
    assert.ok(fieldIsNumeric(f("money")));
    assert.ok(fieldIsNumeric(f("date")));
    assert.ok(fieldIsNumeric(f("datetime")));
    assert.ok(fieldIsNumeric(f("time")));
  });
  it("is false for text, boolean, lov", () => {
    assert.ok(!fieldIsNumeric(f("text")));
    assert.ok(!fieldIsNumeric(f("boolean")));
    assert.ok(!fieldIsNumeric(f("lov")));
  });
});

describe("fieldChartable", () => {
  it("is true for lov, boolean, and numeric types", () => {
    assert.ok(fieldChartable(f("lov")));
    assert.ok(fieldChartable(f("boolean")));
    assert.ok(fieldChartable(f("integer")));
    assert.ok(fieldChartable(f("decimal")));
    assert.ok(fieldChartable(f("money")));
  });
  it("is false for text, date, image", () => {
    assert.ok(!fieldChartable(f("text")));
    assert.ok(!fieldChartable(f("date")));
    assert.ok(!fieldChartable(f("image")));
  });
});

describe("fieldInCharts", () => {
  it("is true for chartable field without noCharts flag", () => {
    assert.ok(fieldInCharts(f("boolean")));
    assert.ok(fieldInCharts(f("lov")));
    assert.ok(fieldInCharts(f("integer")));
  });
  it("is false when noCharts is set", () => {
    assert.ok(!fieldInCharts(f("boolean", { noCharts: true })));
    assert.ok(!fieldInCharts(f("integer", { noCharts: true })));
  });
  it("is false for non-chartable types regardless of noCharts", () => {
    assert.ok(!fieldInCharts(f("text")));
    assert.ok(!fieldInCharts(f("date")));
  });
});
