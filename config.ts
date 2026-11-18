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
  maxPageSize?: number;
  lovSize: number;
  csvSize: number;
  csvHeader: string;
  uploadPath: string;
  uploadMaxSize?: number;
  uploadExtensions?: string[];
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
  corsOrigins: string[];
  auth: {
    enabled: boolean;
    anonymousRole: "viewer" | "editor" | "admin" | null;
    sessionDays: number;
    cookieName?: string;
    cookieSecure?: boolean;
    cookieSameSite?: "Strict" | "Lax" | "None";
  };
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
  // - Largest page size a client can ask for (with ?pageSize=)
  maxPageSize: 1000,
  lovSize: 100,

  // - CSV Export
  csvSize: 1000,
  csvHeader: "id", //label', // possible values: id, label

  // - Directory for uploaded files
  uploadPath: "../evolutility-ui-react/public/pix/",
  // - Maximum size of uploaded files (in bytes)
  uploadMaxSize: 2 * 1024 * 1024,
  // - Allowed file extensions for uploads (default list in scripts/utils/upload.ts)
  // uploadExtensions: [".png", ".jpg", ".jpeg", ".gif", ".webp", ".pdf"],

  // - Optional fields
  // - Timestamp columns "created_at" and "updated_at" w/ date of record creation and last update
  wTimestamp: true,
  // - "WhoIs" columns "created_by" and "updated_by" w/ the id of the user who
  // - created and last updated the record (logged-in user). The tables need
  // - these columns (created by evolutility-models, w/ the same option on).
  wWhoIs: true,
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
  // - Models are stored in the database (as JSON, in table "evol_model").
  // - Enables editing them through the API "meta/models" (POST, PUT, DELETE),
  // - which can also add tables and columns to the database.
  apiDesigner: true,
  // - Query DB schema for list of tables and columns
  schemaQueries: false,

  // - Rate limiting
  // - Maximum number of requests per IP per 15-minute window (set to 0 to disable)
  // - If behind a reverse proxy, also set trustProxy: true
  rateLimit: 500,
  trustProxy: false,

  // - Web sites allowed to call the API from a browser (the UI's url).
  // - Login cookies are only sent by these sites.
  corsOrigins: ["http://localhost:5173"],

  // - Users and login (tables "evol_user" and "evol_session")
  // - Roles: viewer (read), editor (+ write records), admin (+ edit models).
  // - Create users w/ "npm run user:add -- you@example.com admin".
  auth: {
    enabled: true,
    // - role of visitors who are not logged in: null (login required), or
    // - "viewer" for a public read-only site
    anonymousRole: null,
    // - number of days before having to log in again
    sessionDays: 7,
    // - "Secure" cookies (HTTPS only): set to true in production
    cookieSecure: process.env.NODE_ENV === "production",
    // - "Strict" when the UI and the API are on the same site, "None" (w/
    // - HTTPS) when they are on different sites
    cookieSameSite: "Strict",
  },
};

export default config;
