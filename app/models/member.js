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
      //req.err    = member.err;
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
      req.member = member.result;
      req.err    = member.err;
      next();
    });
  },

  /*
    Enter - some member trying to take seat, so we need authenticate
  */
  Enter: function(req, res, next) {
    console.log('this is member');
    db.member.Enter(req.body, function(err, member) {
      if(err)
        return next(err);
      req.member = member;
      next();
    });
  },

  /*
    takeSeat - change the enterance mark, and update seat number
  */
  takeSeat: function(req, res, next) {
    console.log('this is takeSeat');
    db.member.takeSeat(req.body, function(err, member) {
      if(err)
        return next(err);

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
    seatChange
  */
  seatChange: function(req, res, next) {
    db.member.seatChange(req.body, function(err, results) {
      if (err) {
        return next(err);
      }
      else {
        console.log('this is results ');
        console.log(results);
        req.results = results;
        next();
      }
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

        /*
          free user don't go through here
        */
        if (tsobj['DATE_FORMAT(fints, "%Y-%m-%d %H:%i:%s")'] !== null) { /* only when fints is not null check the state */
          /* fints Date object */
          var dateObj = new Date(Date.parse(tsobj['DATE_FORMAT(fints, "%Y-%m-%d %H:%i:%s")'].replace('-','/','g')));

          /* current Date object */
          var currObj = new Date(Date.parse(moment().tz('Asia/Tokyo').format('YYYY-MM-DD HH:mm:ss').toString().replace('-','/','g')));
          var diff = dateObj - currObj;

          /* Now we get minutes */
          var minutes = Math.floor((diff/1000)/60);

          /* Then set the return package */
          var retelt = {};
          if (minutes <= 15) { /* if difference is less then 15 minutes, then server should alert to admin */
            retelt.alias = tsobj.alias;
            retelt.left = minutes;
            retelt.status = "1";
            retelt.seatnum = tsobj.seatnum;
            if (minutes < 0) { /* In the case of time is over, we set alert to 1 */
              retelt.alert = "1";
              /* change overtime as fee */
              var hour = parseInt(minutes / 60);
              var over = minutes % 60;
              if (over > 10) {
                hour = hour + 1;
              }
              retelt.fee = hour * 800;
            }
            else {
              retelt.alert = "0";
              retelt.fee = 0;
            }
            retarr.push(retelt);
          }
        }
      } // end of for loop

      req.alert = retarr;
      next();
    });
  },

  checkPause: function(req, res, next) {
    db.member.checkPause(function(err, results) {
      if (err) {
        return next(err);
      }
      else {
        req.err = results.err;
        next();
      }
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
        next();
      }
    });
  }
}
