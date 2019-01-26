# Evolutility-Server-Node

Model-driven RESTful backend for CRUD and more, using Node.js, Express, and PostgreSQL.

Evolutility-Server-Node provides a set of generic REST endpoints for CRUD (Create, Read, Update, Delete) and simple charts based on models rather than code.
 
For a matching model-driven Web UI, use [Evolutility-UI-React](http://github.com/evoluteur/evolutility-ui-react) or [Evolutility-UI-jQuery](http://github.com/evoluteur/evolutility-ui-jquery).


### Table of Contents
1. [Installation](#Installation)
2. [Setup](#Setup)
3. [Configuration](#Configuration)
4. [Models](#Models)
5. [API](#API)
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

<a name="Setup"></a>
## Setup

After installing Evolutility-Server-Node, follow these steps:

1. Create a PostgreSQL database.

2. In the file [config.js](https://github.com/evoluteur/evolutility-server-node/blob/master/config.js) set the PostgreSQL connection string and the schema name to access your new database.

3. Maybe, also change other config options in the same file.

4. In the command line type the following:

```bash
# Install dependencies
npm install

# Create sample database w/ demo tables
node js/setup/database.js

# Run the node.js server
npm start

```

**Note**: The database creation and population scripts are logged in the files "evol-db-schema-{datetime}.sql" and  "evol-db-data-{datetime}.sql".

In a web browser, go to the url [http://localhost:2000/api/v1/evolutility/todo](http://localhost:2000/api/v1/evolutility/todo).


<a name="Configuration"></a>
## Configuration

Configuration options are set in the file [config.js](https://github.com/evoluteur/evolutility-server-node/blob/master/config.js).


| Option       | Description                             |
|--------------|-----------------------------------------|
| apiPath   | Path for REST API (i.e.: "/api/v1/evolutility/").|
| apiPort   | Port for REST API (i.e.: 2000). |
| connectionString | DB connection string (i.e.: "postgres://evol:love@localhost:5432/evol"). |
| schema | DB schema name (i.e.: "evolutility").|
| pageSize | Number of rows per page in pagination (default = 50).|
| lovSize | Maximum number of values allowed for form dropdowns (default = 100). |
| csvSize | Maximum number of rows in CSV export (default = 1000).|
| csvHeader | CSV list of labels for CSV export| | uploadPath | path for pictures and documents uploads (i.e.: "../evolutility-ui-react/public/pix/").|
| consoleLog | Log SQL statements to console.|
| wComments | Allow for user comments. |
| wRating | Allow for user ratings. |
| wTimestamp | Timestamp columns u_date and c_date w/ date of record creation and last update. |


<a name="Models"></a>
## Models

To be accessible by the REST API, each database table must be described in a model.
Models contain the name of the driving table and the list of fields/columns present in the API.


### Entity

| Property     | Description                             |
|--------------|-----------------------------------------|
| id           | Unique key to identify the entity (used as API parameter). |
| table        | Driving database table name (there are secondary tables for fields of type "lov"). |
| fields       | Array of fields.                        |
| titleField   | Field id for the column value used as record title. |
| searchFields | Array of field ids for fields used to perform searches.  |  


### Field

| Property     | Description                           |
|--------------|---------------------------------------|
| id           | Unique key for the field (can be the same as column but doesn't have to be). |
| column       | Database column name for the field.    |
| lovtable     | Table to join to for field value (only for fields of type "lov"). |  
| lovcolumn    | Column name (in the lovtable) for field value (only for fields of type "lov"). |  
| lovicon      | Set to True to include icon with LOV items (only for fields of type "lov").    |
| object       | Model id for the object to link to (only for fields of type "lov").    |
| type         | Field type is not a database column type but more a UI field type. Possible field types: <ul><li>boolean</li><li>date</li><li>datetime</li><li>decimal</li><li>document</li><li>email</li><li>image</li><li>integer</li><li>lov (list of values)</li><li>money</li><li>text</li><li>textmultiline</li><li>time</li><li>url</li></ul> |
| required     | Determines if the field is required for saving.      |
| readonly     | Prevents field modification.          |                      
| inMany       | Determines if the field is present (by default) in lists of records. | 
| max, min     | Maximum/Minimum value allowed (only applies to numeric fields).      |    
| maxLength, minLength | Maximum/Minimum length allowed (only applies to text fields).      | 
| unique       | Values must be unique (not implemented yet).   |
| noCharts     | Forbids charts on the field.   |
| deletetrigger | Deleting records in the lovtable will trigger a cascade delete (this property is only used while creating the database). |



### Collection

Multiple Master-Details can be specified with collections. 

| Property     | Meaning                               |
|--------------|---------------------------------------|
| id           | Unique key for the collection.        |
| table        | DB Table to query.      |
| column       | Column in the detail table to match against id of object. |
| object       | Model id for the object to display (optional).            |
| order        | "asc"/"desc" for sorting by the first field in fields.      |
| fields       | Array of fields. Fields in collections do not need all properties of Fields in objects.      |

Example of collection in [Wine cellar](https://github.com/evoluteur/evolutility-server-node/blob/master/models/winecellar.js).


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
            lovtable: "task_category",
            inMany: true
        },
        {
            id: "priority", 
            column: "priority_id", 
            type: "lov", 
            lovtable: "task_priority", 
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
 [Address book](https://github.com/evoluteur/evolutility-server-node/blob/master/models/contact.js),
 [Restaurants list](https://github.com/evoluteur/evolutility-server-node/blob/master/models/restaurant.js),
 [Wine cellar](https://github.com/evoluteur/evolutility-server-node/blob/master/models/winecellar.js),
 [Graphic novels inventory](https://github.com/evoluteur/evolutility-server-node/blob/master/models/comics.js). 
 

<a name="API"></a>
## API
Evolutility-Server-Node provides a generic RESTful API for CRUD (Create, Read, Update, Delete) and more.
It is a partial server-side Javascript implementation of [PostgREST](http://postgrest.com) using [Node.js](https://nodejs.org/en/), [Express](http://expressjs.com/) and [PostgreSQL](http://www.postgresql.org/).

When running Evolutility-Server-Node locally, the url for the "todo" app is 
[http://localhost:2000/api/v1/evolutility/todo](http://localhost:2000/api/v1/evolutility/todo).

### Requesting Information

#### Get One
To get a specific record by ID, use "< ObjectName >/ID".

```
GET /<model.id>/<id>

GET /todo/12
```

#### Get Many
Every model is exposed. You can query lists of items by using the model ID.

```
GET /<model.id>

GET /todo
```

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
| gt           | greater than            | /todo?duedate=gt.2017-01-15  |
| lt           | less than               | /todo?duedate=lt.2017-01-15  |
| gte          | less than or equal      | /todo?duedate=gte.2017-01-15 |
| lte          | less than or equal      | /todo?duedate=lte.2017-01-15 |
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
This feature is using [csv-express](https://github.com/nulltask/csv-express).

```
GET /<model.id>?format=csv

GET /todo?format=csv
```
Notes: In the returned data every object has an extra property "\_full_count" which indicate the total number of records in the query (before limit).

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

### Extras endpoints

In addition to CRUD, Evolutility-Server-Node provides a few endpoints for Charts, Lists of values, file upload, and API discovery.

#### Discovery

Returns the list of Objects and their APIs (only objects flagged active are included).

```
GET /
```
Note: This end-point must be enabled in the configuration with {apiInfo: true}.

#### Charts

For charts data, it is possible to get aggregated data for field of types lov, boolean, integer, decimal, and money.

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

Dropdown fields in the UI (field.type="lov" in the model) have a REST endpoint to get the list of values (used for dropdowns in the UI).

```
GET /<model.id>/lov/<field.id>

GET /todo/lov/category
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


#### API version

This endpoint gets the API version (as specified in the project's package.json file).

```
GET /version
```


<a name="License"></a>
## License

Copyright (c) 2019 [Olivier Giulieri](https://evoluteur.github.io/).

Evolutility-Server-Node is released under the [MIT license](http://github.com/evoluteur/evolutility-server-node/blob/master/LICENSE.md).
