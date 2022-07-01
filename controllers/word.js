'use strict';
const CustomError = require('../lib/custom-error');
const axios = require("axios");
const { off } = require('superagent');
const HN_API = require('../config').HACKER_NEWS_API;
const debug = require('debug')('api:app:words');
const Joi = require('joi');
const {DateTime} = require('luxon');

/**
 * Returns the top {number} words occurring in the titles of Hacker News' last {specified} stories. 
 *  Has optional request query params: 
 *  1. lastStoryCount - number of stories to be retrieved from HN API. Default is 25
 *  2. topWordsCount - number of top most occurring words words. Default is 10
 *
 * @desc Returns the top {number} words occurring in the titles of Hacker News' last {specified} stories
 *
 * @param {*} ctx
 * @param {*} next
 */
exports.topWordsOccurringFromLastStories = async function topWordsOccurringFromLastStories(ctx, next) {
    const ACTION = `VIEW_TOP_WORDS_FROM_LAST_STORIES`;

    try{
            let query = {
                storyCount: ctx.query.lastStoryCount || 25,
                wordCount: ctx.query.topWordsCount || 10
            }

            const requestParamSchema = Joi.object({
                storyCount: Joi.number().min(1).optional(),
                wordCount: Joi.number().min(1).optional(),
            });

            await requestParamSchema.validateAsync(query, { warnings: true })
            .then(validated => {
                query = validated.value;
                return true
            }).catch(err => {
                err.type = ACTION;
                err.status = 400;
                throw (err);
            });

            let words = [];
            let wordCountDictionary = {};
            let response = {data: null,title: `Top ${query.wordCount} words from the last ${query.storyCount} stories`};
            let storyItemIds =  await axios.get(`${HN_API}/newstories.json?limitToLast=${query.storyCount}&orderBy="$key"`).then(res => Object.values(JSON.parse(JSON.stringify(res.data))));

            if(storyItemIds.length){
                const stories = storyItemIds.map((id) =>
                        axios.get(`${HN_API}/item/${id}.json`)
                );
                const storyItems = await Promise.all(stories);
                
                if(storyItems.length){
                    storyItems.map((item) => {
                        debug(JSON.parse(JSON.stringify(item.data.title)));
                        words = curateWords(words,JSON.parse(JSON.stringify(item.data.title)));
                    });
                    wordCountDictionary = countWords(wordCountDictionary,words);
                    response.data = topWords(wordCountDictionary, query.wordCount);
                }
            }

            ctx.status = 200;
            ctx.body = response
            
    }catch(ex){
        let error = new CustomError({
            type: ex.type || ACTION,message: ex.stack,error_code: ex.error_code || '5501',status: ex.status,user_message: ex.user_message || ex.message
        });
        ctx.body = error
        ctx.status = error.status;
        return ctx.throw(error);
    }
}

/**
 * Returns the top {number} words occurring in the titles of Hacker News' title from posts made exactly last week. 
 *  Has optional request query params: 
 *  1. topWordsCount - number of top most occurring words words. Default is 10
 *
 * @desc Returns the top {number} words occurring in the titles of Hacker News' from posts made exactly last week.
 *
 * @param {*} ctx
 * @param {*} next
 */
 exports.topWordsOccurringFromLastStoriesOfLastWeek = async function topWordsOccurringFromLastStoriesOfLastWeek(ctx, next) {
    const ACTION = `VIEW_TOP_WORDS_FROM_PAST_WEEK_STORIES`;

    try{
            let query = {
                wordCount: ctx.query.topWordsCount || 10
            }

            const startOfLastWeek = DateTime.now().startOf('week').minus({'week': 1}).toUTC();
            const endOfLastWeek = DateTime.now().endOf('week').minus({'week': 1}).toUTC();

            const requestParamSchema = Joi.object({
                wordCount: Joi.number().min(1).optional(),
            });

            await requestParamSchema.validateAsync(query, { warnings: true })
            .then(validated => {
                query = validated.value;
                return true
            }).catch(err => {
                err.type = ACTION;
                err.status = 400;
                throw (err);
            });

            let words = [];
            let wordCountDictionary = {};
            let response = {data: null,title: `Top ${query.wordCount} words from posts of last week (${startOfLastWeek.toISODate()} to ${endOfLastWeek.toISODate()})`, posts: 0};
            const getPosts =  ['newstories','beststories','topstories','askstories','showstories','jobstories'].map((story)=>
                axios.get(`${HN_API}/${story}.json?orderBy="$priority"`).then(res => Object.values(JSON.parse(JSON.stringify(res.data))))
            );
            let postIds  = await Promise.all(getPosts);
            
            if(postIds.length){
                postIds = Array.from(new Set(postIds.flat())); //merge and remove duplicate ids
                const stories = postIds.map((id) =>
                        axios.get(`${HN_API}/item/${id}.json`).then(res =>JSON.parse(JSON.stringify(res.data)))
                );
                const storyItems = await Promise.all(stories);
                
                if(storyItems.length){
                    storyItems.map((item) => {
                        item.time = DateTime.fromSeconds(item.time).toUTC();
                        if(item.time >= startOfLastWeek && item.time <= endOfLastWeek ){
                            words = curateWords(words,item.title);
                        }
                        
                    });
                    wordCountDictionary = countWords(wordCountDictionary,words);
                    response.posts = storyItems.length;
                    response.data = topWords(wordCountDictionary, query.wordCount);
                }
            }

            ctx.status = 200;
            ctx.body = response
            
    }catch(ex){
        let error = new CustomError({
            type: ex.type || ACTION,message: ex.stack,error_code: ex.error_code || '5501',status: ex.status,user_message: ex.user_message || ex.message
        });
        ctx.body = error
        ctx.status = error.status;
        return ctx.throw(error);
    }
}

/**
 * Returns the top {number} words occurring in the titles of the last 600 stories of users with atleast 10,000 karma
 *  Has optional request query params: 
 *  1. topWordsCount - number of top most occurring words words. Default is 10
 *  2. userKarma - user's karma value. Default is 10,000
 *  3. lastStoryCount - number of stories to be retrieved from HN API. Default is 600
 *
 * @desc Returns the top {number} words occurring in the titles the last 600 stories of users with at least 10,000 karma.
 *
 * @param {*} ctx
 * @param {*} next
 */
 exports.topWordsOccurringFromLastStoriesByUsersWithMinimumKarma = async function topWordsOccurringFromLastStoriesByUsersWithMinimumKarma(ctx, next) {
    const ACTION = `VIEW_TOP_WORDS_FROM_LAST_STORIES_BY_USER_WITH_MINIMUM_KARMA`;

    try{
            let query = {
                wordCount: ctx.query.topWordsCount || 10,
                userKarma: ctx.query.minUserKarma || 10000,
                storyCount: ctx.query.lastStoryCount || 600
            }

            const requestParamSchema = Joi.object({
                wordCount: Joi.number().min(1).optional(),
                userKarma: Joi.number().min(1).optional(),
                storyCount: Joi.number().min(1).optional()
            });

            await requestParamSchema.validateAsync(query, { warnings: true })
            .then(validated => {
                query = validated.value;
                return true
            }).catch(err => {
                err.type = ACTION;
                err.status = 400;
                throw (err);
            });

            let words = [];
            let wordCountDictionary = {};
            let response = {data: null,title: `Top ${query.wordCount} words from last ${query.storyCount} stories of users with at least ${query.userKarma} karma`, users: 0 , posts: 0};
            const getPosts =  ['newstories','beststories','topstories','askstories','showstories','jobstories'].map((story)=>
                axios.get(`${HN_API}/${story}.json?orderBy="$key"`).then(res => Object.values(JSON.parse(JSON.stringify(res.data))))
            );
            let postIds  = await Promise.all(getPosts);
            let uniquePostsCount = 0;
            let uniqueUserIds = [];
            
            if(postIds.length){
                uniquePostsCount = Array.from(new Set(postIds.flat())).length;
                postIds = Array.from(new Set(postIds.flat())).sort((a,b)=> b - a).slice(0,query.storyCount); //merge, remove duplicate ids, reverse sort and slice
                const getStory = postIds.map((id) =>
                        axios.get(`${HN_API}/item/${id}.json`)
                        .then(res =>JSON.parse(JSON.stringify(res.data)))
                        /*.then(item => axios.get(`${HN_API}/user/${item.by}.json`)
                        .then(res =>JSON.parse(JSON.stringify(res.data))))*/
                );
                const stories = await Promise.all(getStory);

                const getUser = stories.map((item) =>
                        axios.get(`${HN_API}/user/${item.by}.json`).then(res =>{ 
                            res = JSON.parse(JSON.stringify(res.data)); 
                            if(res.karma >= query.userKarma){
                                res.story = item;
                                if(!uniqueUserIds.includes(item.by)) {uniqueUserIds.push(item.by)}
                                return res;
                            }else return;
                        })
                );

                const userStories = await Promise.all(getUser);
                
                if(userStories.length){
                    let userCount = 0;
                    userStories.map((item) => {
                        if(item){
                            userCount += 1;
                            words = curateWords(words,item.story.title);
                        }
                        
                    });
                    wordCountDictionary = countWords(wordCountDictionary,words);
                    response.data = topWords(wordCountDictionary, query.wordCount);
                    response.users = uniqueUserIds.length;
                    response.posts = uniquePostsCount;
                }
            }

            ctx.status = 200;
            ctx.body = response
            
    }catch(ex){
        let error = new CustomError({
            type: ex.type || ACTION,message: ex.stack,error_code: ex.error_code || '5501',status: ex.status,user_message: ex.user_message || ex.message
        });
        ctx.body = error
        ctx.status = error.status;
        return ctx.throw(error);
    }
}


function curateWords(words,title) {
    //title = title.split(" ");
    title = title.split(/\W+/);
    for(let word of title){
        words.push(word.toLowerCase());
    }
    return words;
  }

  function countWords(wordCounter, dictionary){
    for(let word of dictionary){
        if(!/\d+/.test(word) && word !== null && word.length){
            if(wordCounter[word] === undefined){
                wordCounter[word] = 1;
            }else{
                wordCounter[word] += 1;
            }
        }
    }
    return wordCounter;
  }

  function topWords(dictionary,limit) {
    var keys = Object.keys(dictionary);
    var sorted = keys.sort(function(a,b){return dictionary[b]-dictionary[a]});
    var newDictionary = {};
    for(let key of sorted.slice(0,limit)){
        newDictionary[key] = dictionary[key];
    }
    return newDictionary;
}