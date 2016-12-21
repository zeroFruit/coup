const express         = require('express');
const path            = require('path');
const favicon         = require('serve-favicon');
const logger          = require('morgan');
const cookieParser    = require('cookie-parser');
const bodyParser      = require('body-parser');

const app = express();

/*
  jwtTokenSecret
*/
app.set('jwtTokenSecret', 'Your_SECRET_STRING');

/*
  authenticate
*/
// const authenticate  = require('./models/auth');
// authenticate.passportInit(app);


// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

/*
  static file
*/
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use('/clients/public', express.static(path.join(__dirname, 'public')));
app.use('/clients/enter/public',      express.static(path.join(__dirname, 'public')));
app.use('/clients/leave/public',      express.static(path.join(__dirname, 'public')));
app.use('/clients/pause/public',      express.static(path.join(__dirname, 'public')));
app.use('/clients/floor/public',      express.static(path.join(__dirname, 'public')));
app.use('/clients/seatstate/public',  express.static(path.join(__dirname, 'public')));
app.use('/bower_components', express.static(path.join(__dirname, 'bower_components')));
app.use('/test/public',      express.static(path.join(__dirname, 'public'))); // test should be changed as path name



/*
  Load up the all controllers
*/
var controllers = require('./controllers/index');
controllers.set(app);

/*
  schedulerTest

    reduce entire member's left day with 1 every 12 AM
*/
const schedule  = require('node-schedule');
const rule      = new schedule.RecurrenceRule();
const alarm     = require('./models/alarm');
//rule.second = [30];
schedule.scheduleJob('0 0 0 * * *', function() { /* rule should be '0 0 0 * * *' */
  console.log('####################################');
  console.log('today is finished');
  console.log('####################################');
  alarm.reduceDay();
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  console.log(req.body, req.url);
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  console.log(res.locals.error);
  console.log(res.locals.message);
  res.render('error');
});

module.exports = app;
