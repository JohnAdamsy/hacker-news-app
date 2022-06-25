'use strict';

/**
 * Load Module dependencies.
 */

const env = process.env;

const PORT      = env.PORT || 6500;
const API_URL   = env.API_URL || 'http://127.0.0.1:6500';
const NODE_ENV  = env.NODE_ENV || 'development';
const HOST      = env.HOST_IP || 'localhost';

let config = {

    // Root Configs
    API_URL: API_URL,

    ENV: NODE_ENV,

    PROCESS_ENV: env,

    PORT: PORT,

    HOST: HOST,

    TIME_ZONE: 'Africa/Nairobi',
    OK_STATUS: [200,201,202,204,208],
    HACKER_NEWS_API: `https://hacker-news.firebaseio.com/v0`
};

module.exports = config;
