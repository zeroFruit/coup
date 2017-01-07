/*
  Controller - index

    * About
      This module is hub of all controllers. Every controllers spown from here.
      To protect the route, feed passport.

*/
var _auth     = require('../models/auth');

/*
  Controller module
*/
var auth      = require('./auth');
var home      = require('./home');
var register  = require('./register');
var recharge  = require('./recharge');
var system    = require('./systemManagement');
var clients   = require('./clients');
var ad        = require('./advertise');
var account   = require('./account');

//test route
var test      = require('./test');

module.exports.set = function(app) {
  /*
    passportInit need app to initialize passport
  */
  var passport = _auth.passportInit(app);

  auth.set(app, passport);
  home.set(app, passport);
  register.set(app, passport);
  recharge.set(app, passport);
  system.set(app, passport);
  clients.set(app, passport);
  ad.set(app, passport);
  account.set(app, passport);


  ///////////////test
  test.set(app, passport);
}
