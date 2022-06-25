'use strict';

/**
 * Load Module Dependencies
 */
const http    = require('http');
const koa         = require('koa');
const debug       = require('debug')('api:app:server');
const logger      = require('koa-logger');
const bodyParser  = require('koa-body');
const config       = require('./config');
const utils        = require('./lib/utils');
const errorHandler = require('./middleware/error-handler');
const router       = require('./routes');

const PORT = config.PORT;

let app = new koa();
let server;


if(config.env === 'production') {
    app.proxy = true;
}


if(config.env === 'development') {
    app.use(logger());
}

app.use(errorHandler());
app.use(bodyParser({multipart: false}));
app.use(router.routes());


server = http.createServer(app.callback());

app.on('error', (err, ctx)=> {
    console.log('Server Error',err, ctx);
});

server.listen(PORT);
server.on('error', utils.onError(PORT));
server.on(`listening`, utils.onListening(server, PORT));


module.exports = app;