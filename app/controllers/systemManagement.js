/*
  systemManagement

    * Non Protected page (common property except 'auth')


*/
var jwtauth     = require('../middlewares/jwtauth');
var requireAuth = require('../middlewares/requireAuth');
var member      = require('../models/member');
var account     = require('../models/account');
var system      = require('../models/system');
var respond     = require('../helpers/respond');
var express     = require('express');


module.exports.set = function(app, passport) {
  /*
    /system (GET)
  */
  // app.post('/system', function(req, res, next) {
  //   console.log('this is home');
  //   console.log(req.body);
  // }, jwtauth, requireAuth, function(req, res, next) {
  //   respond.auth(req, res);
  // });

  /*
    /system/active-members (POST)

      - send active member list to client
  */
  app.post('/system/active-members', jwtauth, requireAuth, function(req, res, next) {
    member.getMemberList(req, res, next);
      /* req.member contain informations */

  }, function(req, res, next) {
    console.log(req.member);
    var memberList = req.member;
    var retpack = [];
    for (var i = 0; i < memberList.length; i++) {
      if (memberList[i].enterance === "1") {
        retpack.push(memberList[i]); /* push only those of who enter */
      }
    }
    var json = JSON.stringify(retpack);
    res.send(json);
  });

  /*
    /system/add-account-list
  */
  app.post('/system/add-account-list', jwtauth, requireAuth, function(req, res, next) {
    /* first, add list with given data*/
    console.log('this is add list');
    console.log(req.body);
    account.addList(req, res, next);
  }, function(req, res, next) {
    /* if success at inserting db, req.err contains "0" */
    if (req.err !== "0") {
      res.send("0");
      //respond with redirect to err page
    }
    else {
      var retpack = {
        ts      :   req.body.ts,
        content :   req.body.content,
        inout   :   req.body.inout,
        price   :   req.body.price
      }
      var json = JSON.stringify(retpack);
      res.send(json);
    }
  });

  /*
    /system/view-account-list
  */
  app.post('/system/view-account-list', function(req, res, next) {
    console.log('this is view');
    console.log(req.body);
    account.viewList(req, res, next);
  }, function(req, res, next) {
    /*
      Date format error
    */
    if (req.err === "1") {
      return respond.invalid_date_format(req, res);
    }
    respond.get_accountlist_succ(req, res);
  });

  /*
    /system/use-milage
  */
  app.post('/system/use-milage', function(req, res, next) {
    console.log('this is use-milage');
    console.log(req.body);
    system.useMilage(req, res, next);
  }, function(req, res, next) {
    console.log('this is use-milage -- after');
    console.log(req.useMilage.err);

    if (req.useMilage.err === "1") {
      console.log('here');
      return respond.lack_of_milage(req, res);
    }
    else {
      respond.success_at_using_milage(req, res);
    }
  });

  /*
    system/reserve-studyroom
  */
  app.post('/system/studyroom-currentstate', function(req, res, next) {
    console.log('this is studyroom current state');
    console.log(req.body);
    system.studyRoomCurrentState(req, res, next);
  }, function(req, res, next) {
    if (req.err === "1") {
      return respond.invalid_date_format(req, res);
    }
    /* req.reserveState */
    respond.success_at_getting_reserve_state(req, res);
  });

  /*
    system/reserve-studyRoom ()
  */
  app.post('/system/reserve-studyroom', function(req, res, next) {
    console.log(req.body); /*sh, du, rd, rn*/
    system.reserveStudyRoom(req, res, next);
  }, function(req, res, next) {
    console.log(req.reserve);
    if (req.reserve.err === "2") {
      return respond.already_booked(req, res);
    }
    else {
      respond.book_succ(req, res);
    }
  });
}
