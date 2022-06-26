'use strict';
const CustomError = require('../lib/custom-error');
const axios = require("axios");
const { off } = require('superagent');
const HN_API = require('../config').HACKER_NEWS_API;
const debug = require('debug')('api:app:words');
const Joi = require('joi');

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
            let response = {data: null};
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
        if(!/\d+/.test(word) && word !== null){
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