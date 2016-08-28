# Evolutility-Server

Micro-ORM with integrated RESTful API for CRUD (Create, Read, Update, Delete) and more using Node.js, Express and PostgreSQL. 

Evolutility-Server is build to work with [Evolutility](http://evoluteur.github.io/evolutility/index.html) or [React-Evolutility](http://github.com/evoluteur/react-evolutility) but could also work with your UI.


## Installation

You can use **NPM** to install Evolutility-Server as an [npm package](https://www.npmjs.com/package/evolutility-server):

```bash
# To get the latest stable version, use npm from the command line.
npm install evolutility-server
```

You can also use **Bower** to install Evolutility.

```bash
# To get the latest stable version, use Bower from the command line.
bower install evolutility-server

# To get the most recent, latest committed-to-master version use:
bower install evolutility-server#master
```

... or **download** it from [GitHub](https://github.com/evoluteur/evolutility-server/archive/master.zip).

## Setup

After installing Evolutility-server, follow these steps:

1. Create a PostgreSQL database.

2. In the file config.js set the PostgreSQL connection string and a schema name to access your new database.

3. In the command line type the following:

```bash
# Install dependencies
npm install

# Create sample database w/ demo tables
node js/utils/database.js

# Run the node.js server
npm start

```

4. In a web browser go to the url [http://localhost:3000/api/v1/evolutility/todo](http://localhost:3000/api/v1/evolutility/todo).

## Models

Each database table accessible by the RESTful API must be defined in a model.
Models contain the name of the driving table and a list of fields/columns.

### Entity

| Property     | Meaning                                 |
|--------------|-----------------------------------------|
| id           | Unique key to identify the entity (used as API parameter). |
| table        | Database table name.                    |
| fields       | Array of fields.                        |
| titleField    | Field id for the column value used as record title. |            
| searchFields  | Array of field ids identifing fields taking part in search. |      


### Field

| Property     | Meaning                               |
|--------------|---------------------------------------|
| id           | Unique key for the field (can be the same as column but doesn't have to be). |
| column       | Database column name for the field    |
| type         | Field type is not a database column type but more a UI field type. Possible field types: <ul><li>boolean (yes/no)</li><li>date</li><li>datetime</li><li>decimal</li><li>document</li><li>email</li><li>image</li><li>integer</li><li>lov (list of values)</li><li>text</li><li>textmultiline</li><li>time</li><li>url</li></ul> |
| required     | Determines if the field is required for saving.      |
| readonly     | Prevents field modification.          |
| lovtable     | Table to join to for field value (only for fields of "lov" type). |                        
| inMany       | Determines if the field is present (by default) in lists of records. |

### Sample model

Here is a model for a To-Do app.

```javascript
module.exports = {
    id: 'todo',
    table: 'task',
    titleField: 'title',
    searchFields: ['title', 'description', 'notes'],
    fields: [
        {
            id: 'title', column: 'title', type: 'text', label: 'Title', required: true,
            maxLength: 300,
            inMany: true
        },
        {
            id: 'duedate', column: 'duedate', type: 'date', label: 'Due Date', inMany: true
        },
        {
            id: 'category', column: 'category_id', type: 'lov', label: 'Category', inMany: true,
            lovtable: 'task_category'        },
        {
            id: 'priority', column: 'priority_id', type: 'lov', label: 'Priority', required: true,
            inMany: true,
            lovtable: 'task_priority',
        {
            id: 'complete', column: 'complete', type: 'boolean', inMany: true,
            label: 'Complete'
        },
        {
            id: 'description', column: 'description', type: 'textmultiline', 
            label: 'Description', 
            maxLength: 1000,
            inMany: false
        },
        {
            id: 'notes', column: 'notes', type: 'textmultiline', label: 'Notes', maxLength: 1000,
            inMany: false
        }
    ]
};

```

## API
Evolutility-Server provides a generic RESTful API for CRUD (Create, Read, Update, Delete) and more.
It is a partial server-side Javascript implementation of [PostgREST](http://postgrest.com) using [Node.js](https://nodejs.org/en/), [Express](http://expressjs.com/) and [PostgreSQL](http://www.postgresql.org/).

When running Evolutility-Server locally, the url for the "todo" app is 
[http://localhost:3000/api/v1/evolutility/todo](http://localhost:3000/api/v1/evolutility/todo).

### Requesting Information

#### Get Many
Every model is exposed. You can query lists of items by using the model ID.

```
GET /<object>

GET /todo
```


#### Get One
To get a specific item by ID, use /ID.

```
GET /<object>/<id>

GET /todo/12
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
| eq           | equals                  | /todo?category=eq.fun        |
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

## License

Copyright (c) 2016 Olivier Giulieri.

Evolutility-Server is released under the [MIT license](http://github.com/evoluteur/evolutility-server/raw/master/LICENSE.md).
