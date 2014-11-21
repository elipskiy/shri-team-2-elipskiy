'use strict';

var connection = require('../../js/connection');
var editor = require('../editor/editor')('ace');

editor.init();
connection.connect();
