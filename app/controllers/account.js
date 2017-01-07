var account     = require('../models/account');
var system      = require('../models/system');
var rendering   = require('../models/renderingPage');
var respond     = require('../helpers/respond');
var express     = require('express');
var moment      = require('moment');
var moment_tz   = require('moment-timezone');

module.exports.set = function(app, passport) {
  app.post('/manage', rendering.getNumOfMem, rendering.getNumOfAttendMem, respond.auth);
  app.post('/account', function(req, res, next) {
    res.render('account_manage');
  });
  /*
    /account/refreshlist
  */
  app.post('/account/refreshlist', account.getAllList, function(req, res, next) {
    if (req.results.err == "0") {
      res.send(req.results);
    }
  });

  /*
    /account/deletelist
  */
  app.post('/account/deletelist', account.deleteUsageList, function(req, res, next) {
    if (req.results.err == "0") {
      res.send('0');
    }
  });

  /*
    /account/modifylist
  */
  app.post('/account/modifylist', account.editUsageList, function(req, res, next) {
    if (req.results.err == "0") {
      res.send('0');
    }
  });
}
