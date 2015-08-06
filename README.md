# evolutility-server

Backend for [Evolutility](http://evoluteur.github.io/evolutility/index.html) using Node.js, Express and PostgreSQL.

It is still a work in progress. 

Evolutility-server is made for Evolutility (client) but can be used with your own client as well.


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

