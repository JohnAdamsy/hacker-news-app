'use strict';

/**
 * Load Module Dependencies
 */
const debug = require('debug')('koa:error-handler');

module.exports = () => {
    return async function errorHandler(ctx,next){
        try {
            await next();

        }catch(err){
            const ERROR_INFO = {
                status: err.status ? err.status : 500,
                message: err.message,
                error_code: err.error_code ? err.error_code : '9999',
                user_message: err.user_message ? err.user_message : "This is super unusual and unexpected. Our team is currently looking into it.",
                type: err.type ? err.type : "SERVER_ERROR"
            };

            ctx.status = ERROR_INFO.status;
            ctx.body = ERROR_INFO;
            ctx.app.emit('error', err, ctx);
        }
    }
}