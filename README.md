# Evolutility-Server-Node

RESTful Micro-ORM for CRUD and more, using Node.js, Express, and PostgreSQL.

Evolutility-Server-Node provides REST endpoints for CRUD (Create, Read, Update, Delete) and simple charts based on models rather than code.
 
For a matching model-driven UI, use [Evolutility-UI-React](http://github.com/evoluteur/evolutility-ui-react) or [Evolutility-UI-jQuery](http://github.com/evoluteur/evolutility-ui-jquery).


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


## Setup

After installing Evolutility-Server-Node, follow these steps:

1. Create a PostgreSQL database.

2. In the file config.js set the PostgreSQL connection string and the schema name to access your new database.

3. In the command line type the following:

```bash
# Install dependencies
npm install

# Create sample database w/ demo tables
node js/utils/database.js

# Run the node.js server
npm start

```

In a web browser, go to the url [http://localhost:3000/api/v1/evolutility/todo](http://localhost:3000/api/v1/evolutility/todo).


## Models

To be accessible by the REST API, each database table must be described in a model.
Models contain the name of the driving table and the list of fields/columns present in the API.


### Entity

| Property     | Meaning                                 |
|--------------|-----------------------------------------|
| id           | Unique key to identify the entity (used as API parameter). |
| table        | Database table name.                    |
| fields       | Array of fields.                        |
| groups       | Array of groups.                        |
| titleField    | Field id for the column value used as record title. |
| searchFields    | Array of field ids for fields used to perform searches.  |  


### Field

| Property     | Meaning                               |
|--------------|---------------------------------------|
| id           | Unique key for the field (can be the same as column but doesn't have to be). |
| column       | Database column name for the field    |
| lovtable     | Table to join to for field value (only for fields of "lov" type). |  
| lovcolumn    | column for field value (only for fields of "lov" type). |  
| type         | Field type is not a database column type but more a UI field type. Possible field types: <ul><li>boolean (yes/no)</li><li>date</li><li>datetime</li><li>decimal</li><li>document</li><li>email</li><li>image</li><li>integer</li><li>lov (list of values)</li><li>money</li><li>text</li><li>textmultiline</li><li>time</li><li>url</li></ul> |
| required     | Determines if the field is required for saving.      |
| readonly     | Prevents field modification.          |                      
| inMany       | Determines if the field is present (by default) in lists of records. | 

Notes: More field properties (unique, min, max, minLength, maxLength...) will be added later.

### Sample model

Here is a model for a To-Do app.

```javascript
module.exports = {
    id: "todo",
    table: "task",
    titleField: "title",
    fields: [
        {
            id: "title", column: "title", 
            label: "Title", 
            type: "text", required: true, maxLength: 300, 
            inMany: true
        },
        {
            id: "duedate", column: "duedate", 
            label: "Due Date",
            type: "date", 
            inMany: true
        },
        {
            id: "category", column: "category_id", 
            label: "Category", 
            type: "lov", lovtable: "task_category",
            inMany: true
        },
        {
            id: "priority", column: "priority_id", 
            label: "Priority", 
            type: "lov", lovtable: "task_priority", 
            required: true, 
            inMany: true
        {
            id: "complete", column: "complete", 
            label: "Complete",
            type: "boolean", 
            inMany: true
        },
        {
            id: "description", column: "description", 
            label: "Description",
            type: "textmultiline", maxLength: 1000
        }
    ]
  
};

```


## API
Evolutility-Server-Node provides a generic RESTful API for CRUD (Create, Read, Update, Delete) and more.
It is a partial server-side Javascript implementation of [PostgREST](http://postgrest.com) using [Node.js](https://nodejs.org/en/), [Express](http://expressjs.com/) and [PostgreSQL](http://www.postgresql.org/).

When running Evolutility-Server-Node locally, the url for the "todo" app is 
[http://localhost:3000/api/v1/evolutility/todo](http://localhost:3000/api/v1/evolutility/todo).

### Requesting Information

#### Get One
To get a specific record by ID, use "< ObjectName >/ID".

```
GET /<object>/<id>

GET /todo/12
```

#### Get Many
Every model is exposed. You can query lists of items by using the model ID.

```
GET /<object>

GET /todo
```

#### Filtering
You can filter result rows by adding conditions on fields, each condition is a query string parameter. 

```
GET /<object>/<field.id>=<operator>.<value>

GET /todo?title=sw.a
GET /todo?priority=in.1,2,3
```
Adding multiple parameters conjoins the conditions:
```
todo?complete=0&duedate=lt.2016-01-01
```

These operators are available:

| Operator     | Meaning                 | Example                      |
|--------------|-------------------------|------------------------------|
| eq           | equals                  | /todo?category=eq.1          |
| gt           | greater than            | /todo?duedate=gt.2016-01-15  |
| lt           | less than               | /todo?duedate=lt.2016-01-15  |
| gte          | less than or equal      | /todo?duedate=gte.2016-01-15 |
| lte          | less than or equal      | /todo?duedate=lte.2016-01-15 |
| ct           | contains                | /todo?title=ct.e             |
| sw           | start with              | /todo?title=sw.a             |
| fw           | finishes with           | /todo?title=fw.z             |
| in           | one of a list of values | /todo?priority=in.1,2,3      |
| 0            | is false                | /todo?complete=0             |
| 1            | is true                 | /todo?complete=1             |
| null         | is null                 | /todo?category=null          |
| nn           | is not null             | /todo?category==nn           |


#### Ordering

The reserved word "order" reorders the response rows. It uses a comma-separated list of fields and directions:

```
GET /<object>?order=<field.id>.<asc/desc>

GET /todo?order=priority.desc,title.asc
```
If no direction is specified it defaults to ascending order:
```
GET /todo?order=duedate
```

#### Limiting and Pagination


The reserved words "page" and "pageSize" limits the response rows.

```
GET /<object>?page=<pageindex>&pageSize=<pagesize>

GET /todo?page=0&pageSize=50
```

#### Formatting

By default all APIs return data in JSON format. This API call allows to request data in CSV format (export to Excel).
This feature is using [express-csv](https://github.com/nulltask/express-csv).

```
GET /<object>?format=csv

GET /todo?format=csv
```
Notes: In the returned data every object has an extra property "\_full_count" which indicate the total number of records in the query (before limit).

### Updating Data

#### Record Creation

To create a row in a database table post a JSON object whose keys are the names of the columns you would like to create. Missing keys will be set to default values when applicable.

```
POST /todo
{ title: 'Finish testing', priority: 2}
```

#### Update

```
PATCH /todo
{ title: 'Finish testing', priority: 2}
```

#### Deletion
Simply use the DELETE verb with the id of the record to remove. 

```
DELETE /<object>/<id>

DELETE /todo/5
```

### Extras endpoints

In addition to CRUD, Evolutility-Server-Node provides endpoints for Charts and Lists of values.

#### Charts

For charts data, it is possible to get aggregated data.

```
GET /<object>/chart/<field id>

GET /todo/chart/category
```

#### Lists of Values

Dropdown fields in the UI (field.type="lov" in the model) have a REST endpoint to get the list of values for dropdowns.

```
GET /<object>/lov/<field id>

GET /todo/lov/category
```


## License

Copyright (c) 2016 Olivier Giulieri.

Evolutility-Server-Node is released under the [MIT license](http://github.com/evoluteur/evolutility-server-node/blob/master/LICENSE.md).
