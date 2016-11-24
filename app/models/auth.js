/*
  auth

    * About
      This module basically in charge of every authentication.
      With db authenticate the admin, initialize passport, token validation/generation

    * What this module can do?
      ...
*/
const config    = require('../helpers/config');
const JWT_TOKEN_SECRET = config.jwtTokenSecret;

const db        = require('../helpers/db');
const passport  = require('passport');
const Strategy  = require('passport-local');
const jwt       = require('jwt-simple');
const crypto    = require('crypto');
const moment    = require('moment');

module.exports = {
  /*
    passport initialize
  */
  passportInit: function(app) {
    app.use(passport.initialize());
    /*
      passport local strategy
    */
    passport.use(new Strategy(
      function(username, password, done) {
        db.user.authenticate(username, password, done);
      }
    ));

    return passport;
  },

  /*
    serializeUser
  */
  serializeUser: function(req, res, next) {
    db.user.updateOrCreate(req.user, function(err, user) {
      if(err)
        return next(err);
      /*
        we can store the updated information in req.user
        or contains just necessary information. if you need modify this.

        req.user = { ... };
      */
      next(); // this is necessary for going back to next cb
    });
  },

  /*
    serializeClient
  */
  serializeClient: function(req, res, next) {
    //console.log('this is in the auth model: '+ req.user);
    db.client.updateOrCreate({ user: req.user }, function(err, client) {
      if(err)
        return next(err);
      /*
        If needed, we store information in req.user

        req.user.clientid = client.id;
      */
      next();
    });
  },

  /*
    validateAccessToken

      Actually functionality is same as 'validateRefreshToken' function
      Just to clarify the meaning, there's another function with same functionality

      * Caution

        db.client.findUserOfToken looking for clients table and check whether there exist refreshToken
        In this case accessToken is just for checking the expiration

  */
  validateAccessToken: function(req, res, next) {
    // test
    console.log(req.token);
    db.client.findUserOfToken(req.token, function(err, user) {
      if(err)
        return next(err);
      req.user = user;
      next();
    });
  },

  /*
    validateRefreshToken
  */
  validateRefreshToken: function(req, res, next) {
    db.client.findUserOfToken(req.token, function(err, user) {
      if(err)
        return next(err);
      req.user = user;
      next();
    });
  },

  /*
    rejectToken
  */
  rejectToken: function(req, res, next) {
    db.client.rejectToken(req.body, next);
  },

  /*
    generateAccessToken
  */
  generateAccessToken: function(req, res, next) {
    var expires = moment().add(1, 'days').valueOf();
    var token   = jwt.encode({
      iss: req.user.username,
      exp: expires
    }, JWT_TOKEN_SECRET);
    req.token = req.token || {};
    req.token.accessToken = token;
    req.token.expires     = expires;

    next();
  },

  /*
    generateRefreshToken

      There can be more option. we can add 'permanent' flag. If that flag sets to 'false' in the url.
      no client or refresh token will be created and the session ends once the access token turns invalid.

  */
  generateRefreshToken: function(req, res, next) {
    req.token.refreshToken
      = req.user.username.toString() + ':' + crypto.randomBytes(40).toString('hex');
    db.client.storeToken({
      refreshToken: req.token.refreshToken,
      username: req.user.username
    }, next);
  }
}
