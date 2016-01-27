# evolutility-server

Backend for [Evolutility](http://evoluteur.github.io/evolutility/index.html) using Node.js, Express and PostgreSQL.

This project is still a work in progress. The goal is to make a generic REST server (like [PostgREST](http://postgrest.com)) who will provide CRUD functionality 
for any database table.


## Installation

1- Download Evolutility-server.

2- Create a PostgreSQL database.

3- In server/config.js set your PostgreSQL connection string to the new database.

4- In the command line type the following:

```bash
# Install dependencies
npm install

# Add Evolutility client:
bower install

# Copy Evolutility client to Node.js
grunt

# Create sample tables
node server/models/database.js

# Run node.js web server
npm start

```

5- In a web browser go to the url http://localhost:3000/


## License

Copyright (c) 2016 Olivier Giulieri.

Evolutility.js is released under the GNU Affero General Public License version 3 [GNU AGPLv3](http://www.gnu.org/licenses/agpl-3.0.html).
