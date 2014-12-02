/*jshint -W079 */
'use strict';

var Promise = require('es6-promise').Promise;

module.exports = function(data) {
  return new Promise(function(resolve, reject) {
    data.save(function(err, data) {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
};
