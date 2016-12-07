/*
  systemManagement

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
var Async       = require('async');
var moment      = require('moment');
var moment_tz   = require('moment-timezone');

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
    /system/vacant-seat
  */
  app.post('/system/vacant-seat', function(req, res, next) {
    system.vacantSeat(req, res, next);
  }, function(req, res, next) {
    console.log(req.err);
    if (req.err == "0") {
      respond.vacant_seat(req, res);
    }
  });
  /*
    /system/modify-member-info
  */
  app.post('/system/modify-member-info', function(req, res, next) {
    system.modifyMemberInfo(req, res, next);
  }, function(req, res, next) {
    if (req.err === "0") {
      respond.modify_memberinfo_succ(req, res);
    }
  });
  /*
    /system/delete-member-info
  */
  app.post('/system/delete-member-info', function(req, res, next) {
    system.deleteMemberInfo(req, res, next);
  }, function(req, res, next) {
    if (req.err === "0") {
      respond.delete_memberinfo_succ(req, res);
    }
  });
  /*
    /system/all-members (POST)

      - send all member info to client
  */
  app.post('/system/all-members', jwtauth, requireAuth, function(req, res, next) {
    member.getMemberList(req, res, next);
  }, function(req, res, next) {
    var memberList = req.member;
    var pidArr = [];
    for (var i = 0; i < memberList.length; i++) {
      var me = memberList[i];
      pidArr.push(me.payment);
      if (me.memo === null) {
        me.memo = "-";
      }
      if (me.prepare === null) {
        me.prepare = "-";
      }
    }
    payment.paymentId2Name(req, pidArr, function(results) {
      var retpack = {};
      console.log(req.member);
      console.log(results);
      retpack.memberList = req.member;
      retpack.pnameList = results;

      var json = JSON.stringify(retpack);
      res.send(json);
    }); /* now req.pnList contains name of payment list*/
  });

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
    req.retpack = []; /* make array in req for passing array to final callback */
    req.pmember = []; /* for those of who paused, they process next callback*/
    for (var i = 0; i < memberList.length; i++) {
      /*
        only contains those of who enterance == 1
      */
      if (memberList[i].enterance === "1") {
        var tmp = memberList[i];

        /*
          for those of who enter, there need different information

            - if not paused : we need [ts, lts (last time stamp), payment, used mins]
            - if paused :     we need [ts, paused ts, payment, used mins]
        */

        if (tmp.pause == '0') { /* if user not pause just display usedMin, fints, entts*/
          payment.id2NameSingle(tmp.payment, function(pname) {
            /*
              update payment id to payment name
            */
            tmp.payment = pname;

            console.log(tmp);
            var finTsStr    = tmp['DATE_FORMAT(fints, "%Y-%m-%d %H:%i")'];
            var oldTsStr    = tmp['DATE_FORMAT(ts, "%Y-%m-%d %H:%i")'];
            var currTsStr   = moment().tz('Asia/Tokyo').format('YYYY-MM-DD HH:mm').toString();

            /*
              get Date Object from String
            */
            var oldTsDate = new Date(Date.parse(oldTsStr.replace('-','/','g')));
            var curTsDate = new Date(Date.parse(currTsStr.replace('-','/','g')));

            var diff = curTsDate - oldTsDate;
            console.log(finTsStr);
            console.log(oldTsStr);
            console.log(diff);
            /*
              FINALLY get the diff mins
            */
            var minutes = Math.floor((diff/1000)/60);
            if (minutes < 0) {
              minutes = minutes + 1440;
            }
            tmp.usedMin = minutes;
            if (finTsStr == null ) {
              tmp.lts = '-';
            }
            else {
              tmp.lts = finTsStr;
            }
          });

          req.retpack.push(tmp);
        }

        else if(tmp.pause == '1') { /* if member in pause state */
          req.pmember.push(tmp);

        }
      }
    }
    next();
  }, function(req, res, next) { /* in this cb, process payment name for those of who paused */
    var pMember = req.pmember;
    var idList = [];

    /*
      if there's no paused member just pass
    */
    if (pMember.length == 0) {
      return next();
    }

    for (var i = 0; i < pMember.length; i++) {
      idList.push(pMember[i].payment);
    }
    payment.paymentId2Name(req, idList, function(nmList) {
      for (var i = 0; i < pMember.length; i++) {
        pMember[i].payment = nmList[i];
      }
      req.pmember = pMember;
      next();
    });

  }, function(req, res, next) {
    var pMember = req.pmember;

    /*
      if there's no paused member just pass
    */
    if (pMember.length == 0) {
      return next();
    }

    for (var i = 0; i < pMember.length; i++) {
      var pm = pMember[i];

      system.getPauseTs(req, res, pm.alias, pm, i, function(pts, member, isfin) {
        console.log(pts);
        if (pts == null) { /* which means there's no pause member */
          return next();
        }
        if (req.err == "1") {
          console.log('query result is not 1');
          return res.send('1');
        }
        else {
          var oldTsStr    = member['DATE_FORMAT(ts, "%Y-%m-%d %H:%i")'];
          var pTsStr      = pts;  /* this is paused time : querying result from pause_table */
          /*
            get Date Object from String
          */
          var oldTsDate = new Date(Date.parse(oldTsStr.replace('-','/','g')));
          var curTsDate = new Date(Date.parse(pTsStr.replace('-','/','g')));
          var diff = curTsDate - oldTsDate;
          /*
            FINALLY get the diff mins
          */
          var minutes = Math.floor((diff/1000)/60);
          member.usedMin = minutes;
          member.lts     = pTsStr;

          /* add to retpack */
          req.retpack.push(member);
          /* determine when to jump next cb */
          if (isfin == pMember.length-1) {

            return next();
          }
        }
      });

    }
  }, function(req, res) {
    /*
      now finally retpack contains all members
    */
    var json = JSON.stringify(req.retpack);
    res.send(json);
  });

  /*
    /system/history
  */
  app.post('/system/history', function(req, res, next) {
    system.getHistroy(req, res, next);
  }, function(req, res, next) {
    if (req.err == "0") {
      res.send(req.history);
    }
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
        price   :   req.body.price,
        service :   req.body.service
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
    /system/modify-account-list
  */
  app.post('/system/modify-account-list', function(req, res, next) {
    console.log('this is modify list');
    console.log(req.body);

    account.modifyList(req, res, next);
  }, function(req, res, next) {
    console.log('modify route');
    console.log(req.err);
    if (req.err === "1") {
      return respond.err_ep(req, res);
    }
    respond.accountlist_update_succ(req, res);
  });

  /*
    /system/delete-account-list
  */
  app.post('/system/delete-account-list', function(req, res, next) {
    console.log('this is delete account list');
    console.log(req.body);

    account.deleteList(req, res, next);
  }, function(req, res, next) {
    if (req.err === "0") {
      respond.accountlist_delete_succ(req, res);
    }
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
    /system/charge-milage
  */
  app.post('/system/charge-milage', function(req, res, next) {
    console.log('this is charge-milage');
    console.log(req.body);
    system.chargeMilage(req, res, next);
  }, function(req, res, next) {
    if (req.err === "0") {
      return respond.success_at_charge_milage(req, res);
    }
    else if (req.err === "1") {
      // alias format err
      return respond.alias_format_err(req, res);
    }
    else if (req.err === "2") {
      // milage format err
      return respond.milage_format_err(req, res);
    }
    else if (req.err ==="3") {
      return respond.member_dont_exist(req, res);
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
    else if (req.reserve.err === "3") {
      return respond.incorrect_booking(req, res);
    }
    else {
      respond.book_succ(req, res);
    }
  });

  /*
    /system/reserve-studyroom-cancel
  */
  app.post('/system/reserve-studyroom-cancel', function(req, res, next) {
    console.log(req.body);
    system.reserveStudyRoomCancel(req, res, next);
  }, function(req, res, next) {
    console.log(req.cancel);
    if (req.cancel.err == "1") {
      /* there's no matching reservation */
      return respond.book_cancel(req, res);
    }
    else if(req.cancel.err == "0") {
      return respond.book_cancel(req, res);
    }
  });

  /*
    Payback
  */
  app.post('/system/payback', function(req, res, next) {
    console.log(req.body);
    member.getMemberInfo(req, res, next);
  }, function(req, res, next) {
    var pid = req.member.payment;
    payment.id2NameSingle(pid, function(pname) {
      console.log(pname);
      req.member.payment = pname;
      next();
    });
  },function(req, res, next) {
    if (req.err === "1") {
      return respond.member_dont_exist(req, res);
    }
    else {
      respond.get_memberinfo_succ(req, res);
    }
  });
  /*
    /system/payback-determine
  */
  app.post('/system/payback-determine', function(req, res, next) {
    console.log(req.body);
    system.payback(req, res, next);
  }, function(req, res, next) {
    if (req.err === "0") {
      respond.payback_succ(req, res);
    }
  });

  /*
    /system/defer
  */
  app.post('/system/holdoff', function(req, res, next) {
    console.log(req.body);
    member.getMemberInfo(req, res, next);
  }, function(req, res, next) {
    var pid = req.member.payment;
    payment.id2NameSingle(pid, function(pname) {
      console.log(pname);
      req.member.payment = pname;
      next();
    });
  }, function(req, res, next) {
    if (req.err === "1") {
      return respond.member_dont_exist(req, res);
    }
    else {
      respond.get_memberinfo_succ(req, res);
    }
  });
  /*
    /system/holdoff-determine
  */
  app.post('/system/holdoff-determine', function(req, res, next) {
    console.log(req.body);
    system.holdoff(req, res, next);
  }, function(req, res, next) {
    if (req.err == "0") {
      respond.hold_on_off(req, res);
    }
  });
}
