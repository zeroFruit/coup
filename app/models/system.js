/*
  system

    * About
      this is model of system which is managering basic things,
      such as managering stock, payment, milage system and so on.

    * What this module can do?

*/
const config          = require('../helpers/config');

const db              = require('../helpers/db');
const moment          = require('moment');
const moment_tz       = require('moment-timezone');

module.exports = {
  /*
    useMilage
  */
  useMilage: function(req, res, next) {
    db.system.useMilage(req.body, function(err, results) {
      if (err) {
        console.log(err);
        return next(err);
      }
      else {
        req.useMilage = results;
        next();
      }
    });
  },

  /*
    chargeMilage
  */
  chargeMilage: function(req, res, next) {
    db.system.chargeMilage(req.body, function(err, results) {
      if (err) {
        console.log(err);
        return next(err);
      }
      else {
        req.err = results.err;
        next();
      }
    })
  },

  /*
    studyRoomCurrentState
  */
  studyRoomCurrentState: function(req, res, next) {
    /* before query to db validate the date format*/
    var isValid = moment(req.body.reserveDate).isValid();

    if (isValid === false) {
      req.err = "1";
      return next();
    }
    db.system.studyRoomCurrentState(req.body, function(err, results) {
      if (err) {
        return next(err);
      }
      else {
        var retpack = {};
        retpack.room1 = [];
        retpack.room2 = [];
        retpack.room3 = [];
        /*
          Here, we should separate whole results depending on the room number
        */
        for (var i = 0; i < results.length; i++) {
          if (results[i].room === "1") {
            retpack.room1.push(results[i]);
          }
          else if (results[i].room === "2") {
            retpack.room2.push(results[i]);
          }
          else if (results[i].room === "3") {
            retpack.room3.push(results[i]);
          }
        }
        req.reserveState = retpack;
        req.err = "0";
        next();
      }
    });
  },

  /*
    reserveStudyRoom
  */
  reserveStudyRoom: function(req, res, next) {
    db.system.reserveStudyRoom(req.body, function(err, results) {
      if (err) {
        return next();
      }
      else {
        /* req.body.sh, req.body.du, req.body.rd*/
        req.reserve = results;
        next();
      }
    })
  },

  /*
    reserveStudyRoomCancel
  */
  reserveStudyRoomCancel: function(req, res, next) {
    db.system.cancelStudyRoom(req.body, function(err, results) {
      if (err) {
        return next();
      }
      else {
        req.cancel = results;
        next();
      }
    });
  },

  clientStudyRoomState: function(req, res, next) {
    db.system.clientStudyRoomState(req.body, function(err, results) {
      if (err) {
        return next();
      }
      else {
        req.results = results.results;
        req.err = results.err;
        next();
      }
    })
  },

  modifyMemberInfo: function(req, res, next) {
    db.member.modifyMemberInfo(req.body, function(err, results) {
      if (err) {
        return next();
      }
      else {
        /* req.body.sh, req.body.du, req.body.rd*/
        req.err = results.err;
        next();
      }
    })
  },

  deleteMemberInfo: function(req, res, next) {
    db.member.deleteMemberInfo(req.body, function(err, results) {
      if (err) {
        return next();
      }
      else {
        /* req.body.sh, req.body.du, req.body.rd*/
        req.err = results.err;
        next();
      }
    })
  },

  payback: function(req, res, next) {
    db.system.payback(req.body, function(err, results) {
      if (err) {
        return next();
      }
      else {
        req.err = results.err;
        next();
      }
    });
  },

  holdoff: function(req, res, next) {
    db.system.holdoff(req.body, function(err, results) {
      if (err) {
        return next();
      }
      else {
        req.err = results.err;
        req.do  = results.do;
        next();
      }
    });
  },

  vacantSeat: function(req, res, next) {
    db.system.vacantSeat(req.body, function(err, results) {
      if (err) {
        return next();
      }
      else {
        console.log(results);
        req.err = results.err;
        next();
      }
    });
  },

  getPauseTs: function(req, res, alias, member, isfin, cb) { /* isfin, member is just for passing to callback */
    db.system.getPauseTs(alias, function(err, results) {
      if (err) {
        console.log(err);
        return; //next();
      }
      else {
        console.log(results);
        req.err = results.err;
        req.pts = results.pts;
        cb(req.pts, member, isfin);
      }
    });
  }
}
