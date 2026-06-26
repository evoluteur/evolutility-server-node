/* eslint-disable no-useless-escape */
/*!
 * evolutility-server-node :: utils/logger.ts
 *
 * https://github.com/evoluteur/evolutility-server-node
 * (c) 2026 Olivier Giulieri
 */

import pino from "pino";
import config from "../../config.ts";
import pkg from "../../package.json" with { type: "json" };
import type { Request } from "express";

const { logToFile: fileLog, logToConsole: consoleLog } = config;

// #region ---- pino setup ----------------------------------------------------------------

const targets: pino.TransportTargetOptions[] = [];

if (consoleLog) {
  targets.push({
    target: "pino-pretty",
    options: {
      colorize: true,
      translateTime: "SYS:HH:MM:ss",
      ignore: "pid,hostname",
    },
  });
}

if (fileLog) {
  targets.push({
    target: "pino/file",
    options: {
      destination: `evol-${new Date().toISOString().substring(0, 10)}.log`,
      append: true,
    },
  });
}

const log = targets.length
  ? pino({ level: "debug" }, pino.transport({ targets }))
  : pino({ level: "silent" });

// #endregion
// #region  ---- helpers -------------------------------------------------------------------

function maskedConnection() {
  const conn = config.connectionString || "";
  const s = conn.split(":");
  if (s.length > 1) {
    s[2] = `(SECRET)${s[2].substring(s[2].indexOf("@"))}`;
    return s.join(":");
  }
  return "N/A";
}

const pubConnection = maskedConnection();

const asciiArt = `  ______          _           _ _ _
 |  ____|        | |      /| (_) (_)/|
 | |____   _____ | |_   _| |_ _| |_| |_ _   _
 |  __\\ \\ / / _ \\| | | | | __| | | | __| | | |
 | |___\\ V / (_) | | |_| | |_| | | | |_| |_| |
 |______\\_/ \\___/|_|\\__,_|\\__|_|_|_|\\__|\\__, |
         ___  ___ _ ____   _____ _ __    __/ |
  ____  / __|/ _ \\ '__\\ \\ / / _ \\ \'__|  |___/
 |____| \\__ \\  __/ |   \\ V /  __/ |
        |___/\\___|_|    \\_/ \\___|_|    v${pkg.version}
`;

// #endregion
// #region  ---- public API -------------------------------------------------------------------

const evoLogger = {
  startupMessage() {
    console.log(asciiArt);
    const rootPath = `http://localhost:${config.apiPort || 2000}`;
    const restPath = `${rootPath}${config.apiPath}`;
    const swaggerUI = `${rootPath}/api-docs.html`;
    log.info(
      { restPath, swaggerUI, db: pubConnection, dbSchema: config.schema },
      `evolutility-server-node started`,
    );
  },

  logReq(title: string, req: Request, reqType = "REST") {
    const data: Record<string, unknown> = {};
    if (req.params && Object.keys(req.params).length) data.params = req.params;
    if (req.query && Object.keys(req.query).length) data.query = req.query;
    if (req.body && Object.keys(req.body).length) data.body = req.body;
    log.info(data, `${reqType} > ${title}`);
  },

  logHeader(category: string, subcategory: string, detail: string) {
    log.info(`${category} > ${subcategory} > ${detail}`);
  },

  logObject(title: string, obj: unknown) {
    log.info({ [title]: obj });
  },

  logSQL(sql: string, values?: unknown) {
    const data: Record<string, unknown> = { sql };
    if (values) data.values = values;
    log.debug(data, "SQL");
  },

  logCount(nbRecords: number, prep?: boolean) {
    log.info(`Sending ${nbRecords}${prep ? " prepared" : ""} records.`);
  },

  logSuccess(msg: string) {
    log.info(msg);
  },

  logError(err: unknown) {
    if (err instanceof Error) {
      log.error({ err }, err.message);
    } else {
      log.error(String(err));
    }
  },

  errorMsg(err: unknown, method: string) {
    this.logError(err);
    return {
      error: err instanceof Error ? err.message : String(err),
      method,
    };
  },

  logToFile(mType: string, msg: string) {
    (log as unknown as Record<string, (msg: string) => void>)[mType]?.(msg);
  },
};

// #endregion

export default evoLogger;
