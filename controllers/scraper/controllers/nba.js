var async = require('async');
var request = require('request');
var cheerio = require('cheerio');
var nbaPlayer = mongoose.model('nbaPlayer');
module.exports.run = (next) => {
  console.log('here');
  var alphabet = 'abcdefghijklmnopqrstuvwxyz';
  async.eachSeries(alphabet.split(''), (letter, callback) => {
    var players = [];
    async.waterfall([
      (cb) => {
        request('http://www.basketball-reference.com/players/' + letter + '/', cb);
      }, (res, body, cb) => {
        var $ = cheerio.load(body, {
          lowerCaseTags: true,
          lowerCaseAttributeNames: true
        });
        $('table#players tr').each(function(i, elem) {
          var name = $(elem).find('td:nth-of-type(1) a').text().trim();
          var birthday = $(elem).find('td:nth-of-type(7)').attr('csk');
          var firstYear = $(elem).find('td:nth-of-type(2)').text().trim();
          var lastYear = $(elem).find('td:nth-of-type(3)').text().trim();
          var playerPage = $(elem).find('td:nth-of-type(1) a').attr('href');
          var active = ($(elem).find('td:nth-of-type(1) strong').length ? true : false);

          if (name && birthday && firstYear && lastYear && playerPage) {
            var shortname = (name + birthday).replace(/\s|\W/g, '').toLowerCase();
            players.push({
              name: name,
              active: active,
              shortname: shortname,
              firstYear: firstYear,
              lastYear: lastYear,
              playerPage: playerPage
            });
          }
        });
        async.each(players, (player, cb1) => {
          async.waterfall([
            (cb2) => {
              request('http://www.basketball-reference.com' + player.playerPage, cb2);
            }, (res, playerBody, cb2) => {
              var $ = cheerio.load(playerBody, {
                lowerCaseTags: true,
                lowerCaseAttributeNames: true
              });
              var playerPhoto = $('#info_box div:nth-of-type(2) img').attr('src');
              player.photo = playerPhoto || null;
              player.stats = [];
              $('table.sortable.row_summable.stats_table#totals tbody tr').each((i, elem) => {
                var season = $(elem).find('td:nth-of-type(1) a').text().trim();
                var team = $(elem).find('td:nth-of-type(3)').text().trim();
                if (!team.match(/^tot$|did not play/i)) {
                  var gamesPlayed = $(elem).find('td:nth-of-type(6)').text().trim();
                  var gamesStarted = $(elem).find('td:nth-of-type(7)').text().trim();
                  var minutes = $(elem).find('td:nth-of-type(8)').text().trim();
                  var FGM = $(elem).find('td:nth-of-type(9)').text().trim();
                  var FGA = $(elem).find('td:nth-of-type(10)').text().trim();
                  var threePA = $(elem).find('td:nth-of-type(13)').text().trim();
                  var threePM = $(elem).find('td:nth-of-type(12)').text().trim();
                  var twoPA = $(elem).find('td:nth-of-type(16)').text().trim();
                  var twoPM = $(elem).find('td:nth-of-type(15)').text().trim();
                  var FTA = $(elem).find('td:nth-of-type(20)').text().trim();
                  var FTM = $(elem).find('td:nth-of-type(19)').text().trim();
                  var oRebound = $(elem).find('td:nth-of-type(22)').text().trim();
                  var dRebound = $(elem).find('td:nth-of-type(23)').text().trim();
                  var tRebound = $(elem).find('td:nth-of-type(24)').text().trim();
                  var assists = $(elem).find('td:nth-of-type(25)').text().trim();
                  var steals = $(elem).find('td:nth-of-type(26)').text().trim();
                  var blocks = $(elem).find('td:nth-of-type(27)').text().trim();
                  var turnovers = $(elem).find('td:nth-of-type(28)').text().trim();
                  var personalFouls = $(elem).find('td:nth-of-type(29)').text().trim();
                  var points = $(elem).find('td:nth-of-type(30)').text().trim();
                  var stats = {
                    season: season,
                    team: team,
                    gamesPlayed: (gamesPlayed ? parseInt(gamesPlayed) : 0),
                    gamesStarted: (gamesStarted ? parseInt(gamesStarted) : 0),
                    minutes: (minutes ? parseInt(minutes) : 0),
                    FGM: (FGM ? parseInt(FGM) : 0),
                    FGA: (FGA ? parseInt(FGA) : 0),
                    threePA: (threePA ? parseInt(threePA) : 0),
                    threePM: (threePM ? parseInt(threePM) : 0),
                    twoPA: (twoPA ? parseInt(twoPA) : 0),
                    twoPM: (twoPM ? parseInt(twoPM) : 0),
                    FTA: (FTA ? parseInt(FTA) : 0),
                    FTM: (FTM ? parseInt(FTM) : 0),
                    oRebound: (oRebound ? parseInt(oRebound) : 0),
                    dRebound: (dRebound ? parseInt(dRebound) : 0),
                    tRebound: (tRebound ? parseInt(tRebound) : 0),
                    assists: (assists ? parseInt(assists) : 0),
                    steals: (steals ? parseInt(steals) : 0),
                    blocks: (blocks ? parseInt(blocks) : 0),
                    turnovers: (turnovers ? parseInt(turnovers) : 0),
                    personalFouls: (personalFouls ? parseInt(personalFouls) : 0),
                    points: (points ? parseInt(points) : 0)
                  };
                  player.stats.push(stats);
                  console.log(player);
                  console.log(stats);
                  console.log();
                }
              });

              cb2(null);
            }
          ], cb1);
        }, cb);
      }, (cb) => {
        nbaPlayer.find().exec(cb);
      }, (docs, cb) => {
        var nbaPlayers = {};
        docs.forEach(function(doc) {
          nbaPlayers[doc.shortname] = doc;
        });
        async.each(players, function(player, cb1) {
          if (!nbaPlayers[player.shortname]) {
            var newPlayer = new nbaPlayer(player);
            newPlayer.save(cb1);
          } else if ((player.photo && nbaPlayers[player.shortname].photo !== player.photo) || nbaPlayers[player.shortname].lastYear !== player.lastYear || nbaPlayers[player.shortname].active !== player.active || player.stats.length) {
            console.log(nbaPlayers[player.shortname]);
            console.log(player);
            console.log();
            nbaPlayers[player.shortname].photo = player.photo;
            nbaPlayers[player.shortname].lastYear = player.lastYear;
            nbaPlayers[player.shortname].active = player.active;
            nbaPlayers[player.shortname].stats = [];
            player.stats.forEach(function(season) {
              nbaPlayers[player.shortname].stats.addToSet(season);
            });
            nbaPlayers[player.shortname].save(cb1);
          } else {
            cb1(null);
          }
        }, cb);
      }
    ], (err) => {
      if (err) {
        console.log(err.stack);

      }
      callback(err);
    });
  }, next);
};
