'use strict';

/**
 * Load Module Dependencies
 */
const Router = require('koa-router');
const debug  = require('debug')('api:app-router');

const rootRouter      = require('./root');
const wordRouter      = require('./word');

var appRouter = new Router();

const OPEN_ENDPOINTS = [
    '/'
];

initialize('', rootRouter);
initialize('words', wordRouter);

function initialize(endpoint, router){
  appRouter.use(`/${endpoint}`, router.routes(), router.allowedMethods());
}

module.exports = appRouter;
