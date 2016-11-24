/*
  home

    * Protected page (common property except 'auth')
      If you are admin, you can reach here.
      To ensure that only admin can access this page, will include jwtauth.
      This module protect the route; checking token and auth with db

    * About
      This is domain page.

*/
var jwtauth     = require('../middlewares/jwtauth');
var requireAuth = require('../middlewares/requireAuth');
var auth        = require('../models/auth'); //< this may not needed
var respond     = require('../helpers/respond');
var express     = require('express');


module.exports.set = function(app, passport) {
  /*
    /home (GET)
  */
  app.post('/home', function(req, res, next) {
    console.log('this is home');
    console.log(req.body);
  }, jwtauth, requireAuth, function(req, res, next) {
    respond.auth(req, res);
  });
}
