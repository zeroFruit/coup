/*
  member

    * About
      this is model of member who is register to this CRM.

    * What this module can do?

      - Add new member to the db
      - Delete member from the db
      - Update member's info
      - Display member list
*/
const config    = require('../helpers/config');

const db        = require('../helpers/db');
const moment         = require('moment');
const moment_tz      = require('moment-timezone');

module.exports = {
  /*
    registerMember
  */
  registerMember: function(req, res, next) {
    db.member.addToList(req.body, function(err, member) {
      if(err) {
        console.log(err);
        return next(err);
      }

      /*
        If succeed in adding to list, 'member' contains member.membername
        If another data is needed, update the db callback params in db.js

        With this req.member, server can check whether query was successful or can be used other things
      */
      req.member = member;
      next();
    });
  },

  /*
    deleteMember
  */
  deleteMember: function(req, res, next) {
    db.member.rmFromList(req.body, function(err, member) {
      if(err)
        console.log(err);
        return next(err);
      /*
        With this req.member, server can check whether query was successful or can be used other things
      */
      req.member = member;
      next();
    });
  },

  /*
    updateMemberInfo
  */
  updateMemberInfo: function(req, res, next) {
    db.member.updateList(req.body, function(err, member) {
      if(err)
        return next(err);
      /*
        With this req.member, server can check whether query was successful or can be used other things
      */
      req.member = member;
      next();
    });
  },

  /*
    getMemberList
  */
  getMemberList: function(req, res, next) {
    db.member.getList(function(err, memberlist) {
      if(err)
        return next(err);
      /*
        If query succeed, req.member contain every member's name, phonenum, payment, milage.
      */
      req.member = memberlist;
      console.log(memberlist);
      next();
    })
  },

  /*
    getMemberInfo
  */
  getMemberInfo: function(req, res, next) {
    db.member.getInfo(req.body, function(err, member) {
      if(err)
        return next(err);
      /*
        With this req.member, server can check whether query was successful or can be used other things
      */
      req.member = member;
      next();
    });
  },

  /*
    Enter - some member trying to take seat, so we need authenticate
  */
  Enter: function(req, res, next) {
    console.log('this is member');
    console.log(req.body);
    db.member.Enter(req.body, function(err, member) {
      if(err)
        return next(err);
      console.log(member);
      req.member = member;
      next();
    });
  },

  /*
    takeSeat - change the enterance mark, and update seat number
  */
  takeSeat: function(req, res, next) {
    console.log('this is takeSeat');
    console.log(req.body); /* req.body contains: seatid, seatnum, alias, paymentid */
    db.member.takeSeat(req.body, function(err, member) {
      if(err)
        return next(err);

      console.log(member);
      req.member = member;
      next();
    });
  },

  /*
    getSeatInfo
  */
  getSeatInfo: function(req, res, next) {
    db.member.getSeatInfo(function(err, seatinfo) {
      if(err)
        return next(err);

      //req.seatinfo = seatinfo;
      /*
        exclude for those who seat number is 0
        this is for render the unavailable seat
      */
      var retarr = [];
      for(var i = 0; i < seatinfo.length; i++) {
        if(seatinfo[i].seat !== "0")
          retarr.push(seatinfo[i]);
      }
      req.seatinfo = retarr;
      next();
    });
  },

  /*
    changeLeaveData
  */
  Leave: function(req, res, next) {
    db.member.Leave(req.body, function(err, result) {
      if (err)
        return next(err);
      req.member = result;
      console.log('this is in leave!');
      console.log(result);
      next();
    })
  },

  /*
    Pause
  */
  Pause: function(req, res, next) {
    db.member.Pause(req.body, function(err, result) {
      if(err) {
        console.log(err);
        return next(err);
      }
      console.log('this is member Pause');
      console.log(result);
      req.member = result;
      next();
    });
  },
  /*
    checkFinish
  */
  checkFinish: function(req, res, next) {
    db.member.checkFinish(req.body, function(err, results) {
      if(err)
        return next(err);

      var retarr = [];
      for (var i = 0; i < results.length; i++) {
        var tsobj = results[i];

        if (tsobj['DATE_FORMAT(fints, "%Y-%m-%d %H:%i:%s")'] !== null) { /* only when fints is not null check the state */
          /* fints Date object */
          var dateObj = new Date(Date.parse(tsobj['DATE_FORMAT(fints, "%Y-%m-%d %H:%i:%s")'].replace('-','/','g')));

          /* current Date object */
          var currObj = new Date(Date.parse(moment().tz('Asia/Tokyo').format('YYYY-MM-DD HH:mm:ss').toString().replace('-','/','g')));
          var diff = dateObj - currObj;

          /* Now we get minutes */
          var minutes = Math.floor((diff/1000)/60);
          console.log(minutes);

          /* Then set the return package */
          var retelt = {};
          if (minutes <= 15) { /* if difference is less then 15 minutes, then server should alert to admin */
            retelt.alias = tsobj.alias;
            retelt.left = minutes;
            retelt.status = "1";
            retelt.seatnum = tsobj.seatnum;
            if (minutes < 0) { /* In the case of time is over, we set alert to 1 */
              retelt.alert = "1";
            }
            else {
              retelt.alert = "0";
            }
            retarr.push(retelt);
          }
        }
      } // end of for loop

      req.alert = retarr;
      console.log(retarr);
      next();
    });
  },

  protectQS: function(req, res, next) {
    db.member.protectQS(req.query, function(err, result) {
      if (err) {
        return next(err);
      }
      else {
        req.dirty = result;
        console.log('this is protectqs');
        console.log(result);
        next();
      }
    });
  }
}
