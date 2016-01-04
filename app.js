require('dotenv').load();
var express = require('express');
var cors = require('cors');
var app = express();

require('./config/mongo');

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));

app.use(cors());

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

require('./controllers/routes/index')(app);
require('./controllers/scraper/index')(app);

app.listen(app.get('port'), () => {
  console.log('Node app is running on port', app.get('port'));
});

exports = module.exports = app;
