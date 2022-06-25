'use strict';
/**
 * Load Module Dependencies
 */
const DEFAULT_ERROR = {
    status: 500,
    message: 'Unknown Error Occurred',
    error_code: '0000',
    user_message: "This is super unusual and unexpected. Our team is currently looking into it",
    type: "SERVER_ERROR"
}

/**
 * CustomError Type Definition
 */

class CustomError extends Error {
    constructor(info) {

        super(info.message ? info.message : DEFAULT_ERROR.message);
        
        this.type = info.type ? info.type : DEFAULT_ERROR.type;
        this.status = info.status ? info.status : DEFAULT_ERROR.status;
        this.user_message = info.user_message ? info.user_message : DEFAULT_ERROR.user_message;
        this.error_code = info.error_code ? info.error_code : DEFAULT_ERROR.error_code;
    }
}

// Expose Constructor
module.exports = CustomError;