/*
  jwtauth

  This is middleware for parsing a JWT token attached to the request.
  If the token is valid, the corresponding user will be attached to the request.

  function(req, res, next, passport)

    - every parameters will given from route including 'passport'

*/
const respond = require('../helpers/respond');
const config  = require('../helpers/config');
const auth    = require('../models/auth');
const url     = require('url');
const jwt     = require('jwt-simple');
const Promise = require('promise');

module.exports = function(req, res, next) {
  /* Parse the URL */
  var parsed_url = url.parse(req.url, true);
  /*
    Take the token from

      1. the POST value accessToken
      2. the GET parameter accessToken
      3. the x-accessToken header
  */
  var _accessToken = (req.body && req.body.accessToken) || parsed_url.query.accessToken || req.headers['x-access-token'];
  var _refreshToken = (req.body && req.body.refreshToken) || parsed_url.query.refreshToken || req.headers['x-refresh-token'];



  if(_accessToken && _refreshToken) {
    var decoded = jwt.decode(_accessToken, config.jwtTokenSecret);
    if(decoded.exp <= Date.now()) {
      /*
        This is access-token-expired state
        We should check refreshToken whether this is valid user
        if not, can not access this route.
      */
      respond.expired(req, res);
    }
    console.log(_accessToken);
    console.log('\n');
    console.log(_refreshToken);
    console.log('\n');
    /* at this point 'req.token' is 'null' */
    req.token = {};
    req.token.refreshToken = _refreshToken; /* To match the params */
    //req.token.refreshToken = _refreshToken;
    auth.validateAccessToken(req, res, next);
    /*
      This is standard access situation - Now req.user exist
    */
  }
  else {
    /*
      if there's no token

        later, there's no req.user so deal with that situation.
    */
    respond.unAuthorized(req, res);
  }
}
