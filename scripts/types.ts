/*!
 *  evolutility-server-node :: types.ts
 *  Types for the metamodel (models are stored in the database as JSON).
 *  https://github.com/evoluteur/evolutility-server-node
 *  (c) 2026 Olivier Giulieri
 */

export enum FieldType {
  text = "text",
  textmultiline = "textmultiline",
  boolean = "boolean",
  integer = "integer",
  decimal = "decimal",
  money = "money",
  date = "date",
  datetime = "datetime",
  time = "time",
  lov = "lov",
  list = "list",
  html = "html",
  formula = "formula",
  email = "email",
  image = "image",
  url = "url",
  color = "color",
  hidden = "hidden",
  json = "json",
  document = "document",
}

export type FieldTypeEasy =
  | FieldType
  | "text"
  | "textmultiline"
  | "boolean"
  | "integer"
  | "decimal"
  | "money"
  | "date"
  | "datetime"
  | "time"
  | "lov"
  | "list"
  | "html"
  | "formula"
  | "email"
  | "image"
  | "url"
  | "color"
  | "hidden"
  | "json"
  | "document";

export interface FieldBase {
  id: string;
  label: string;
  type: FieldTypeEasy;
  required?: boolean;
  readOnly?: boolean;
  maxLength?: number;
  minLength?: number;
  min?: number;
  max?: number;
  regExp?: string;
  defaultValue?: unknown;
  lovIcon?: boolean;
  inMany?: boolean;
  inList?: boolean;
  inCharts?: boolean;
  noCharts?: boolean;
  noStats?: boolean;
  noFilters?: boolean;
  list?: unknown;
  object?: string;
  entity?: string;
  onlyDB?: boolean;
  onlyUI?: boolean;
  unique?: boolean;
}

export interface Field extends FieldBase {
  // UI properties
  labelShort?: string;
  labelEdit?: string;
  labelCharts?: string;
  labelFalse?: string;
  labelTrue?: string;
  labelCards?: string;
  width?: number | string;
  height?: number | string;
  chartType?: string;
  help?: string;
  css?: string;
  placeholder?: string;
  mini?: string;
  format?: string;
  img?: string;
  // DB properties
  column?: string;
  dbcolumn?: string;
  lovTable?: string;
  dbtablelov?: string;
  lovColumn?: string;
  lovKey?: string;
  dbcolumnreadlov?: string;
  deleteTrigger?: boolean;
  inSearch?: boolean;
  t2?: string;
}

export interface CollectionBase {
  id: string;
  title?: string;
  label?: string;
  object?: string;
  entity?: string;
}

export interface Collection extends CollectionBase {
  table?: string;
  column?: string;
  icon?: string;
  orderBy?: string;
  order?: string;
  fields?: (Field | string)[];
}

export interface ModelBase {
  id: string;
  title?: string;
  label?: string;
  icon?: string;
  world?: string | null;
  name?: string;
  namePlural?: string;
  schema?: string;
  active?: boolean;
  titleField?: string;
  noCharts?: boolean;
  noStats?: boolean;
}

export interface Model extends ModelBase {
  oid?: string | number;
  position?: number;
  defaultViewMany?: string;
  defaultViewOne?: string;
  titleFunction?: string | null | ((d: any) => string);
  pKey?: string;
  table?: string;
  fields: Field[];
  groups?: unknown[];
  collections?: Collection[];
  help?: string;
  searchFields?: string[];
  schemaTable?: string;
  fieldsH?: Record<string, Field>;
  collecsH?: Record<string, Collection>;
  _prepared?: boolean;
}
