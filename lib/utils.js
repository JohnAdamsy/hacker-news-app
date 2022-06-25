'use strict';
const debug       = require('debug')('api:hn-app:utils');


exports.onListening = function onListening(server, PORT) {
  return function() {
    let bind = (typeof PORT === 'string') ? `Pipe ${PORT}` : `Port ${PORT}`;
    debug(`Listening on ${bind}`);
  }
};

exports.onError = function onError(PORT) {
  return function(error) {
    debug('Server ConnectionError Triggered');

    if (error.syscall !== 'listen') {
      throw error;
    }

    let bind = (typeof PORT === 'string') ? `Pipe ${PORT}` : `Port ${PORT}`;

    switch(error.code) {
      case 'EACCES':
        console.error(`${bind} requires privileged access`);
        process.exit(1);
        break;
      case 'EADDRINUSE':
        console.error(`${bind} is already in use`);
        process.exit(1);
        break;
      default:
        throw error;
    }
  }
};


module.exports.transformResponseError = function transformResponseError(ex) {
  return {
      status: ex.status ? ex.status : 500,
      message: ex.message,
      error_code: ex.error_code ? ex.error_code : '0000',
      user_message: ex.user_message ? ex.user_message : "This is super unusual and unexpected. Our team is currently looking into it",
      type: ex.type ? ex.type : "SERVER_ERROR"
  }
}
