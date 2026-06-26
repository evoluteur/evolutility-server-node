/*
  Model for Albums (6 fields, 1 collections)
  Generated at 6/25/2026, 12:12:00 AM
  Powered by evolutility-models v.0.3.0 - https://github.com/evoluteur/evolutility-models
*/

import type { ModelDB } from "../types.ts";

export const album = {
  id: "album",
  title: "Albums",
  world: "music",
  name: "album",
  namePlural: "albums",
  pKey: "id",
  table: "music_album",
  active: true,
  titleField: "name",
  fields: [
    {
      id: "title",
      type: "text",
      label: "Title",
      required: true,
      inMany: true,
      column: "title",
      inSearch: true,
    },
    {
      id: "artist",
      type: "lov",
      label: "Artist",
      object: "artist",
      required: true,
      lovIcon: false,
      inMany: true,
      column: "artist_id",
      lovTable: "music_artist",
      lovColumn: "name",
    },
    {
      id: "url",
      type: "url",
      label: "Amazon",
      column: "url",
    },
    {
      id: "length",
      type: "text",
      label: "Length",
      inMany: true,
      column: "length",
    },
    {
      id: "description",
      type: "textmultiline",
      label: "Description",
      maxLength: 1000,
      inMany: false,
      column: "description",
      inSearch: true,
    },
    {
      id: "cover",
      type: "image",
      label: "Cover",
      inMany: true,
      column: "cover",
    },
  ],
  collections: [
    {
      id: "music_track",
      table: "music_track",
      column: "album_id",
      object: "track",
      orderBy: "name",
      fields: ["name", "genre", "length"],
    },
  ],
  noStats: true,
} satisfies ModelDB;
