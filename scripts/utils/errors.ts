import type { Response } from "express";
import logger from "./logger.ts";

export function badRequest(res: Response, msg?: string, errorCode = 400) {
  const errorMsg = msg || "Bad request";

  logger.logError(msg);
  res.status(errorCode);
  return res.json({ error: errorMsg });
}

export default {
  badRequest,
};
