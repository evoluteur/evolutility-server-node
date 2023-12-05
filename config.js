/*
  Evolutility-Server-Node configuration file
*/

const config = {
  // - Path to REST API
  apiPath: "/api/v1/",
  apiPort: process.env.PORT || 2000,

  // - DB connection
  connectionString:
    process.env.DATABASE_URL ||
    "postgres://evol:love@localhost:5434/evolutility",
  schema: "evolutility",

  // - API discovery
  apiInfo: true,

  // - Pagination and maximum number of rows
  pageSize: 50,
  lovSize: 100,

  // - CSV Export
  csvSize: 1000,
  csvHeader: "id", //label', // possible values: id, label

  // - Directory for uploaded files
  uploadPath: "../evolutility-ui-react/public/pix/",

  // - Optional fields
  // - Timestamp columns "created_at" and "updated_at" w/ date of record creation and last update
  wTimestamp: true,
  // - "WhoIs" columns "created_by" and "updated_by" w/ userid of creator and last modifier
  wWhoIs: false,
  // - Comments & Ratings (community feature)
  wComments: false,
  wRating: false,
  // - Columns containing created and last updated dates
  createdDateColumn: "created_at",
  updatedDateColumn: "updated_at",

  // - Logs (to file and console)
  logToConsole: true,
  logToFile: false,

  // - Designer
  // - Enables storing models in the database (in tables "evol_%")
  apiDesigner: true,
  // - Query DB schema for list of tables and columns
  schemaQueries: false,
};

export default config;
