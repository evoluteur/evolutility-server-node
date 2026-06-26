/*
  Model for Artists (5 fields, 1 collections)
  Generated at 6/25/2026, 12:12:00 AM
  Powered by evolutility-models v.0.3.0 - https://github.com/evoluteur/evolutility-models
*/

import type { ModelDB } from "../types.ts";

export const artist = {
  id: "artist",
  title: "Artists",
  world: "music",
  name: "artist",
  namePlural: "artists",
  pKey: "id",
  table: "music_artist",
  active: true,
  titleField: "name",
  fields: [
    {
      id: "name",
      type: "text",
      label: "Name",
      required: true,
      inMany: true,
      column: "name",
      inSearch: true,
    },
    {
      id: "url",
      type: "url",
      label: "Web site",
      column: "url",
    },
    {
      id: "bdate",
      type: "date",
      label: "Birth date",
      column: "bdate",
    },
    {
      id: "photo",
      type: "image",
      label: "Photo",
      inMany: true,
      column: "photo",
    },
    {
      id: "description",
      type: "textmultiline",
      label: "Description",
      column: "description",
      inSearch: true,
    },
  ],
  collections: [
    {
      id: "music_album",
      table: "music_album",
      column: "artist_id",
      object: "album",
      orderBy: "title",
      fields: ["title", "cover", "length"],
    },
  ],
  noCharts: true,
  noStats: true,
} satisfies ModelDB;
