/*!
 * evolutility-server-node :: info.js
 *
 * https://github.com/evoluteur/evolutility-server-node
 * (c) 2026 Olivier Giulieri
 */

import { fieldInCharts, fieldTypes as ft } from "./utils/dico.js";
import { badRequest } from "./utils/errors.js";
import logger from "./utils/logger.js";
import pkg from "../package.json" with { type: "json" };
import { models } from "./utils/model-manager.js";
import config from "../config.js";

function getFieldsAPIs(model, protocol, baseUrl) {
  const charts = [];
  const lovs = [];
  model.fields.forEach((f) => {
    if (fieldInCharts(f)) {
      charts.push(`${protocol}${baseUrl}/${model.id}/chart/${f.id}`);
    }
    if (f.type === ft.lov) {
      lovs.push(`${protocol}${baseUrl}/${model.id}/lov/${f.id}`);
    }
  });
  return { charts, lovs };
}

function baseURL(req) {
  return (req.headers.host + req.url.split("?")[0]).replace(/\/$/, "");
}

const entityAPIs = (model, protocol, baseUrl, fullDescription) => {
  const pathToModel = `${protocol}${baseUrl}/${model.id}`;
  const { charts, lovs } = getFieldsAPIs(model, protocol, baseUrl);
  const mi = {
    id: model.id,
    title: model.title || model.label,
  };
  if (fullDescription) {
    mi.list = pathToModel;
    mi.charts = charts;
    mi.csv = pathToModel + "?format=csv";
    mi.lovs = lovs;
    if (!model.noStats) {
      mi.stats = pathToModel + "/stats";
    }
    mi.crud = {
      create: { method: "POST", url: pathToModel + "/" },
      read: { method: "GET", url: pathToModel + "/{id}" },
      update: { method: "PUT", url: pathToModel + "/{id}" },
      delete: { method: "DELETE", url: pathToModel + "/{id}" },
    };
  } else {
    mi.apis = `${protocol}${baseUrl}?id=${model.id}`;
  }
  return mi;
};

// - returns list of endpoint URLs for all active models
export function getAPIs(req, res) {
  logger.logReq("GET APIs", req);

  if (!config.apiInfo) {
    return res.json([]);
  }

  const baseUrl = baseURL(req);
  const protocol = req.protocol + "://";
  const mid = req.query.id;

  if (mid) {
    const m = models[mid];
    if (!m) {
      return badRequest(res, `Model not found: "${mid}".`, 404);
    }
    return res.json(entityAPIs(m, protocol, baseUrl, true));
  }

  const ms = Object.values(models)
    .filter((model) => model.active)
    .map((model) => entityAPIs(model, protocol, baseUrl, false));
  return res.json(ms);
}

// - returns version number (from package.json)
export function getVersion(req, res) {
  logger.logReq("GET VERSION", req);
  return res.json({
    name: pkg.name,
    version: pkg.version,
  });
}

export default {
  getVersion,
  getAPIs,
};
