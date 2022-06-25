'use strict';
/**
 * Load Module Dependencies.
 */
const Router  = require('koa-router');
const wordController  = require('../controllers/word');
var router  = Router();

router.get('/top-10',wordController.topTenWordsOccurringFromLastTwentyFiveStories); 

module.exports = router;
