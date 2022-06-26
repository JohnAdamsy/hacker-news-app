'use strict';
/**
 * Load Module Dependencies.
 */
const Router  = require('koa-router');
const wordController  = require('../controllers/word');
var router  = Router();

router.get('/occurrences',wordController.topWordsOccurringFromLastStories); 
router.get('/occurrences/last-week',wordController.topWordsOccurringFromLastStoriesOfLastWeek);
//router.get('/occurrences/top-users',null);

module.exports = router;
