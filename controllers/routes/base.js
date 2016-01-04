var nbaPlayer = mongoose.model('nbaPlayer');
module.exports = (app) => {
  app.get('/nba/players/:searchTerm', (req, res) => {
    var query;
    if (req.params.searchTerm.split(' ').length) {
      query = {};
      query['$and'] = req.params.searchTerm.split(' ').map((term) => {
        return {
          name: new RegExp(term, 'gi')
        };
      });
    } else {
      query = {
        name: new RegExp(req.params.searchTerm, 'gi')
      };
    }
    nbaPlayer.find(query).select('-stats').limit(10).exec(function(err, docs) {
      if (err) {
        console.log(err.stack);
        res.send({
          error: err.message
        });
      } else {
        res.send({
          success: docs
        });
      }
    });
  });

  app.get('/nba/player/:id', (req, res) => {
    if (req.params.id) {
      nbaPlayer.findOne({
        _id: req.params.id
      }).exec(function(err, doc) {
        if (err) {
          console.log(err.stack);
          res.send({
            error: err.message
          });
        } else {
          res.send({
            success: doc
          });
        }
      });
    }
  });
};
