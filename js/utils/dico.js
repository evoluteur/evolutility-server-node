/*!
 * evolutility :: utils/dico.js
 * Helper functions for metadata
 *
 * https://github.com/evoluteur/evolutility
 * (c) 2023 Olivier Giulieri
 */

import config from "../../config.js";

// - Field Types
export const fieldTypes = {
  text: "text",
  textml: "textmultiline",
  bool: "boolean",
  int: "integer",
  dec: "decimal",
  money: "money",
  date: "date",
  // datetime: "datetime",
  time: "time",
  lov: "lov",
  list: "list", // multiple values for one field (behave like tags - return an array of strings)
  html: "html",
  // formula: "formula", // soon to be a field attribute rather than a field type
  email: "email",
  image: "image",
  //geoloc: 'geolocation',
  //doc:'document',
  url: "url",
  color: "color",
  hidden: "hidden",
  json: "json",
  //rating: 'rating',
  //widget: 'widget'
};

const ft = fieldTypes;

// - fields for comments, ratings...
export let systemFields = []; // system fields to track records creation date, comments...
let f;

if (config.wTimestamp) {
  systemFields.push(
    {
      // - record creation date
      type: "datetime",
      column: config.createdDateColumn,
    },
    {
      // - record last update date
      type: "datetime",
      column: config.updatedDateColumn,
    }
  );
}
if (config.wWhoIs) {
  systemFields.push(
    {
      // - record creator (user.id)
      type: "integer",
      column: "created_by",
    },
    {
      // - record last editor (user.id)
      type: "integer",
      column: "updated_by",
    }
  );
}
if (config.wComments) {
  f = {
    // - number of comments about the record
    type: "integer",
    column: "nb_comments",
  };
  systemFields.push(f);
}
// - tracking ratings.
if (config.wRating) {
  f = {
    type: "integer",
    column: "nb_ratings",
  };
  systemFields.push(f);
  f = {
    type: "integer",
    column: "avg_ratings",
  };
  systemFields.push(f);
}

export const fieldIsNumber = (f) =>
  f.type === ft.int || f.type === ft.dec || f.type === ft.money;
export const fieldIsText = (f) =>
  [ft.text, ft.textml, ft.url, ft.html, ft.email].indexOf(f.type) > -1;
export const fieldIsDateOrTime = (f) =>
  f.type === ft.date || f.type === ft.datetime || f.type === ft.time;
export const fieldIsNumeric = (f) => fieldIsNumber(f) || fieldIsDateOrTime(f);

export const fieldChartable = (f) =>
  f.type === ft.lov || f.type === ft.bool || fieldIsNumber(f);
export const fieldInCharts = (f) => fieldChartable(f) && !f.noCharts;

export default {
  fieldTypes: ft,

  fieldInMany: (f) => f.inList || f.inMany,

  fieldIsText,
  fieldIsNumber,
  fieldIsNumeric,
  fieldIsDateOrTime,

  fieldInCharts,
  fieldChartable,

  systemFields,
};
