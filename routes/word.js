'use strict';
/**
 * Load Module Dependencies.
 */
const Router  = require('koa-router');
const wordController  = require('../controllers/word');
var router  = Router();

router.get('/occurrences',wordController.topWordsOccurringFromLastStories); 

module.exports = router;
