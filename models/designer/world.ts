/*
  Model for Worlds (4 fields, 1 collections)
  Generated at 6/25/2026, 12:12:00 AM
  Powered by evolutility-models v.0.3.0 - https://github.com/evoluteur/evolutility-models
*/

import type { ModelDB } from "../types.ts";

export const world = {
  id: "world",
  title: "Worlds",
  world: "designer",
  name: "world",
  namePlural: "worlds",
  pKey: "id",
  table: "evol_world",
  titleField: "name",
  fields: [
    {
      id: "name",
      type: "text",
      label: "Name",
      required: true,
      maxLength: 100,
      inMany: true,
      column: "name",
      inSearch: true,
    },
    {
      id: "active",
      type: "boolean",
      label: "Active",
      inMany: true,
      column: "active",
    },
    {
      id: "description",
      type: "textmultiline",
      label: "Description",
      maxLength: 500,
      column: "description",
      inSearch: true,
    },
    {
      id: "position",
      type: "integer",
      label: "Position",
      maxLength: 3,
      column: "position",
    },
  ],
  collections: [
    {
      id: "collec-objects",
      table: "evol_object",
      column: "world_id",
      object: "object",
      fields: ["title", "icon", "active"],
    },
  ],
} satisfies ModelDB;
