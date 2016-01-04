var fs = require('fs');
var dbString = require('./db').url;

global.mongoose = require('mongoose').connect(dbString);
global.mongoose.connection.on('error', function(err) {
  console.log(err.stack);
});

fs.readdirSync(__dirname + '/../models').forEach(function(filename) {
  if (~filename.indexOf('.js')) {
    require('../models/' + filename);
  }
});
