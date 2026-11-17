#!/usr/bin/env node

/**
 * Module dependencies.
 */

import app from "../app.ts";
import config from "../config.ts";
import http from "http";
import Debug from "debug";
import { initModels } from "../scripts/utils/model-store.ts";
import logger from "../scripts/utils/logger.ts";

const debug = Debug("evolutility:server");

/**
 * Get port from environment and store in Express.
 */
const port = normalizePort(config.apiPort || "2000");
app.set("port", port);

/**
 * Create HTTP server.
 */

const server = http.createServer(app);

/**
 * Listen on provided port, on all network interfaces.
 */

// - models are stored in the database (table "evol_model")
try {
  const nb = await initModels();
  logger.logSuccess(`${nb} models loaded from the database.`);
} catch (err) {
  logger.logError(
    "Could not load models from the database. " +
      (err instanceof Error ? err.message : String(err)),
  );
}

server.listen(port);
server.on("error", onError);
server.on("listening", onListening);

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val: string | number): number | string | false {
  const port = parseInt(String(val), 10);

  if (isNaN(port)) {
    // named pipe
    return String(val);
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error: NodeJS.ErrnoException) {
  if (error.syscall !== "listen") {
    throw error;
  }

  const bind = typeof port === "string" ? "Pipe " + port : "Port " + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case "EACCES":
      console.error(bind + " requires elevated privileges");
      process.exit(1);
      break;
    case "EADDRINUSE":
      console.error(bind + " is already in use");
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  const addr = server.address();
  const bind = typeof addr === "string" ? "pipe " + addr : "port " + addr?.port;
  debug("Listening on " + bind);
}
