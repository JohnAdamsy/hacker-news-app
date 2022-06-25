'use strict';
const CustomError = require('../lib/custom-error');
const axios = require("axios");
const { off } = require('superagent');
const HN_API = require('../config').HACKER_NEWS_API;
const debug = require('debug')('api:app:words');

/**
 * Returns the top 10 words occurring in the titles of Hacker News' last 25 stories
 *
 * @desc Returns the top 10 words occurring in the titles of Hacker News' last 25 stories
 *
 * @param {*} ctx
 * @param {*} next
 */
exports.topTenWordsOccurringFromLastTwentyFiveStories = async function topTenWordsOccurringFromLastTwentyFiveStories(ctx, next) {
    const ACTION = `VIEW_TOP_10_WORDS_FROM_LAST_25_STORIES`;

    try{

            let words = [];
            let wordCount = {};

            let storyItemIds =  await axios.get(`${HN_API}/newstories.json?limitToLast=25&orderBy="$priority"`).then(res => Object.values(JSON.parse(JSON.stringify(res.data))));
            

            debug(storyItemIds);

            const stories = storyItemIds.map((id) =>
                    axios.get(`${HN_API}/item/${id}.json`)
            );

            const storyItems = await Promise.all(stories);
            
            storyItems.map((item) => {
                debug(JSON.parse(JSON.stringify(item.data.title)));
                words = curateWords(words,JSON.parse(JSON.stringify(item.data.title)))
              });
       
            wordCount = countWords(wordCount,words)
            

            ctx.status = 200;
            ctx.body = {data: topTenWords(wordCount)};
        

    }catch(ex){
        let error = new CustomError({
            type: ex.type || ACTION,
            message: ex.stack,
            error_code: ex.error_code || '5501',
            status: ex.status,
            user_message: ex.user_message || ex.message
        });


        ctx.body = error
        ctx.status = error.status;

        return ctx.throw(error);
    }

}

function curateWords(words,title) {
    title = title.split(" ");
    //title = title.split(/\W+/);
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

  function topTenWords(dictionary) {
    var keys = Object.keys(dictionary);
    var sorted = keys.sort(function(a,b){return dictionary[b]-dictionary[a]});
    var newDictionary = {};
    for(let key of sorted.slice(0,10)){
        newDictionary[key] = dictionary[key];
    }
    return newDictionary;
}