# Evolutility-Server-Node &middot; [![GitHub license](https://img.shields.io/github/license/evoluteur/evolutility-server-node)](https://github.com/evoluteur/evolutility-server-node/blob/master/LICENSE.md) [![npm version](https://img.shields.io/npm/v/evolutility-server-node)](https://www.npmjs.com/package/evolutility-server-node)


Model-driven REST API for CRUD and more, using Node.js, Express, and PostgreSQL.

Evolutility-Server-Node provides a set of generic [REST APIs](#API) for CRUD (Create, Read, Update, Delete) and simple charts. on objects of different structures.

![screenshot](https://raw.githubusercontent.com/evoluteur/evolutility-server-node/master/screenshot.png)

For a matching model-driven Web UI, use [Evolutility-UI-React](http://github.com/evoluteur/evolutility-ui-react) or [Evolutility-UI-jQuery](http://evoluteur.github.io/evolutility-ui-jquery/).


### Table of Contents
1. [Installation](#Installation)
2. [Setup](#Setup)
3. [Configuration](#Configuration)
4. [Models](#Models): [Object](#Object) - [Field](#Field) - [Collection](#Collection) - [Sample model](#SampleModel)
5. [REST API](#API): [Get](#API_Get) - [Update](#API_Update) - [Charts](#API_Charts) - [More](#API_Extras)
6. [License](#License)

<a name="Installation"></a>
## Installation

[Download](https://github.com/evoluteur/evolutility-server-node/archive/master.zip) or clone from GitHub.

```bash
# To get the latest stable version, use git from the command line.
git clone https://github.com/evoluteur/evolutility-server-node
```
or use the [npm package](https://www.npmjs.com/package/evolutility-server-node):

```bash
# To get the latest stable version, use npm from the command line.
npm install evolutility-server-node
```

Dependencies: [Node.js](https://nodejs.org/en/), [Express](http://expressjs.com/), [PostgreSQL](http://www.postgresql.org/), and [PG-Promise](https://github.com/vitaly-t/pg-promise).

Evolutility-Server-Node works with **Node.js v12.12.0** (not yet compatible w/ later versions).

<a name="Setup"></a>
## Setup

After installing Evolutility-Server-Node, follow these steps:

1. Create a PostgreSQL database.

2. In the file [config.js](https://github.com/evoluteur/evolutility-server-node/blob/master/config.js) set the PostgreSQL connection string and the schema name to access your new database.

3. Maybe, also change other config options in the same file.

| Option     | Description        | Example            |
|------------|--------------------|--------------------|
| apiPath    | Path to REST API (can use "proxy" from package.json). | "/api/v1/" |
| apiPort    | Port for the REST API. | 2000 |
| connectionString  | Database connection string. | "postgres://evol:love@localhost:5434/evolutility" |
| schema     | Database schema.        | "evolutility" |
| uploadPath | Path to uploaded files. | "../evolutility-ui-react/public/pix/" |
| apiInfo    | Enable API discovery (on root and per model). | true |
| pageSize   | Page size in pagination.  | 50 |
| lovSize    | Maximum number of items in list of values. | 100  |
| csvSize    | Maximum number of items in CSV exports.    | 1000 |
| csvHeader  | Use fields id or labels in CSV header.     | id/label |
| locale     | Date format (no translation yet). | en/fr |
| wTimestamp | Add timestamp columns "created_at" and "updated_at" to track record creation and update times. | true |
| logToConsole | Log to console. | true |
| logToFile    | Log to file (log file is named "evol<timestamp>.log").    | true |

4. In the command line type the following:

```bash
# Install dependencies
npm install

# Create sample database w/ demo tables
npm run makedb

# Run the node.js server
npm start

```

**Note**: The database creation and population scripts are logged in the files "evol-db-schema-{datetime}.sql" and  "evol-db-data-{datetime}.sql".

URLs on localhost:

- REST: [http://localhost:2000/api/v1/](http://localhost:2000/api/v1/)


<a name="Configuration"></a>
## Configuration

Configuration options are set in the file [config.js](https://github.com/evoluteur/evolutility-server-node/blob/master/config.js).


| Option        | Description                             |
|---------------|-----------------------------------------|
| apiPath       | Path for REST API (i.e.: "/api/v1/"). |
| apiPort       | Port for REST API (i.e.: 2000). |
| connectionString | DB connection string (i.e.: "postgres://evol:love@localhost:5432/evol"). |
| schema        | DB schema name (i.e.: "evolutility").|
| pageSize      | Number of rows per page in pagination (default = 50).|
| lovSize       | Maximum number of values allowed for form dropdowns (default = 100). |
| csvSize       | Maximum number of rows in CSV export (default = 1000).|
| csvHeader     | CSV list of labels for CSV export| | uploadPath | path for pictures and documents uploads (i.e.: "../evolutility-ui-react/public/pix/").|
| logToConsole    | Log SQL and errors to console.|
| logToFile       | Log SQL and errors to a file. Log files are named like "evol-2019-09-15.log". |
| wComments     | Allow for user comments (not implemented yet). |
| wRating       | Allow for user ratings (not implemented yet). |
| wTimestamp    | Timestamp columns w/ date of record creation and last update. |
| createdDateColumn | Column containing created date (default "created_at"). |
| updatedDateColumn | Column containing last update date (default "updated_at"). |
| schemaQueries | Enables endpoints to query for lists of tables and columns in the database schema. |

<a name="Models"></a>
## Models

To be accessible by the REST API, each database table must be described in a model.
Models contain the name of the driving table and the list of fields/columns present in the API.

- [Object](#Object)
- [Field](#Field)
- [Collection](#Collection)
- [Sample model](#SampleModel)


<a name="Object"></a>
### Object

| Property     | Description                     |
|--------------|---------------------------------|
| id           | Unique key to identify the entity (used as API parameter). |
| table        | Driving database table name (there are secondary tables for fields of type "lov"). |
| pKey         | Name of the Primary key column (single column of type serial). Default to "id". In the data the key is always called "id". |
| fields       | Array of fields.                        |
| titleField   | Field id for the column value used as record title. |
| noCharts     | No Charts or Dashboard views.   |
| noStats      | No Stats on the object.         |

<a name="Field"></a>
### Field

| Property     | Description              |
|--------------|--------------------------|
| id           | Unique key for the field (can be the same as column but doesn't have to be). |
| column       | Database column name for the field.    |
| lovTable     | Table to join to for field value (only for fields of type "lov"). |
| lovColumn    | Column name (in the lovTable) for field value (only for fields of type "lov"). |
| lovIcon      | Set to True to include icon with LOV items (only for fields of type "lov").    |
| object       | Model id for the object to link to (only for fields of type "lov").    |
| type         | Field type is not a database column type but more a UI field type. Possible field types: <ul><li>boolean</li><li>date</li><li>datetime</li><li>decimal</li><li>document</li><li>email</li><li>image</li><li>integer</li><li>lov (list of values)</li><li>list (multiselect)</li><li>money</li><li>text</li><li>textmultiline</li><li>time</li><li>url</li></ul> |
| required     | Determines if the field is required for saving.      |
| readOnly     | Display field as readOnly (not editable).            |
| inMany       | Determines if the field is present (by default) in lists of records. |
| inSearch     | Determine if the field is used in text searches.                     |
| max, min     | Maximum/Minimum value allowed (only applies to numeric fields).      |
| maxLength, minLength | Maximum/Minimum length allowed (only applies to text fields).|
| unique       | Values must be unique (not implemented yet).   |
| noCharts     | Exclude field from charts.      |
| noStats      | Exclude field from Stats.       |
| deleteTrigger | Deleting records in the lovTable will trigger a cascade delete (this property is only used while creating the database). |


<a name="Collection"></a>
### Collection

Multiple Master-Details can be specified with collections.

| Property     | Meaning                  |
|--------------|--------------------------|
| id           | Unique key for the collection.        |
| table        | DB Table to query (master table, other tables will be included in the query for "lov" fields). |
| column       | Column in the detail table to match against id of object. |
| object       | Model id for the object to display (optional).            |
| orderBy      | Column(s) to sort by, e.g. { orderBy: "name" }.                 |
| fields       | Array of fields (objects or ids). Fields in collections can be field objects or just ids of field in the collection's object.    |

Example of collection in [Wine cellar](https://github.com/evoluteur/evolutility-server-node/blob/master/models/organizer/winecellar.js).


<a name="SampleModel"></a>
### Sample model

Below is the model for a To-Do app.

```javascript
export default {
    id: "todo",
    table: "task",
    titleField: "title",
    searchFields: ["title", "duedate", "description"],
    fields: [
        {
            id: "title",
            column: "title",
            type: "text",
            required: true,
            inMany: true
        },
        {
            id: "duedate",
            column: "duedate",
            type: "date",
            inMany: true
        },
        {
            id: "category",
            column: "category_id",
            type: "lov",
            lovTable: "task_category",
            inMany: true
        },
        {
            id: "priority",
            column: "priority_id",
            type: "lov",
            lovTable: "task_priority",
            required: true,
            inMany: true,
        },
        {
            id: "complete",
            column: "complete",
            type: "boolean",
            inMany: true
        },
        {
            id: "description",
            column: "description",
            type: "textmultiline"
        }
    ]
};

```

More sample models:
 [Address book](https://github.com/evoluteur/evolutility-server-node/blob/master/models/organizer/contact.js),
 [Restaurants list](https://github.com/evoluteur/evolutility-server-node/blob/master/models/organizer/restaurant.js),
 [Wine cellar](https://github.com/evoluteur/evolutility-server-node/blob/master/models/organizer/winecellar.js),
 [Graphic novels inventory](https://github.com/evoluteur/evolutility-server-node/blob/master/models/organizer/comics.js).

More information about Evolutility models and some useful scripts are available at [evolutility-models](https://github.com/evoluteur/evolutility-models).

<a name="API"></a>
## REST API
Evolutility-Server-Node provides a generic RESTful API for CRUD (Create, Read, Update, Delete) and more. It is inspired from [PostgREST](http://postgrest.com).

- [Get](#API_Get)
- [Update](#API_Update)
- [Charts](#API_Charts)
- [More](#API_Extras)

When running Evolutility-Server-Node locally, the base url is
[http://localhost:2000/api/v1/](http://localhost:2000/api/v1/).

<a name="API_Get"></a>
### Requesting Information

#### Get One
Gets a specific record by ID.

```
GET /{model.id}/{id}

GET /todo/12
```

By default this endpoint returns nested collections with the record. For optimization, collections can be ommited by using the parameter "shallow".

```
GET /{model.id}/{id}?shallow=1

GET /todo/12?shallow=1
```

#### Get Many
Gets a list of records.

```
GET /{model.id}

GET /todo
```


<a name="Filtering"></a>
#### Filtering
You can filter result rows by adding conditions on fields, each condition is a query string parameter.

```
GET /{model.id}/{field.id}={operator}.{value}

GET /todo?title=sw.a
GET /todo?priority=in.1,2,3
```
Adding multiple parameters conjoins the conditions:

```
todo?complete=0&duedate=lt.2018-12-24
```

For each field a sub-set of the operators below will be supported by the API (depending field types).

| Operator     | Meaning                 | Example                      |
|--------------|-------------------------|------------------------------|
| eq           | equals                  | /todo?category=eq.1          |
| gt           | greater than            | /todo?duedate=gt.2024-01-15  |
| lt           | less than               | /todo?duedate=lt.2024-01-15  |
| gte          | less than or equal      | /todo?duedate=gte.2024-01-15 |
| lte          | less than or equal      | /todo?duedate=lte.2024-01-15 |
| ct           | contains                | /todo?title=ct.e             |
| sw           | start with              | /todo?title=sw.a             |
| fw           | finishes with           | /todo?title=fw.z             |
| in           | one of a list of values | /todo?priority=in.1,2,3      |
| 0            | is false or null        | /todo?complete=0             |
| 1            | is true                 | /todo?complete=1             |
| null         | is null                 | /todo?category=null          |
| nn           | is not null             | /todo?category==nn           |


#### Searching

You can search for a specific string across multiple fields at once with the "search" parameter. The list of fields to be searched is specified with "searchFields" in the model (if unspecified, text fields flagged with "inMany" for list view will be used).

```
GET /{model.id}?search={value}

GET /todo?search=translation
```

#### Ordering

The reserved word "order" reorders the response rows. It uses a comma-separated list of fields and directions:

```
GET /{model.id}?order={field.id}.{asc/desc}

GET /todo?order=priority.desc,title.asc
```
If no direction is specified it defaults to ascending order:
```
GET /todo?order=duedate
```

#### Limiting and Pagination

The reserved words "page" and "pageSize" limits the response rows.

```
GET /{model.id}?page={pageindex}&pageSize={pagesize}

GET /todo?page=0&pageSize=50
```

#### Formatting

By default all APIs return data in JSON format. This API call allows to request data in CSV format (export to Excel).
This feature is using [csv-express](https://github.com/jczaplew/csv-express).

```
GET /{model.id}?format=csv

GET /todo?format=csv
```
Notes: In the returned data every object has an extra property "\_full_count" which indicate the total number of records in the query (before limit).

<a name="API_Update"></a>
### Updating Data

#### Record creation

To create a row in a database table post a JSON object whose keys are the names of the columns you would like to create. Missing keys will be set to default values when applicable.

```
POST {model.id} {data}

POST /todo
{ title: 'Finish testing', priority: 2}
```

Even though it is a "POST", the request also returns the newly created record. It is not standard but it saves the UI a subsequent call.

#### Update

PATCH or PUT can be used to update specific records.

```
PATCH /{model.id}/{id} {data}

PATCH /todo/5
{ title: 'Finish testing', priority: 2}
```

```
PUT /{model.id}/{id} {data}

PUT /todo/5
{ title: 'Finish testing', priority: 2}
```

Notes: The request returns the updated record. It is not standard but it saves the UI a subsequent call.


#### Deletion
Simply use the DELETE verb with the id of the record to remove.

```
DELETE /{model.id}/{id}

DELETE /todo/5
```

To delete multiple records at once, pass multiple ids (separated by commas).

```
DELETE /{model.id}/{id1},{id2},{id3}

DELETE /todo/5,7,12
```

<a name="API_Extras"></a>
### Extras endpoints

In addition to CRUD, Evolutility-Server-Node provides a few endpoints for Charts, Lists of values, file upload, and API discovery.

#### Discovery

Returns the list of all active objects with urls to their REST end-points.

```
GET /
```

It is also possible to get a more detailed list of REST end-points for a specific model.

```
GET /?id={model.id}

GET /?id=todo
GET /?id=contact

```

Note: These end-point must be enabled in the configuration with { apiInfo: true }.

<a name="API_Charts"></a>
#### Charts

For charts data, it is possible to get aggregated data for field of types lov, boolean, integer, decimal, and money. Use the attribute "noCharts" to exclude a field from Charts.

```
GET /{model.id}/chart/{field id}

GET /todo/chart/category
```

#### Stats

Returns the total count, and the min, max, average, variance, standard deviation and total for numeric fields in the model.

```
GET /{model.id}/stats

GET /todo/stats
```

#### Lists of Values

Dropdown fields in the UI (field.type="lov" in the model) have a REST endpoint to get the list of values. This endpoint can also take a search query parameter.

```
GET /{model.id}/lov/{field.id}

GET /todo/lov/category
GET /todo/lov/category?search=pro
```

#### File upload

This endpoint lets you upload a file. The current (naive) implementation simply saves the file on the file server in a folder named like the model id (inside the folder specified by the option "uploadPath" in config.js).

```
POST /{model.id}/upload/{id}

POST /comics/upload/5
```

With query parameters: file and "field.id".


#### Nested collections

If the model has collections defined, they can be queried with this end-point.

```
GET /{model.id}/collec/{collection.id}?id={id}

GET /winecellar/collec/wine_tasting?id=1
```

<a name="Models"></a>
#### Models

When storing models in evol_object and evol_field tables, they can be queried through REST.

Get all models flagged as active.

```
GET /meta/models
```

Get a model by ID (integer).

```
GET /meta/model/{modelid}

GET /meta/model/1
```

Note: Schema and Models end-points must be enabled in the configuration with { apiDesigner: true }.

#### Schema tables and columns

These endpoints query for the database structure (rather than the data), and returns lists of tables and columns.

List of schema tables (props: table, type, readOnly).

```
GET /db/tables
```

List of columns (props: column, type, required) for a specified table.

```
GET /db/{table_name}/columns

GET /db/contact/columns
GET /db/task/columns
```

Note: These end-point must be enabled in the configuration with { schemaQueries: true }.

#### API version

This endpoint gets the API version (as specified in the project's package.json file).

```
GET /version
```

<a name="License"></a>
## License

Copyright (c) 2024 [Olivier Giulieri](https://evoluteur.github.io/).

Evolutility-Server-Node is released under the [AGPLv3 license](http://github.com/evoluteur/evolutility-server-node/blob/master/LICENSE.md).
