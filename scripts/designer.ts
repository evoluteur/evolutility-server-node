/*!
 * evolutility-server-node :: designer.ts
 * REST end-points to read and edit the models stored in the database
 * (enabled by config.apiDesigner).
 *
 * https://github.com/evoluteur/evolutility-server-node
 * (c) 2026 Olivier Giulieri
 */

import type { Request, Response } from "express";
import logger from "./utils/logger.ts";
import { badRequest } from "./utils/errors.ts";
import store, { ModelError } from "./utils/model-store.ts";
import { modelSchema } from "./utils/model-schema.ts";

const isDryRun = (req: Request) =>
  req.query.dryRun === "true" || req.query.dryRun === "1";

function sendError(res: Response, err: unknown) {
  if (err instanceof ModelError) {
    logger.logError(err.message);
    res.status(err.status);
    return res.json(
      err.invalids ? { error: err.message, invalids: err.invalids } : { error: err.message },
    );
  }
  logger.logError(err);
  return badRequest(
    res,
    "Database error: " + (err instanceof Error ? err.message : String(err)),
    500,
  );
}

const saveResponse = (r: Awaited<ReturnType<typeof store.saveModel>>) => ({
  model: { ...r.model, _version: r.version },
  sql: r.sql,
  warnings: r.warnings,
  dryRun: r.dryRun,
});

// - GET meta/schema (JSON Schema of the metamodel, for the Designer)
export function getSchema(req: Request, res: Response) {
  logger.logReq("GET MODEL SCHEMA", req);
  return res.json(modelSchema);
}

// - GET meta/models
export async function getModels(req: Request, res: Response) {
  logger.logReq("GET all MODELS", req);
  try {
    return res.json(await store.listModels());
  } catch (err) {
    return sendError(res, err);
  }
}

// - GET meta/models/:id
export async function getModel(req: Request, res: Response) {
  logger.logReq("GET one MODEL", req);
  try {
    const m = await store.getStoredModel(req.params.id as string);
    return m ? res.json(m) : badRequest(res, `Model not found: "${req.params.id}".`, 404);
  } catch (err) {
    return sendError(res, err);
  }
}

// - GET meta/models/:id/history
export async function getHistory(req: Request, res: Response) {
  logger.logReq("GET MODEL history", req);
  try {
    return res.json(await store.listHistory(req.params.id as string));
  } catch (err) {
    return sendError(res, err);
  }
}

// - GET meta/models/:id/history/:version
export async function getHistoryVersion(req: Request, res: Response) {
  logger.logReq("GET MODEL version", req);
  const version = parseInt(req.params.version as string, 10);
  if (!Number.isInteger(version)) {
    return badRequest(res, "Invalid version.");
  }
  try {
    const m = await store.getHistoryVersion(req.params.id as string, version);
    return m ? res.json(m) : badRequest(res, "Version not found.", 404);
  } catch (err) {
    return sendError(res, err);
  }
}

// - POST meta/models (?dryRun=true to only check)
export async function createModel(req: Request, res: Response) {
  logger.logReq("POST MODEL", req);
  try {
    const r = await store.saveModel(req.body, { create: true, dryRun: isDryRun(req) });
    return res.status(r.dryRun ? 200 : 201).json(saveResponse(r));
  } catch (err) {
    return sendError(res, err);
  }
}

// - PUT meta/models/:id (body: model w/ "_version"; ?dryRun=true to only check)
export async function updateModel(req: Request, res: Response) {
  logger.logReq("PUT MODEL", req);
  const body = (req.body || {}) as Record<string, unknown>;
  const version = body._version ?? req.query.version;
  if (version === undefined) {
    return badRequest(res, 'The "_version" of the model is required.');
  }
  try {
    const r = await store.saveModel(body, {
      id: req.params.id as string,
      version: Number(version),
      dryRun: isDryRun(req),
    });
    return res.json(saveResponse(r));
  } catch (err) {
    return sendError(res, err);
  }
}

// - DELETE meta/models/:id (the table and its data are kept)
export async function deleteModel(req: Request, res: Response) {
  logger.logReq("DELETE MODEL", req);
  try {
    return res.json(await store.deleteModel(req.params.id as string));
  } catch (err) {
    return sendError(res, err);
  }
}

export default {
  getSchema,
  getModels,
  getModel,
  getHistory,
  getHistoryVersion,
  createModel,
  updateModel,
  deleteModel,
};
