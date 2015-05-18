/**
 * Module dependencies.
 */

var express = require('express'),
    cookieParser = require('cookie-parser'),
    compress = require('compression'),
    session = require('express-session'),
    bodyParser = require('body-parser'),
    csrf = require('lusca').csrf(),
    _ = require('lodash'),
    MongoStore = require('connect-mongo')({ session: session }),
    flash = require('express-flash'),
    path = require('path'),
    mongoose = require('mongoose'),
    expressValidator = require('express-validator'),
    connectAssets = require('connect-assets'),
    ejs = require('ejs'),
    partials = require('express-partials'),
    app = express();

var hour = 3600000,
    day = hour * 24,
    week = day * 7;

/**
 * Connect to MongoDB
 */
var mongoDb = process.env.MONGODB || "mongodb://127.0.0.1/poolofvideo";
mongoose.connect(mongoDb);
mongoose.connection.on('error', function() {
  console.error('MongoDB Connection Error. Make sure MongoDB is running.');
});

/**
 * Express configuration
 */
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.engine('ejs', ejs.__express);
partials.register('.ejs', ejs);
app.use(partials());
app.use(compress());
app.use(connectAssets({
  paths: [path.join(__dirname, 'public/css'), path.join(__dirname, 'public/js')],
  helperContext: app.locals
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressValidator());
app.use(cookieParser());
app.use(session({
  resave: true,
  saveUninitialized: true,
  secret: process.env.SECRET || '526aa78cdeedf412fd27fedb5ab5ecf8',
  store: new MongoStore({
    url: mongoDb,
    autoReconnect: true
  }),
  cookie: {
    maxAge: 4 * week
  }
}));
app.use(flash());

/**
 * CSRF protection
 */
var csrfPathWhitelist = [];
app.use(function(req, res, next) {
   // @todo Re-enable, but only when a validated API key is not in header
  // CSRF protection.
  // if (_.contains(csrfPathWhitelist, req.path)) return next();
  //csrf(req, res, next);
  res.locals._csrf = null;
  next();
});


/**
 * Template wide options
 */
app.use(function(req, res, next) {
  res.locals.title = "Pool of Video";
  next();
});

/**
 * Static content
 */
app.use(express.static(path.join(__dirname, 'public'), { maxAge: week * 4 }));

app.use(function(req, res, next) {
  // Open up calls to cross site origin requests
  res.setHeader("Access-Control-Allow-Origin", "*");
  // Specify which headers and methods can be set by the client
  // Explicitly required for compatiblity with many browser based REST clients
  res.setHeader("Access-Control-Allow-Headers", "Origin,X-Requested-With,Content-Type,Accept,Session-Id,Api-Key");
  res.setHeader("Access-Control-Allow-Methods", "POST,GET,OPTIONS,PUT,DELETE");
  
  if (req.method == "OPTIONS") {
      // Return immediately for all OPTIONS requests
      res.send();
  } else {
      next();
  }
});

/**
 * Define Routes
 */
var routes = {
  videos: require('./routes/videos')
};
app.get('/', function(req, res) { return res.redirect('/videos'); });
app.get('/videos', routes.videos.getVideos);
app.get('/videos/add', routes.videos.getVideosAdd);
app.post('/videos/add', routes.videos.postVideosAdd);
app.get('/videos/edit/:id', routes.videos.getVideoEdit);
app.post('/videos/edit/:id', routes.videos.postVideoEdit);
app.get('/videos/search', routes.videos.getVideosSearch);
app.get('/videos/:id', routes.videos.getVideo);
app.get('/help', function(req, res) { return res.render('help'); });

/**
 * 500 Error Handler
 */
app.use(function (err, req, res, next) {
  // treat as 404
  if (err.message
    && (~err.message.indexOf('not found')
    || (~err.message.indexOf('Cast to ObjectId failed')))) {
    return next();
  }
  console.error(err.stack);
  res.status(500).render('500', { error: err.stack, title: "Internal Server Error" });
});

/**
 * 404 File Not Found Handler
 */
app.use(function (req, res, next) {
  res.status(404).render('404', { url: req.originalUrl });
});
  
/**
 * Start the server
 */
app.listen(app.get('port'), function() {
  console.log('Express server listening on port %d in %s mode', app.get('port'), app.get('env'));
});

module.exports = app;