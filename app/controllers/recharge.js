/*
  home

    * Non Protected page (common property except 'auth')

    * About
      This is domain page.

*/
var jwtauth     = require('../middlewares/jwtauth');
var requireAuth = require('../middlewares/requireAuth');
var member      = require('../models/member');
var payments    = require('../models/payments');
var account     = require('../models/account');
var rendering   = require('../models/renderingPage');
var respond     = require('../helpers/respond');
var express     = require('express');
var utils       = require('../helpers/utils');

//var memberArr; /* this is member list array for rendering recharge modal */
//var paymentArr;
var retpack = {};

module.exports.set = function(app, passport) {
  /*
    /recharge (POST)
  */
  app.post('/recharge',
  function(req, res, next) {
    console.log('this is recharge');
    console.log(req.body);

    member.getMemberList(req, res, next);
  },
  function(req,res,next) {
    payments.getPaymentList(req, res, next);
  },
  function(req, res, next) {
    var memberList = req.member;
    var paymentList = req.payments;

    //memberArr = [];
    //paymentArr = [];
    retpack.memberArr = [];
    retpack.paymentObj = [];

    console.log(paymentList);
    console.log(memberList.length);
    console.log(retpack);
    for (var i = 0; i < memberList.length; i++) {
      /*
        var lastnum = utils.getLastPhoneNum(memberList[i].phonenum);
      */
      var memp = memberList[i].alias;
      retpack.memberArr.push(memp);
    }
    for (var i = 0; i < paymentList.length; i++) {
      var payp = {
        type: paymentList[i].type,
        timePerDay: paymentList[i].timePerDay,
        price: paymentList[i].price,
        name: paymentList[i].name,
        id: paymentList[i].paymentId
      };
      retpack.paymentObj.push(payp);
    }
      //paymentArr.push(payp);
    console.log(retpack);
    //memberArr.reverse(); /* Now most updated one goes first */

    next();

  }, function(req, res, next) {
    //var retpack = [];
    //retpack.push(memberArr);
    //retpack.push(paymentArr);
    var json = JSON.stringify(retpack);
    res.writeHead(200, {"Content-type": "application/json"});
    return res.end(json);
  });

  /*
    charge - user send the form field
  */
  app.post('/charge', function(req, res, next) {
    /*
      req.body.
    */
    console.log('this is charge');
    console.log(req.body);
    payments.updatePaymentList(req, res, next);
    /*
      req.newMilages have updated milages
    */
  }, function(req, res, next) {
    if (req.payment.err == "1") {
      return respond.still_use_other_payment(req, res);
    }
    else if (req.payment.err == "2") {
      return respond.no_member(req,res);
    }
    /*
      add register info to account db
    */
    req.body.content = req.body.member + ":" + req.body.paymentName;
    req.body.inout = 'true';
    req.body.service = req.body.discount;
    account.addList(req, res, next);
  },
  function(req, res, next) {
    respond.recharge_succ(req, res);
  });
}
