/*!
 * evolutility-server-node :: utils/shutdown.ts
 * Clean shutdown: on stop (SIGINT, SIGTERM) or crash, stop accepting
 * requests, let the requests in progress finish, close the connections to
 * the database, then exit.
 *
 * https://github.com/evoluteur/evolutility-server-node
 * (c) 2026 Olivier Giulieri
 */

import logger from "./logger.ts";

interface ClosableServer {
  close(callback?: (err?: Error) => void): unknown;
  closeIdleConnections?(): void;
}

export interface ShutdownOptions {
  server: ClosableServer;
  // - close the database connection pool
  closeDb: () => void | Promise<void>;
  // - time given to requests in progress before forcing the exit
  timeoutMs?: number;
  exit?: (code: number) => void;
  log?: { info: (msg: string) => void; error: (err: unknown) => void };
}

export function makeShutdown({
  server,
  closeDb,
  timeoutMs = 10000,
  exit = (code) => process.exit(code),
  log = { info: (m) => logger.logSuccess(m), error: (e) => logger.logError(e) },
}: ShutdownOptions) {
  let stopping = false;

  return async function shutdown(reason: string, code = 0) {
    if (stopping) {
      // - 2nd Ctrl+C: don't wait
      log.info(`${reason} again, exiting now.`);
      exit(code || 1);
      return;
    }
    stopping = true;
    log.info(`${reason}: closing the server...`);

    const timer = setTimeout(() => {
      log.error(
        `Requests still in progress after ${timeoutMs / 1000}s, forcing the exit.`,
      );
      exit(code || 1);
    }, timeoutMs);
    timer.unref?.();

    // - stop accepting connections, wait for the requests in progress
    const closed = new Promise<void>((resolve) => server.close(() => resolve()));
    // - keep-alive connections w/o request would keep the server open
    server.closeIdleConnections?.();
    await closed;

    try {
      await closeDb();
      log.info("Connections to the database closed.");
    } catch (err) {
      log.error(err);
    }
    clearTimeout(timer);
    exit(code);
  };
}

// - call shutdown on stop signals and on errors that would crash the process
export function handleShutdown(shutdown: (reason: string, code?: number) => unknown) {
  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("uncaughtException", (err) => {
    logger.logError(err);
    shutdown("Uncaught exception", 1);
  });
  process.on("unhandledRejection", (err) => {
    logger.logError(err);
    shutdown("Unhandled promise rejection", 1);
  });
}

export default { makeShutdown, handleShutdown };
