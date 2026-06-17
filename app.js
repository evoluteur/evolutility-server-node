/*
  ______          _           _ _ _
 |  ____|        | |      /| (_) (_)/|
 | |____   _____ | |_   _| |_ _| |_| |_ _   _
 |  __\ \ / / _ \| | | | | __| | | | __| | | |
 | |___\ V / (_) | | |_| | |_| | | | |_| |_| |
 |______\_/ \___/|_|\__,_|\__|_|_|_|\__|\__, |
         ___  ___ _ ____   _____ _ __    __/ |
  ____  / __|/ _ \ '__\ \ / / _ \ '__|  |___/
 |____| \__ \  __/ |   \ V /  __/ |
        |___/\___|_|    \_/ \___|_|

* https://github.com/evoluteur/evolutility-server-node
* (c) 2026 Olivier Giulieri
*/

import express from "express";
import path from "path";
import helmet from "helmet";
import routes from "./js/routes.js";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "./client", "public")));

// - prevent denial of cross origin requests
// TODO: REMOVE IF UNNECESSARY
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept",
  );
  //res.header("Access-Control-Request-Headers", "X-Requested-With,Access-Control-Request-Method,Access-Control-Request-Headers, accept, Content-Type");
  next();
});

// - REST server
app.use("/", routes);

// error handler
app.use(function (err, req, res, next) {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error:
      app.get("env") === "development" ? err.message : "Internal server error",
  });
});

export default app;
