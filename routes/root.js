'use strict';
/**
 * Root router
 */

const Router  = require('koa-router');
const debug   = require('debug')('api:root-router');
const ms      = require('ms');

const pkg    = require('../package.json');

var router  = Router();

  router.get('/', async function(ctx,next) {
    debug('Default endpoint');
  
    ctx.body = {
      name:       pkg.name,
      version:    pkg.version,
      description: pkg.description,
      author: pkg.author
    };
  });

module.exports = router;

