/*
  auth
*/
var auth      = require('../models/auth');
var rendering = require('../models/renderingPage');
var respond   = require('../helpers/respond');
var express   = require('express');
var Async     = require('async');

module.exports.set = function(app, passport) {
  /*
    / (GET)
  */
  app.get('/', function(req, res, next) {
    var err = req.query.err;
    res.render('login', {err: err});
  });
  /*
    / (POST)
  */
  app.post('/', function(req, res, next) {
    passport.authenticate(
    'local', function(err, user, info) {
      if (err) {
        return next(err);
      }
      if(!user) {
        return res.redirect('/?err='+info.message);
      }
      else {
        var tasks = [
          function(callback){rendering.getNumOfMem(req, res, next);},
          function(callback){rendering.getNumOfAttendMem(req, res, next);},
          function(callback){respond.auth(req, res, next);}
        ];
        Async.series(tasks);
      }
    })(req, res, next);
  }, rendering.getNumOfMem, rendering.getNumOfAttendMem, respond.auth);
}
