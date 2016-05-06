var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var passport = require('passport');
var methodOverride = require('method-override'); // simulate DELETE and PUT (express4)
var session = require('express-session');
var bcrypt = require('bcrypt-nodejs');
var morgan = require('morgan'); 		// log requests to the console (express4)
var flash = require('express-flash');


mongoose.connect('mongodb://127.0.0.1/ToDoApp');

require('./models/Users');
require('./models/Todos');
require('./models/Items');



require('./config/passport');


var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();

app.use(session({ secret: 'session secret key',
                  resave: true,
                  saveUninitialized: true }));
app.use(passport.initialize());                                 // Initialize passport after the express.static middleware.
app.use(passport.session());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(express.static(path.join(__dirname, 'public')));


app.use('/', routes);
app.use('/', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

console.log("App listening on port 3000" );
module.exports = app;