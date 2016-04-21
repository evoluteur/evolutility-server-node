# evolutility-server

Generic RESTful API for CRUD (Create, Read, Update, Delete) and more using Node.js, Express and PostgreSQL. 

Evolutility-server is build to work with [Evolutility](http://evoluteur.github.io/evolutility/index.html) (but doesn't have to).


## Installation

You can use **NPM** to install Evolutility-server as an [npm package](https://www.npmjs.com/package/evolutility-server):

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

2. In the file /server/config.js set the PostgreSQL connection string and a schema name to access your new database.

3. In the command line type the following:

```bash
# Install dependencies
npm install

# Copy Evolutility client to Node.js
grunt

# Create sample tables
node server/models/database.js

# Run node.js web server
npm start

```

4. In a web browser go to the url [http://localhost:3000/](http://localhost:3000/).


## API
Evolutility-server provides a generic RESTful API for CRUD (Create, Read, Update, Delete) and more.
It is a partial server-side Javascript implementation of [PostgREST](http://postgrest.com) using [Node.js](https://nodejs.org/en/), [Express](http://expressjs.com/) and [PostgreSQL](http://www.postgresql.org/).

When running Evolutility-server locally, the url for the "todo" app is 
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
GET /todo?order=complete.asc

GET /todo?order=priority.desc,title.asc
```
If no direction is specified it defaults to ascending order:
```
GET /todo?order=duedate
```

#### Limiting and Pagination


The reserved words "page" and "pageSize" limits the response rows.
```
GET /todo?page=0&pageSize=5
```

### Updating Data

#### Record Creation

To create a row in a database table post a JSON object whose keys are the names of the columns you would like to create. Missing keys will be set to default values when applicable.

```
POST /todo
{ field.id1: 'value1', field.id2: 'value2'}
```

#### Update

```
PATCH /todo
{ field.id1: 'value1', field.id2: 'value2'}
```

#### Deletion
Simply use the DELETE verb with the id of the record to remove. 

```
DELETE /todo/5
```

## License

Copyright (c) 2016 Olivier Giulieri.

Evolutility.js is released under the GNU Affero General Public License version 3 [GNU AGPLv3](http://www.gnu.org/licenses/agpl-3.0.html).
