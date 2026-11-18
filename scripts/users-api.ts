/*!
 * evolutility-server-node :: users-api.ts
 * REST end-points to manage users (admin role): auth/users
 *
 * https://github.com/evoluteur/evolutility-server-node
 * (c) 2026 Olivier Giulieri
 */

import type { Request, Response } from "express";
import logger from "./utils/logger.ts";
import { badRequest } from "./utils/errors.ts";
import users, { UserError } from "./utils/user-store.ts";

const userId = (req: Request) => parseInt(req.params.id as string, 10);

function sendError(res: Response, err: unknown) {
  if (err instanceof UserError) {
    return badRequest(res, err.message, err.status);
  }
  logger.logError(err);
  return badRequest(res, "Database error (users table missing?).", 500);
}

// - GET auth/users
export async function list(req: Request, res: Response) {
  logger.logReq("GET USERS", req);
  try {
    return res.json(await users.listUsers());
  } catch (err) {
    return sendError(res, err);
  }
}

// - POST auth/users { email, name, role, password? } (password generated if
// - missing, and returned once)
export async function create(req: Request, res: Response) {
  logger.logReq("POST USER", req);
  try {
    return res.status(201).json(await users.createUser(req.body || {}));
  } catch (err) {
    return sendError(res, err);
  }
}

// - PATCH auth/users/:id { name?, role?, active?, password?, resetPassword? }
export async function update(req: Request, res: Response) {
  logger.logReq("PATCH USER", req);
  const id = userId(req);
  if (!Number.isInteger(id)) return badRequest(res, "Invalid user id.");
  try {
    return res.json(await users.updateUser(id, req.body || {}, req.user!));
  } catch (err) {
    return sendError(res, err);
  }
}

// - DELETE auth/users/:id
export async function remove(req: Request, res: Response) {
  logger.logReq("DELETE USER", req);
  const id = userId(req);
  if (!Number.isInteger(id)) return badRequest(res, "Invalid user id.");
  try {
    return res.json(await users.deleteUser(id, req.user!));
  } catch (err) {
    return sendError(res, err);
  }
}

export default { list, create, update, remove };
