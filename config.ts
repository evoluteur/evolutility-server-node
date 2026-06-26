/*
  Evolutility-Server-Node configuration file
*/

export interface Config {
  apiPath: string;
  apiPort: number | string;
  connectionString: string;
  schema: string;
  apiInfo: boolean;
  pageSize: number;
  lovSize: number;
  csvSize: number;
  csvHeader: string;
  uploadPath: string;
  wTimestamp: boolean;
  wWhoIs: boolean;
  wComments: boolean;
  wRating: boolean;
  createdDateColumn: string;
  updatedDateColumn: string;
  logToConsole: boolean;
  logToFile: boolean;
  apiDesigner: boolean;
  schemaQueries: boolean;
  rateLimit: number;
  trustProxy: boolean;
}

const config: Config = {
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

  // - Rate limiting
  // - Maximum number of requests per IP per 15-minute window (set to 0 to disable)
  // - If behind a reverse proxy, also set trustProxy: true
  rateLimit: 500,
  trustProxy: false,
};

export default config;
