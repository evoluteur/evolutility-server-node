/*
  Evolutility DB model for Artists
  https://github.com/evoluteur/evolutility-server-node
*/

module.exports = {
  id: "artist",
  title: "Artists",
  world: "music",
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
};
