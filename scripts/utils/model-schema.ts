/*!
 * evolutility-server-node :: utils/model-schema.ts
 * JSON Schema of the metamodel (what a model can contain), served at
 * "meta/schema". The Designer of evolutility-ui-react uses it to check
 * models while they are edited, suggest properties, and describe them.
 *
 * Names, patterns and field types come from model-validate.ts, which does the
 * checks when a model is saved (including those a schema can't express).
 *
 * https://github.com/evoluteur/evolutility-server-node
 * (c) 2026 Olivier Giulieri
 */

import {
  collecIdRegex,
  fieldTypeIds,
  identifierRegex,
  orderByRegex,
} from "./model-validate.ts";

const str = (description: string) => ({ type: "string", description });
const bool = (description: string) => ({ type: "boolean", description });
const num = (description: string) => ({ type: "number", description });
const sqlName = (description: string) => ({
  type: "string",
  pattern: identifierRegex.source,
  description: description + " Letters, digits and _ only.",
});
const size = (description: string) => ({
  type: ["number", "string"],
  description,
});

const lovItem = {
  type: "object",
  description: "Item of a list of values.",
  properties: {
    id: {
      type: ["integer", "string"],
      description: "Id of the item (integer).",
    },
    text: str("Text displayed for the item."),
    icon: str("Icon file name for the item (with lovIcon)."),
  },
  required: ["id", "text"],
  additionalProperties: false,
};

const field = {
  type: "object",
  description: "Field of the model (a column in the database).",
  properties: {
    id: sqlName(
      "Unique key for the field, used as its name in the API (can be the same as the column, but doesn't have to be).",
    ),
    type: {
      type: "string",
      enum: fieldTypeIds,
      description:
        "Field type. Changing the type of a column holding data is refused.",
    },
    label: str("Field title (displayed with an asterisk for required fields)."),
    labelShort: str("Shorter label (used in List and Cards views)."),
    labelEdit: str("Label in the Edit view (if different)."),
    labelCharts: str("Label in charts (if different)."),
    labelCards: str("Label in the Cards view (if different)."),
    labelTrue: str('Text for "true" (boolean fields).'),
    labelFalse: str('Text for "false" (boolean fields).'),
    required: bool("The field is required for saving."),
    readOnly: bool("The field value can't be changed."),
    defaultValue: { description: "Default field value for new records." },
    min: num("Minimum value allowed (numeric fields)."),
    max: num("Maximum value allowed (numeric fields)."),
    minLength: num("Minimum length allowed (text fields)."),
    maxLength: num("Maximum length allowed (text fields)."),
    regExp: str("Regular expression used to validate the value."),
    unique: bool("The value must be unique."),
    inMany: bool(
      "The field is shown in lists of records (List and Cards views).",
    ),
    inList: bool('Same as "inMany".'),
    inSearch: bool("The field is used in text searches."),
    inCharts: bool("The field is shown in charts."),
    noCharts: bool(
      'Exclude the field from charts ("chartable" fields: numbers, booleans, lists of values).',
    ),
    noStats: bool("Exclude the field from stats."),
    noFilters: bool("Exclude the field from filters."),
    list: {
      type: "array",
      items: lovItem,
      description:
        'Items of the list of values (fields of type "lov"). Without it, the list comes from the lov table.',
    },
    lovIcon: bool(
      'Items of the list of values have icons (fields of type "lov").',
    ),
    object: str('Id of the model to link to (fields of type "lov").'),
    chartObject: str('Object name in charts (fields of type "lov").'),
    aggregate: str('Aggregation name in charts (fields of type "lov").'),
    chartType: {
      type: "string",
      enum: ["bars", "pie", "table"],
      description: "Default chart type for the field.",
    },
    width: size(
      "Field width in Browse and Edit views (in % of the panel). Default: 100.",
    ),
    height: size('Number of lines (fields of type "textmultiline").'),
    format: str(
      "Display format (dayjs for dates, Intl.NumberFormat for numbers).",
    ),
    help: str("Help on the field."),
    css: str("CSS class for the field."),
    placeholder: str("Placeholder text in the Edit view."),
    mini: str("Show the field in a smaller size."),
    img: str("Image for the field."),
    column: sqlName("Column in the table. Default: the field id."),
    lovTable: sqlName(
      'Table of the list of values (fields of type "lov"). Default: {table}_{field id}.',
    ),
    lovColumn: sqlName(
      'Column with the text of the list of values. Default: "name".',
    ),
    lovKey: sqlName('Key column of the list of values. Default: "id".'),
    deleteTrigger: bool(
      "Delete the records when their value in the list of values is deleted.",
    ),
    onlyDB: bool("Field only used by the server (ignored by the UI)."),
    onlyUI: bool("Field only used by the UI (no column in the table)."),
  },
  required: ["id", "type", "label"],
  additionalProperties: false,
};

const group = {
  type: "object",
  description: "Group of fields (panel) in Browse and Edit views.",
  properties: {
    id: str("Unique key for the group (optional)."),
    type: {
      type: "string",
      enum: ["panel"],
      description: 'Type of group (only "panel" for now).',
    },
    label: str("Group title."),
    title: str('Same as "label".'),
    width: size("Width of the group (in % of the page)."),
    help: str("Help on the group."),
    header: str("Text displayed at the top of the group."),
    footer: str("Text displayed below the group."),
    fields: {
      type: "array",
      items: { type: "string" },
      description: "Ids of the fields in the group.",
    },
  },
  required: ["fields"],
  additionalProperties: false,
};

const collection = {
  type: "object",
  description:
    "Nested collection (list of related records) in Browse and Edit views.",
  properties: {
    id: {
      type: "string",
      pattern: collecIdRegex.source,
      description:
        "Unique key for the collection (name of the sub-collection in the API).",
    },
    title: str("Collection title."),
    label: str('Same as "title".'),
    icon: str("Icon file name."),
    object: str("Id of the model of the records in the collection."),
    table: sqlName("Table of the records (default: the table of the object)."),
    column: sqlName("Column in the collection table linking to the record."),
    orderBy: {
      type: "string",
      pattern: orderByRegex.source,
      description:
        'Column(s) to sort by (e.g. "name" or "position, t1.id desc").',
    },
    order: str('Sort direction: "asc" or "desc".'),
    fields: {
      type: "array",
      items: { anyOf: [{ type: "string" }, { $ref: "#/definitions/field" }] },
      description:
        "Fields shown (ids of fields of the object, or field objects).",
    },
    help: str("Help on the collection."),
    header: str("Text displayed at the top of the collection."),
    footer: str("Text displayed below the collection."),
    hideIfEmpty: bool("Hide the collection when it has no records."),
  },
  required: ["id"],
  additionalProperties: false,
};

export const modelSchema = {
  $schema: "http://json-schema.org/draft-07/schema#",
  $id: "evolutility-model",
  title: "Evolutility model",
  description: "Model of an object: its table, fields, groups and collections.",
  type: "object",
  properties: {
    id: sqlName(
      "Unique key for the model (used in routes and the API). Can't be changed.",
    ),
    title: str('Application name (e.g. "Address book").'),
    label: str('Same as "title".'),
    name: str('Object name, singular (e.g. "contact").'),
    namePlural: str('Object name, plural (e.g. "contacts").'),
    icon: str('Icon file name (e.g. "todo.png").'),
    world: str('Application the object belongs to (e.g. "organizer").'),
    active: bool(
      "Only active models are listed in menus and the API discovery.",
    ),
    position: num("Position in menus."),
    oid: { type: ["integer", "string"], description: "Object id (legacy)." },
    table: sqlName(
      "Table in the database (default: the model id). Can't be changed.",
    ),
    pKey: sqlName('Primary key column (default: "id"). Can\'t be changed.'),
    titleField: str("Id of the field used as record title."),
    titleFunction: str(
      'Template for the record title, e.g. "{firstname} {lastname}". For "lov" fields use "{fieldid.name}".',
    ),
    defaultViewMany: {
      type: "string",
      enum: ["list", "cards"],
      description: "Default view for many records.",
    },
    defaultViewOne: {
      type: "string",
      enum: ["browse", "edit"],
      description: "Default view for one record.",
    },
    readOnly: bool("Records can't be changed."),
    noCharts: bool("No charts for this model."),
    noStats: bool("No stats for this model."),
    noActivity: bool("Don't track activity for this model."),
    help: str("Help on the model."),
    searchFields: {
      type: "array",
      items: { type: "string" },
      description:
        'Ids of the fields used in text searches (default: fields w/ "inSearch").',
    },
    fields: {
      type: "array",
      minItems: 1,
      items: { $ref: "#/definitions/field" },
      description: "Fields of the model.",
    },
    groups: {
      type: "array",
      items: { $ref: "#/definitions/group" },
      description: "Groups of fields (default: one group w/ all fields).",
    },
    collections: {
      type: "array",
      items: { $ref: "#/definitions/collection" },
      description: "Nested collections (lists of related records).",
    },
  },
  required: ["id", "name", "namePlural", "fields"],
  additionalProperties: false,
  definitions: { field, group, collection },
};

export default modelSchema;
