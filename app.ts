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

import express, {
  type Request,
  type Response,
  type NextFunction,
} from "express";
import path from "path";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import routes from "./scripts/routes.ts";
import logger from "./scripts/utils/logger.ts";
import config from "./config.ts";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

if (config.trustProxy) {
  app.set("trust proxy", 1);
}

if (config.rateLimit) {
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000,
      limit: config.rateLimit,
      standardHeaders: "draft-8",
      legacyHeaders: false,
    }),
  );
}

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "https://unpkg.com"],
        styleSrc: ["'self'", "https://unpkg.com"],
        imgSrc: ["'self'", "data:", "https://unpkg.com"],
        connectSrc: ["'self'", "https://unpkg.com"],
      },
    },
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "./client", "public")));

// - prevent denial of cross origin requests
// TODO: REMOVE IF UNNECESSARY
app.use(function (req: Request, res: Response, next: NextFunction) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept",
  );
  next();
});

// - REST server
app.use("/", routes);

// error handler
app.use(function (
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  logger.logError(err);
  res.status((err as { status?: number }).status || 500).json({
    error:
      app.get("env") === "development"
        ? err instanceof Error
          ? err.message
          : String(err)
        : "Internal server error",
  });
});

export default app;
