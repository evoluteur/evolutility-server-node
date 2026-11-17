/*!
 * evolutility :: utils/model-manager.ts
 * Helper functions for metadata
 *
 * https://github.com/evoluteur/evolutility
 * (c) 2026 Olivier Giulieri
 */

import config from "../../config.ts";
import dico from "./dico.ts";
import type { Model } from "../../models/types.ts";

// - Live models, by id. Loaded from the database (table "evol_model") at
// - startup, see model-store.ts. Always mutated in place (never re-assigned) because
// - other modules import this object (openapi.ts, info.ts...).
export const models: Record<string, Model> = {};

const schema = `"${config.schema || "evolutility"}"`;

export let modelIds: string[] = [];

export function prepModel(m: Model): Model | null {
  if (m) {
    if (!m._prepared) {
      // - Model
      m.schemaTable = `${schema}."${m.table || m.id}"`;
      if (!m.pKey) {
        m.pKey = "id";
      }
      // - Fields
      m.fieldsH = {};
      m.fields.forEach((f, idx) => {
        if (f.type === "lov") {
          f.t2 = `t_${idx}`;
        }
        if (f.id !== `${m.table}_id`) {
          // TODO: should not need the if
          m.fieldsH![f.id] = f;
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

function prepModelCollecs(m: Model, models: Record<string, Model>): Model | null {
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
                (f) => f.inMany && f.object !== c.object,
              );
            }
            // - lookup fields by id
            const fsh = collecModel.fieldsH!;
            c.fields.forEach((f, idx) => {
              if (typeof f === "string") {
                c.fields![idx] = JSON.parse(JSON.stringify(fsh[f] || {}));
              }
              if (typeof f !== "string" && f.type === "lov") {
                f.t2 = `t_${idx}`;
              }
            });
          } else {
            console.log(`Model "${c.object}" not found in model "${m.id}".`);
          }
        }
        m.collecsH![c.id] = c;
      });
    }
    return m;
  }
  return null;
}

// - copy of a raw model w/ only the parts the server uses (no UI-only fields)
const serverCopy = (m: Model): Model => {
  const copy = structuredClone(m);
  copy.fields = (copy.fields || []).filter((f) => !f.onlyUI);
  // - remove computed props (if a prepared model was passed)
  delete copy.fieldsH;
  delete copy.collecsH;
  delete copy.schemaTable;
  delete copy._prepared;
  return copy;
};

const prepModels = () => {
  modelIds = Object.keys(models);
  // need 2 passes for field map to be populated first, then collections
  modelIds.forEach((m) => {
    models[m] = prepModel(models[m])!;
  });
  modelIds.forEach((m) => {
    models[m] = prepModelCollecs(models[m], models)!;
  });
  return models;
};

// - Raw (unprepared) models, so they can be prepared again after a change
let rawModels: Record<string, Model> = {};

// - Replace all live models (ex: after loading them from the database)
export function setModels(list: Model[] | Record<string, Model>) {
  const arr = Array.isArray(list) ? list : Object.values(list);
  rawModels = {};
  arr.forEach((m) => {
    rawModels[m.id] = serverCopy(m);
  });
  rebuild();
}

// - Add or replace one model (hot reload after an edit)
export function setModel(m: Model) {
  rawModels[m.id] = serverCopy(m);
  rebuild();
}

// - Remove a model from the live models
export function removeModel(id: string) {
  delete rawModels[id];
  rebuild();
}

// - Raw model (w/o computed props) for diffs and validation
export const getRawModel = (mId: string): Model | undefined => rawModels[mId];

// - prepare all models again (collections can point to the model that changed)
function rebuild() {
  Object.keys(models).forEach((k) => delete models[k]);
  Object.values(rawModels).forEach((m) => {
    models[m.id] = structuredClone(m);
  });
  prepModels();
}

export const getModel = (mId: string): Model | undefined => models[mId];

export default {
  models,
  get modelIds() {
    return modelIds;
  },
  getModel,
  getRawModel,
  prepModel,
  setModels,
  setModel,
  removeModel,
};
