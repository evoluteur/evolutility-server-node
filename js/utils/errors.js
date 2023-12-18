import logger from "./logger.js";

export function badRequest(res, msg, errorCode = 400) {
  const errorMsg = msg || "Bad request";

  logger.logError(msg);
  res.statusMessage = errorMsg;
  res.status(errorCode); //.end();
  return res.json({ error: errorMsg });
}

export default {
  badRequest,
};
