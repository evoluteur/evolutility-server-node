/*
  ______          _           _ _ _
 |  ____|        | |      /| (_) (_)/|
 | |____   _____ | |_   _| |_ _| |_| |_ _   _
 |  __\ \ / / _ \| | | | | __| | | | __| | | |
 | |___\ V / (_) | | |_| | |_| | | | |_| |_| |
 |______\_/ \___/|_|\__,_|\__|_|_|_|\__|\__, |
         ___  ___ _ ____   _____ _ __    __/ |
  ____  / __|/ _ \ '__\ \ / / _ \ '__|  |___/
 |____| \__ \  __/ |   \ V /  __/ |
        |___/\___|_|    \_/ \___|_| 

* https://github.com/evoluteur/evolutility-server-node
* (c) 2020 Olivier Giulieri
*/

const express = require('express'),
    path = require('path'),
    helmet = require('helmet'),
    bodyParser = require('body-parser'),
    routes = require('./js/routes'),
    expressGraphQL = require('express-graphql'),
    { graphQL } = require('./config');

const app = express();

app.use(helmet());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, './client', 'public')));

// - prevent denial of cross origin requests
// TODO: REMOVE IF UNNECESSARY
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  //res.header("Access-Control-Request-Headers", "X-Requested-With,Access-Control-Request-Method,Access-Control-Request-Headers, accept, Content-Type");
  next();
});

// - GraphQL server
if(graphQL){
    app.use('/graphql', expressGraphQL({
        schema: require('./js/graphql-schema'),
        graphiql: true
    }))
}

// - REST server
app.use('/', routes);

// - catch 404 and forward to error handler
app.use(function(err, req, res, next) {
    //var err = new Error('Not Found');
    //err.status = 404;
    //next(err);
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

module.exports = app;
