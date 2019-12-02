# Evolutility-Server-Node &middot; [![GitHub license](https://img.shields.io/badge/License-MIT-blue.svg)](https://github.com/evoluteur/evolutility-server-node/blob/master/LICENSE.md) [![npm version](https://img.shields.io/npm/v/evolutility-server-node)](https://www.npmjs.com/package/evolutility-server-node) 


Model-driven REST or GraphQL backend for CRUD and more, using Node.js, Express, and PostgreSQL.

Evolutility-Server-Node provides a set of generic [REST](#API) or [GraphQL](#GraphQL) endpoints for CRUD (Create, Read, Update, Delete) and simple charts. 
 
For a matching model-driven Web UI, use [Evolutility-UI-React](http://github.com/evoluteur/evolutility-ui-react) or [Evolutility-UI-jQuery](http://evoluteur.github.io/evolutility-ui-jquery/).


### Table of Contents
1. [Installation](#Installation)
2. [Setup](#Setup)
3. [Configuration](#Configuration)
4. [Models](#Models): [Object](#Object) - [Field](#Field) - [Collection](#Collection) - [Sample model](#SampleModel)
5. [REST API](#API): [Get](#API_Get) - [Update](#API_Update) - [Charts](#API_Charts) - [More](#API_Extras)
6. [GraphQL](#GraphQL): [Object by Id](#GraphQL_by_id) - [List](#GraphQL_list) - [Charts data](#GraphQL_charts_data)
7. [License](#License)

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
| connectionString  | Database connection string. | "postgres://evol:love@localhost:5432/Evolutility" |
| schema     | Database schema.        | "evolutility" |
| graphQL    | Enable GraphQL queries. | true |
| uploadPath | Path to uploaded files. | "../evolutility-ui-react/public/pix/" |
| apiInfo    | Enable API discovery (on root and per model). | true |
| pageSize   | Page size in pagination.  | 50 |
| lovSize    | Maximum number of items in list of values. | 100  |
| csvSize    | Maximum number of items in CSV exports.    | 1000 |
| csvHeader  | Use fields id or labels in CSV header.     | id/label |
| locale     | Date format (no translation yet). | en/fr |
| wTimestamp | Add timestamp columns u_date and c_date to track record creation and update times. | true |
| logToConsole | Log to console. | true |
| logToFile    | Log to file (log file is named "evol<date>.log" as in "evol-2019-11-21.log").    | true |

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
- GraphQL: [http://localhost:2000/graphql](http://localhost:2000/graphql)


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
| createdDateColumn | Column containing created date (default `c_date`). |
| updatedDateColumn | Column containing last update date (default `u_date`). |
| schemaQueries | Enables endpoints to query for lists of tables and columns in the database schema. |
| GraphQL       | Set to true to enable GraphQL UI (Work In Progress). |

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

| Property     | Description                             |
|--------------|-----------------------------------------|
| id           | Unique key to identify the entity (used as API parameter). |
| table        | Driving database table name (there are secondary tables for fields of type "lov"). |
| pKey         | Name of the Primary key column (single column of type serial). Default to "id". In the data the key is always called "id". |
| fields       | Array of fields.                        |
| titleField   | Field id for the column value used as record title. |
| searchFields | Array of field ids for fields used to perform searches.  |  
| noCharts     | No Charts or Dashboard views.   |
| noStats      | No Stats on the object.         |

<a name="Field"></a>
### Field

| Property     | Description                           |
|--------------|---------------------------------------|
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
| max, min     | Maximum/Minimum value allowed (only applies to numeric fields).      |
| maxLength, minLength | Maximum/Minimum length allowed (only applies to text fields).|
| unique       | Values must be unique (not implemented yet).   |
| noCharts     | Exclude field from charts.      |
| noStats      | Exclude field from Stats.       |
| deleteTrigger | Deleting records in the lovTable will trigger a cascade delete (this property is only used while creating the database). |


<a name="Collection"></a>
### Collection

Multiple Master-Details can be specified with collections. 

| Property     | Meaning                               |
|--------------|---------------------------------------|
| id           | Unique key for the collection.        |
| table        | DB Table to query (master table, other tables will be included in the query for "lov" fields). |
| column       | Column in the detail table to match against id of object. |
| object       | Model id for the object to display (optional).            |
| orderBy      | Column(s) to sort by, e.g. { orderBy: "name" }.                 |
| fields       | Array of fields. Fields in collections do not need all properties of Fields in objects.      |

Example of collection in [Wine cellar](https://github.com/evoluteur/evolutility-server-node/blob/master/models/organizer/winecellar.js).


<a name="SampleModel"></a>
### Sample model

Below is the model for a To-Do app.

```javascript
module.exports = {
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
            inMany: true
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
GET /<model.id>/<id>

GET /todo/12
```

#### Get Many
Gets a list of records.

```
GET /<model.id>

GET /todo
```

<a name="Filtering"></a>
#### Filtering
You can filter result rows by adding conditions on fields, each condition is a query string parameter. 

```
GET /<model.id>/<field.id>=<operator>.<value>

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
| gt           | greater than            | /todo?duedate=gt.2019-01-15  |
| lt           | less than               | /todo?duedate=lt.2019-01-15  |
| gte          | less than or equal      | /todo?duedate=gte.2019-01-15 |
| lte          | less than or equal      | /todo?duedate=lte.2019-01-15 |
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
GET /<model.id>/search=<value>

GET /todo?search=translation
```

#### Ordering

The reserved word "order" reorders the response rows. It uses a comma-separated list of fields and directions:

```
GET /<model.id>?order=<field.id>.<asc/desc>

GET /todo?order=priority.desc,title.asc
```
If no direction is specified it defaults to ascending order:
```
GET /todo?order=duedate
```

#### Limiting and Pagination


The reserved words "page" and "pageSize" limits the response rows.

```
GET /<model.id>?page=<pageindex>&pageSize=<pagesize>

GET /todo?page=0&pageSize=50
```

#### Formatting

By default all APIs return data in JSON format. This API call allows to request data in CSV format (export to Excel).
This feature is using [csv-express](https://github.com/jczaplew/csv-express).

```
GET /<model.id>?format=csv

GET /todo?format=csv
```
Notes: In the returned data every object has an extra property "\_full_count" which indicate the total number of records in the query (before limit).

<a name="API_Update"></a>
### Updating Data

#### Record creation

To create a row in a database table post a JSON object whose keys are the names of the columns you would like to create. Missing keys will be set to default values when applicable.

```
POST <model.id> {<data>}

POST /todo
{ title: 'Finish testing', priority: 2}
```

Even though it is a "POST", the request also returns the newly created record. It is not standard but it saves the UI a subsequent call.

#### Update

PATCH or PUT can be used to update specific records.

```
PATCH /<model.id>/<id>

PATCH /todo/5
{ title: 'Finish testing', priority: 2}
```

```
PUT /<model.id>/<id>

PUT /todo/5
{ title: 'Finish testing', priority: 2}
```

Notes: The request returns the updated record. It is not standard but it saves the UI a subsequent call.


#### Deletion
Simply use the DELETE verb with the id of the record to remove. 

```
DELETE /<model.id>/<id>

DELETE /todo/5
```

To delete multiple records at once, pass multiple ids (separated by commas).

```
DELETE /<model.id>/<id1>,<id2>,<id3>

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
GET /?id=<model.id>

GET /?id=todo
GET /?id=contact

```

Note: These end-point must be enabled in the configuration with { apiInfo: true }.

<a name="API_Charts"></a>
#### Charts

For charts data, it is possible to get aggregated data for field of types lov, boolean, integer, decimal, and money. Use the attribute "noCharts" to exclude a field from Charts.

```
GET /<model.id>/chart/<field id>

GET /todo/chart/category
```

#### Stats

Returns the total count, and the min, max, average, and total for numeric fields in the model.

```
GET /<model.id>/stats

GET /todo/stats
```

#### Lists of Values

Dropdown fields in the UI (field.type="lov" in the model) have a REST endpoint to get the list of values. This endpoint can also take a search query parameter.

```
GET /<model.id>/lov/<field.id>

GET /todo/lov/category
GET /todo/lov/category?search=pro
```

#### File upload

This endpoint lets you upload a file. The current (naive) implementation simply saves the file on the file server in a folder named like the model id (inside the folder specified by the option "uploadPath" in config.js).

```
POST /<model.id>/upload/<id>

POST /comics/upload/5
```

With query parameters: file and "field.id".


#### Nested collections

If the model has collections defined, they can be queried with this end-point.

```
GET /<model.id>/collec/<collection.id>?id=<id>

GET /winecellar/collec/wine_tasting?id=1
```

<a name="Models"></a>
#### Models

When storing models in evol_object and evol_field tables, they can be queried through REST.

Get all models flagged as active.

```
GET /md/models
```

Get a model by ID (integer).

```
GET /md/model/<modelid>

GET /md/model/1
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
GET /db/<table_name>/columns

GET /db/contact/columns
GET /db/task/columns
```

Note: These end-point must be enabled in the configuration with { schemaQueries: true }.

#### API version

This endpoint gets the API version (as specified in the project's package.json file).

```
GET /version
```

<a name="GraphQL"></a>
## GraphQL

Evolutility-Server-Node provides a GraphQL interface using the same models as the REST API. 

- [Object by Id](#GraphQL_by_id)
- [List](#GraphQL_list)
- [Charts data](#GraphQL_charts_data)

By default GraphiQL runs at 
[http://localhost:2000/graphql](http://localhost:2000/graphql). It can be enabled or disabled in config.js.

<a name="GraphQL_by_id"></a>
### Object by Id

For getting a single record by Id.

```
# contact w/ id = 1
{ 
    contact (id: 1 ){
        firstname
        lastname
        category_txt
        email
  }
}

```
[View in GraphiQL](http://localhost:2000/graphql?query=%23%20contact%20by%20Id%0A%7B%20%0A%20%20%20%20contact%20(id%3A%201%20)%7B%0A%20%20%20%20firstname%0A%20%20%20%20lastname%0A%20%20%20%20category_txt%0A%20%20%20%20email%0A%20%20%7D%0A%7D)

<a name="GraphQL_list"></a>
### List of objects

All objects are exposed for queries with search and filters. Filter use the same [syntax for conditions](#Filtering) as the REST API (for example: { firstname: "sw.A" } for "Firstname starts with "A").

Fields of type "lov" (List of values) are represented as 2 fields for Id and value.

```
{ 
  # List - priority tasks not completed
	urgent_tasks: todos ( complete: "false", priority: "lt.3" ){
	    title
	    description
	    priority
	    priority_txt
	    category
	    category_txt
	    complete
  }
  # List - contacts w/ firstname starts w/ "A" and search for "ab"
  	ab_a_contacts: contacts (search: "ab", firstname: "sw.A") { 
	    id
	    firstname
	    lastname
	    category_txt
	    email
  }
}

```

[View in GraphiQL](http://localhost:2000/graphql?query=%7B%20%0A%20%20%23%20List%20-%20priority%20tasks%20not%20completed%0A%09urgent_tasks%3A%20todos%20(%20complete%3A%20%22false%22%2C%20priority%3A%22lt.3%22%20)%7B%0A%09%20%20%20%20title%0A%09%20%20%20%20description%0A%09%20%20%20%20priority%0A%09%20%20%20%20priority_txt%0A%09%20%20%20%20category%0A%09%20%20%20%20category_txt%0A%09%20%20%20%20complete%0A%20%20%7D%0A%20%20%23%20List%20-%20contacts%20w%2F%20firstname%20starts%20w%2F%20%22A%22%20and%20search%20for%20%22ab%22%0A%20%20%09ab_a_contacts%3Acontacts%20(search%3A%20%22ab%22%2C%20firstname%3A%20%22sw.A%22)%20%7B%20%0A%09%20%20%20%20id%0A%09%20%20%20%20firstname%0A%09%20%20%20%20lastname%0A%09%20%20%20%20category_txt%0A%09%20%20%20%20email%0A%20%20%7D%0A%7D).

<a name="GraphQL_charts_data"></a>
### Charts data

For all objects records can be aggregated and counted by field (for fields of numeric or "lov" types).

```
{ 
  # Charts - contacts by categories
  contacts_by_category: contact_charts(fieldId:"category"){
    label 
    value
  }
  # Charts - tasks by priorities
  task_by_priority: todo_charts(fieldId:"priority") {
    label 
    value
  }
  # Charts - restaurants by cuisine
  restaurants_by_cuisine: restaurant_charts(fieldId:"cuisine") {
    label 
    value
  }
}

```


[View in GraphiQL](http://localhost:2000/graphql?query=%7B%20%0A%20%20%23%20Charts%20-%20contacts%20by%20categories%0A%20%20contacts_by_category%3A%20contact_Charts(fieldId%3A%22category%22)%7B%0A%20%20%20%20label%20%0A%20%20%20%20value%0A%20%20%7D%0A%20%20%23%20Charts%20-%20tasks%20by%20priorities%0A%20%20task_by_priority%3A%20todo_Charts(fieldId%3A%22priority%22)%20%7B%0A%20%20%20%20label%20%0A%20%20%20%20value%0A%20%20%7D%0A%20%20%23%20Charts%20-%20restaurants%20by%20cuisine%0A%20%20restaurants_by_cuisine%3A%20restaurant_Charts(fieldId%3A%22cuisine%22)%20%7B%0A%20%20%20%20label%20%0A%20%20%20%20value%0A%20%20%7D%0A%7D%20)



<a name="License"></a>
## License

Copyright (c) 2019 [Olivier Giulieri](https://evoluteur.github.io/).

Evolutility-Server-Node is released under the [MIT license](http://github.com/evoluteur/evolutility-server-node/blob/master/LICENSE.md).
