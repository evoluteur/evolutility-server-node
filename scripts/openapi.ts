/*!
 * evolutility-server-node :: openapi.ts
 * Generates an OpenAPI 3.1 spec from loaded models.
 *
 * https://github.com/evoluteur/evolutility-server-node
 * (c) 2026 Olivier Giulieri
 */

import type { Request, Response } from "express";
import pkg from "../package.json" with { type: "json" };
import { models } from "./utils/model-manager.ts";
import { fieldTypes as ft, fieldInCharts } from "./utils/dico.ts";
import config from "../config.ts";
import logger from "./utils/logger.ts";
import type { Field, Model } from "../models/types.ts";

// ---- field type → OpenAPI schema ------------------------------------------------

function fieldToSchema(f: Field): Record<string, unknown> {
  switch (f.type) {
    case ft.int:
      return {
        type: "integer",
        ...(f.min != null && { minimum: Number(f.min) }),
        ...(f.max != null && { maximum: Number(f.max) }),
      };
    case ft.dec:
    case ft.money:
      return { type: "number", format: "double" };
    case ft.bool:
      return { type: "boolean" };
    case ft.date:
      return { type: "string", format: "date" };
    case ft.time:
      return { type: "string", format: "time" };
    case ft.email:
      return { type: "string", format: "email" };
    case ft.url:
      return { type: "string", format: "uri" };
    case ft.list:
      return { type: "array", items: { type: "string" } };
    case ft.json:
      return { type: "object" };
    case ft.lov:
      return { type: "integer" };
    default: {
      const s: Record<string, unknown> = { type: "string" };
      if (f.maxLength) s.maxLength = f.maxLength;
      return s;
    }
  }
}

// ---- model → OpenAPI schema component -------------------------------------------

function modelToSchema(m: Model) {
  const properties: Record<string, unknown> = { id: { type: "integer", readOnly: true } };
  const required: string[] = [];

  for (const f of m.fields) {
    if (f.type === ft.hidden) continue;
    const prop = fieldToSchema(f);
    if (f.label) prop.description = f.label;
    properties[f.id] = prop;
    if (f.required) required.push(f.id);
  }

  if (config.wTimestamp) {
    properties[config.createdDateColumn] = {
      type: "string",
      format: "date-time",
      readOnly: true,
    };
    properties[config.updatedDateColumn] = {
      type: "string",
      format: "date-time",
      readOnly: true,
    };
  }

  const schema: Record<string, unknown> = { type: "object", properties };
  if (required.length) schema.required = required;
  return schema;
}

// ---- shared building blocks -----------------------------------------------------

const idParam = {
  name: "id",
  in: "path",
  required: true,
  schema: { type: "integer" },
  description: "Record ID",
};

const listQueryParams = [
  {
    name: "page",
    in: "query",
    schema: { type: "integer", minimum: 0, default: 0 },
    description: "Page number (0-based)",
  },
  {
    name: "pageSize",
    in: "query",
    schema: { type: "integer" },
    description: "Records per page",
  },
  {
    name: "order",
    in: "query",
    schema: { type: "string" },
    description: 'Sort field and direction, e.g. "title.asc"',
  },
  {
    name: "search",
    in: "query",
    schema: { type: "string" },
    description: "Full-text search across searchable fields",
  },
  {
    name: "format",
    in: "query",
    schema: { type: "string", enum: ["json", "csv"] },
    description: "Response format",
  },
];

const jsonRef = (modelId: string) => ({
  "application/json": { schema: { $ref: `#/components/schemas/${modelId}` } },
});
const jsonArr = (modelId: string) => ({
  "application/json": {
    schema: {
      type: "array",
      items: { $ref: `#/components/schemas/${modelId}` },
    },
  },
});
const errRef = () => ({
  "application/json": { schema: { $ref: "#/components/schemas/Error" } },
});

const listResponse = (modelId: string) => ({
  description: "List of records",
  headers: {
    _count: {
      schema: { type: "integer" },
      description: "Records in this page",
    },
    _full_count: {
      schema: { type: "integer" },
      description: "Total matching records",
    },
  },
  content: jsonArr(modelId),
});

// ---- model → OpenAPI paths ------------------------------------------------------

function modelToPaths(m: Model, apiBase: string) {
  const base = `${apiBase}${m.id}`;
  const tag = m.title || m.id;
  const { name = tag, namePlural = tag } = m;
  const paths: Record<string, unknown> = {};

  // GET list / POST create
  paths[`/${base}`] = {
    get: {
      summary: `List ${namePlural}`,
      operationId: `list_${m.id}`,
      tags: [tag],
      parameters: listQueryParams,
      responses: {
        200: listResponse(m.id),
        404: { description: "Model not found", content: errRef() },
      },
    },
    post: {
      summary: `Create ${name}`,
      operationId: `create_${m.id}`,
      tags: [tag],
      requestBody: { required: true, content: jsonRef(m.id) },
      responses: {
        200: { description: "Created record", content: jsonRef(m.id) },
        400: { description: "Bad request", content: errRef() },
        404: { description: "Model not found", content: errRef() },
      },
    },
  };

  // GET one / PATCH / PUT / DELETE
  paths[`/${base}/{id}`] = {
    get: {
      summary: `Get ${name}`,
      operationId: `get_${m.id}`,
      tags: [tag],
      parameters: [
        idParam,
        {
          name: "shallow",
          in: "query",
          schema: { type: "boolean" },
          description: "Omit sub-collections",
        },
      ],
      responses: {
        200: { description: "Record", content: jsonRef(m.id) },
        404: { description: "Not found", content: errRef() },
      },
    },
    patch: {
      summary: `Update ${name}`,
      operationId: `update_${m.id}`,
      tags: [tag],
      parameters: [idParam],
      requestBody: { required: true, content: jsonRef(m.id) },
      responses: {
        200: { description: "Updated record", content: jsonRef(m.id) },
        400: { description: "Bad request", content: errRef() },
        404: { description: "Not found", content: errRef() },
      },
    },
    put: {
      summary: `Replace ${name}`,
      operationId: `replace_${m.id}`,
      tags: [tag],
      parameters: [idParam],
      requestBody: { required: true, content: jsonRef(m.id) },
      responses: {
        200: { description: "Updated record", content: jsonRef(m.id) },
        400: { description: "Bad request", content: errRef() },
        404: { description: "Not found", content: errRef() },
      },
    },
    delete: {
      summary: `Delete ${name}`,
      operationId: `delete_${m.id}`,
      tags: [tag],
      parameters: [idParam],
      responses: {
        200: {
          description: "Deleted record ID",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: { id: { type: "integer" } },
              },
            },
          },
        },
        404: { description: "Not found", content: errRef() },
      },
    },
  };

  // Stats
  if (!m.noStats) {
    paths[`/${base}/stats`] = {
      get: {
        summary: `Stats for ${namePlural}`,
        operationId: `stats_${m.id}`,
        tags: [tag],
        responses: {
          200: {
            description:
              "Field-level statistics (min, max, avg, count per value)",
          },
          404: { description: "Model not found", content: errRef() },
        },
      },
    };
  }

  // Charts
  const chartFields = m.fields.filter(fieldInCharts);
  if (chartFields.length) {
    paths[`/${base}/chart/{field}`] = {
      get: {
        summary: `Chart data for ${namePlural}`,
        operationId: `chart_${m.id}`,
        tags: [tag],
        parameters: [
          {
            name: "field",
            in: "path",
            required: true,
            schema: { type: "string", enum: chartFields.map((f) => f.id) },
            description: "Field to chart",
          },
        ],
        responses: {
          200: { description: "Array of { label, value } counts" },
        },
      },
    };
  }

  // LOVs
  const lovFields = m.fields.filter((f) => f.type === ft.lov);
  if (lovFields.length) {
    paths[`/${base}/lov/{field}`] = {
      get: {
        summary: `List-of-values for ${namePlural}`,
        operationId: `lov_${m.id}`,
        tags: [tag],
        parameters: [
          {
            name: "field",
            in: "path",
            required: true,
            schema: { type: "string", enum: lovFields.map((f) => f.id) },
          },
          {
            name: "search",
            in: "query",
            schema: { type: "string" },
            description: "Filter by text",
          },
        ],
        responses: {
          200: {
            description: "LOV entries",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      id: { type: "integer" },
                      text: { type: "string" },
                    },
                  },
                },
              },
            },
          },
        },
      },
    };
  }

  // Sub-collections
  if (m.collections?.length) {
    paths[`/${base}/collec/{collec}`] = {
      get: {
        summary: `Sub-collection for ${namePlural}`,
        operationId: `collec_${m.id}`,
        tags: [tag],
        parameters: [
          {
            name: "collec",
            in: "path",
            required: true,
            schema: { type: "string", enum: m.collections.map((c) => c.id) },
          },
          {
            name: "id",
            in: "query",
            required: true,
            schema: { type: "integer" },
            description: "Parent record ID",
          },
        ],
        responses: {
          200: { description: "Sub-collection records" },
          400: { description: "Invalid parent ID", content: errRef() },
        },
      },
    };
  }

  return paths;
}

// ---- spec generator -------------------------------------------------------------

export function generateSpec(req: Request) {
  const activeModels = Object.values(models).filter((m) => m.active);
  const apiBase = config.apiPath.replace(/^\//, ""); // strip leading slash for path keys

  const schemas: Record<string, unknown> = {
    Error: {
      type: "object",
      properties: { error: { type: "string" } },
    },
  };

  let paths: Record<string, unknown> = {};
  for (const m of activeModels) {
    schemas[m.id] = modelToSchema(m);
    Object.assign(paths, modelToPaths(m, apiBase));
  }

  return {
    openapi: "3.1.0",
    info: {
      title: "Evolutility API",
      version: pkg.version,
      description: pkg.description,
    },
    servers: [
      {
        url: `${req.protocol}://${req.headers.host}`,
        description: "Current server",
      },
    ],
    tags: activeModels.map((m) => ({
      name: m.title || m.id,
      ...(m.world && { description: `World: ${m.world}` }),
    })),
    paths,
    components: { schemas },
  };
}

export function getOpenAPISpec(req: Request, res: Response) {
  logger.logReq("GET OPENAPI", req);
  res.json(generateSpec(req));
}

export default { generateSpec, getOpenAPISpec };
