'use strict';

var sharejs = require('share');

var options = {
  db: {
    type: 'mongo',
    opsCollectionPerDoc: false
  },
  browserChannel: {cors: '*'},
  auth: function(client, action) {
    if (action.name === 'submit op' && action.docName.match(/^readonly/)) {
      action.reject();
    } else {
      action.accept();
    }
  }
};

module.exports = function(app) {
  sharejs.server.attach(app, options);
};
