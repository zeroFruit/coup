/*
  register

    * Protected page (common property except 'auth')
      If you are admin, you can reach here.
      To ensure that only admin can access this page, will include jwtauth.
      This module protect the route; checking token and auth with db

    * About
      This controller process user's data who are trying to register

*/
var jwtauth     = require('../middlewares/jwtauth');
var requireAuth = require('../middlewares/requireAuth');
var member      = require('../models/member');
var rendering   = require('../models/renderingPage');
var respond     = require('../helpers/respond');
var express     = require('express');


module.exports.set = function(app, passport) {
  /*
    /register (POST)
  */
  app.post('/register', jwtauth, requireAuth, member.registerMember,
  rendering.getNumOfMem,
  rendering.getNumOfAttendMem,
  function(req, res, next) {
    /*
      Should error checking
    */
    respond.register_succ(req, res);

  });
}
