var CronJob = require('cron').CronJob;
var async = require('async');

module.exports = () => {
  // require('./controllers/nba.js').run((err) => {
  //   console.log('done');
  // });
  new CronJob('0 0 0 * * *', function() {
    require('./controllers/nba.js').run(function(err) {
      console.log('done');
    });
  }, null, true, 'America/Los_Angeles');
};
