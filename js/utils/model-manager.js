/*!
 * evolutility :: utils/model-manager.js
 * Helper functions for metadata
 *
 * https://github.com/evoluteur/evolutility
 * (c) 2023 Olivier Giulieri
 */

import chalk from "chalk";
import ms from "../../models/all_models.js";
import config from "../../config.js";
import dico from "./dico.js";

export const models = ms;

const schema = '"' + (config.schema || "evolutility") + '"';

let modelIds = Object.keys(models);

export function prepModel(m) {
  if (m) {
    if (!m._prepared) {
      // - Model
      m.schemaTable = schema + '."' + (m.table || m.id) + '"';
      if (!m.pKey) {
        m.pKey = "id";
      }
      // - Fields
      m.fieldsH = {};
      m.fields.forEach(function (f, idx) {
        if (f.type === "lov") {
          f.t2 = "t_" + idx;
        }
        if (f.id !== m.table + "_id") {
          // TODO: should not need the if
          m.fieldsH[f.id] = f;
        }
      });
      // - Search
      if (m.searchFields) {
        if (!Array.isArray(m.searchFields)) {
          m.searchFields = [m.searchFields];
        }
      } else {
        m.searchFields = m.fields.filter((f) => f.inSearch).map((f) => f.id);
        if (m.searchFields.length < 1) {
          m.searchFields = m.fields
            .filter((f) => f.inMany && dico.fieldIsText(f))
            .map((f) => f.id);
        }
      }
      m._prepared = true;
    }
    return m;
  }
  console.error("Error: undefined model.");
  return null;
}

export function prepModelCollecs(m, models) {
  if (m) {
    m.collecsH = {};
    if (m.collections) {
      // - make collection map
      m.collections.forEach((c) => {
        if (c.object) {
          const collecModel = models[c.object];
          if (collecModel) {
            // - if table is not specified get it from collec object
            if (!c.table) {
              c.table = collecModel.table;
            }
            // - if fields is not specified get it from collec object (fields in list but not the object)
            if (!c.fields) {
              c.fields = collecModel.fields.filter(
                (f) => f.inMany && !f.object === c.object
              );
            }
            // - lookup fields by id
            const fsh = collecModel.fieldsH;
            c.fields.forEach((f, idx) => {
              if (typeof f === "string") {
                c.fields[idx] = JSON.parse(JSON.stringify(fsh[f] || {}));
              }
              if (f.type === "lov") {
                f.t2 = "t_" + idx;
              }
            });
          } else {
            console.log(
              'Model "' + c.object + '" not found in model "' + m.id + '".'
            );
          }
        }
        m.collecsH[c.id] = c;
      });
    }
    return m;
  }
  return null;
}

export const prepModels = () => {
  modelIds = Object.keys(models);
  console.log(
    chalk.cyan(modelIds.length + " models:", modelIds.sort().join(", ") + ".")
  );
  // need 2 passes for field map to be populated first, then collections
  modelIds.forEach((m) => {
    models[m] = prepModel(models[m]);
  });
  modelIds.forEach((m) => {
    models[m] = prepModelCollecs(models[m], models);
  });
  return models;
};

prepModels();

// export const getModel = (mId) => prepModel(models[mId]);
export const getModel = (mId) => models[mId];

export default {
  modelIds,

  getModel,

  prepModel,
  prepModels,

  models,
};
