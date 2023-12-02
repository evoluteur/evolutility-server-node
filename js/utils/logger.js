/*!
 * evolutility-server-node :: utils/logger.js
 * Simple formatted console logger (not logging to file).
 *
 * https://github.com/evoluteur/evolutility-server-node
 * (c) 2022 Olivier Giulieri
 */

const config = require("../../config.js"),
  pkg = require("../../package.json"),
  chalk = require("chalk"),
  _ = require("underscore"),
  fileLog = config.logToFile,
  consoleLog = config.logToConsole;
let log = {};
if (fileLog) {
  const SimpleNodeLogger = require("simple-node-logger"),
    opts = {
      logFilePath: "evol-" + new Date().toISOString().substring(0, 10) + ".log",
      timestampFormat: "YYYY-MM-DD HH:mm:ss.SSS",
    };
  log = SimpleNodeLogger.createSimpleLogger(opts);
}

const asciiArt =
  `  ______          _           _ _ _
 |  ____|        | |      /| (_) (_)/|
 | |____   _____ | |_   _| |_ _| |_| |_ _   _
 |  __\\ \\ / / _ \\| | | | | __| | | | __| | | |
 | |___\\ V / (_) | | |_| | |_| | | | |_| |_| |
 |______\\_/ \\___/|_|\\__,_|\\__|_|_|_|\\__|\\__, |
         ___  ___ _ ____   _____ _ __    __/ |
  ____  / __|/ _ \\ \'__\\ \\ / / _ \\ \'__|  |___/
 |____| \\__ \\  __/ |   \\ V /  __/ |
        |___/\\___|_|    \\_/ \\___|_|    v` + pkg.version;

function green(msg) {
  if (consoleLog) {
    console.error(chalk.green(msg));
  }
}

function maskedConnection() {
  // TODO: is there other patterns?
  const conn = config.connectionString || "";
  const s = conn.split(":");
  if (s.length > 1) {
    s[2] = "(SECRET)" + s[2].substring(s[2].indexOf("@"));
    return s.join(":");
  }
  return "N/A";
}
const pubConnection = maskedConnection();

module.exports = {
  ascii_art: asciiArt,

  startupMessage() {
    if (consoleLog) {
      console.log(asciiArt);
    }
    const restPath = "http://localhost:" + config.apiPort + config.apiPath;
    console.log(
      "\nEvolutility server listening on port " +
        config.apiPort +
        "\n" +
        "\n - REST API:            " +
        restPath +
        "\n - Postgres connection: " +
        pubConnection +
        "\n - Postgres schema:     " +
        config.schema +
        "\n - Documentation:       " +
        pkg.homepage
    );
    if (fileLog) {
      log.info(
        "STARTING Evolutility-Server-Node schema=" +
          config.schema +
          " db=" +
          pubConnection +
          "url=" +
          restPath
      );
    }
  },

  logHeader(ql, action, entity, id) {
    const msg =
      ql +
      " > " +
      action +
      " : " +
      (entity ? entity : "") +
      (id ? " " + id : "");
    if (fileLog) {
      log.info(msg);
    }
    console.log(chalk.cyan(msg));
  },

  logReq(title, req, reqType = "REST") {
    this.logHeader(
      reqType,
      title,
      req.params && req.params.entity,
      req.params && req.params.id
    );
    if (consoleLog) {
      if (!_.isEmpty(req.params)) {
        console.log("params = " + JSON.stringify(req.params, null, 2));
      }
      if (!_.isEmpty(req.query)) {
        console.log("query = " + JSON.stringify(req.query, null, 2));
      }
      if (!_.isEmpty(req.body)) {
        console.log("body = " + JSON.stringify(req.body, null, 2));
      }
    }
    if (fileLog) {
      log.info({
        params: req.params,
        query: req.query,
        body: req.body,
      });
    }
  },

  logObject(title, obj) {
    if (fileLog) {
      log.info(title + " = ", obj);
    } else if (consoleLog) {
      console.log(title + " = " + JSON.stringify(obj, null, 2));
    }
  },

  logSQL(sql, values) {
    if (fileLog) {
      log.info("sql = ", sql);
    } else if (consoleLog) {
      console.log("sql = \n" + sql + "\n");
      if (values) {
        this.logObject("values = \n", values);
      }
    }
  },

  logCount: (nbRecords, prep) => {
    const msg =
      "Sending " + nbRecords + (prep ? " prepared" : "") + " records.";
    if (fileLog) {
      log.info(msg);
    }
    return green(msg);
  },

  green: green,

  logSuccess(msg) {
    green(msg);
  },

  logError(err, moreInfo) {
    if (consoleLog) {
      console.error(chalk.red(err));
      if (moreInfo) {
        console.error(chalk.red(moreInfo));
      }
    }
    if (fileLog) {
      log.error(err, moreInfo);
    }
  },

  errorMsg(err, method) {
    if (fileLog) {
      log.error(err);
    }
    if (consoleLog) {
      this.logError(err);
      return {
        error: err,
        method: method,
      };
    } else {
      return {
        error: "Error",
      };
    }
  },

  logToFile(mType, msg) {
    if (fileLog) {
      log[mType](msg);
    }
  },
};
