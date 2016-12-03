/*
  Advertise

    * Non Protected page (common property except 'auth')


*/
var jwtauth     = require('../middlewares/jwtauth');
var requireAuth = require('../middlewares/requireAuth');
var member      = require('../models/member');
var account     = require('../models/account');
var system      = require('../models/system');
var payment     = require('../models/payments');
var respond     = require('../helpers/respond');
var express     = require('express');


module.exports.set = function(app, passport) {
  app.get('/ad', function(req, res, next) {
    member.getSeatInfo(req, res, next);
  }, function(req, res, next) {
    var json = JSON.stringify(req.seatinfo);
    res.render('ad',
    {
      seatinfo: json
    });
  });
}
