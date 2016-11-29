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
  app.post('/register', jwtauth, requireAuth,
  member.registerMember,
  rendering.getNumOfMem,
  rendering.getNumOfAttendMem,
  function(req, res, next) {
    /*
      Should error checking
    */
    if (req.member.err === "1") {
      //phonenum length error
      return respond.phonenum_length_err(req, res);
    }
    else if (req.member.err === "2") {
      //phone number is not number
      return respond.phonenum_length_err(req, res);
    }
    else if (req.member.err === "3") {
      return respond.password_length_err(req, res);
    }
    else {
      respond.register_succ(req, res);
    }
  });
}
