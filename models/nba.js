var mongoose = require('mongoose');

var nbaSchema = mongoose.Schema({
  name: String, // Current Types: 'play'
  firstYear: Number,
  lastYear: Number,
  active: {
    type: Boolean,
    default: false
  },
  shortname: String,
  photo: String,
  stats: [{
    season: String,
    team: String,
    gamesPlayed: Number,
    gamesStarted: Number,
    minutes: Number,
    FGM: Number,
    FGA: Number,
    threePA: Number,
    threePM: Number,
    twoPA: Number,
    twoPM: Number,
    FTA: Number,
    FTM: Number,
    oRebound: Number,
    dRebound: Number,
    tRebound: Number,
    assists: Number,
    steals: Number,
    blocks: Number,
    turnovers: Number,
    personalFouls: Number,
    points: Number
  }]
});

// sets a hashed _id
nbaSchema.index({
  _id: 'hashed'
});

nbaSchema.index({
  name: 1
});

module.exports = mongoose.model('nbaPlayer', nbaSchema);
