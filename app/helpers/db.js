import {
  milage2min
} from './milage_time_convertor';
import {
  isNight,
  isNightWithParam,
  getEndDateTimeString,
  getCurrentDateTimeString,
  getCurrentDateTimeStringWithZero,
  getNextDayDateTimeString,
  getMinuteWithStringDateTime,
  getAfterMinutesDateTimeString
} from './date';
import {
  shouldAccumlateBreak,
  nightPolicy,
  prepayUserCase,
  freeUserCase,
  UserWhichHasTimeLimitExceptPrepayCase,
  UserWhichHasTimeLimitCase,
  UserWhichHasNoTimeLimitCase
} from './flag';
import {
  getFeeFromMinutes
} from './fee';

const moment         = require('moment');
const moment_tz      = require('moment-timezone');
const pbkdf2Password = require('pbkdf2-password');
const hasher         = pbkdf2Password();
const mysql          = require('mysql');
const conn           = mysql.createConnection({
  host      : 'localhost',
  user      : 'root',
  password  : '111111',
  database  : 'crm'
});
conn.connect();

module.exports = {
  /*
    Connection, end

      connect to database or close the connection
  */
  //connection: function() {
    //conn.connect();
    //return conn;
  //},
  end: function() {
    conn.end();
  },
  /*
    Authentication

      user
        basically do two things. This is about our members
        1. After register, update the db
        2. When someone trying to login, check whether that guy is our member.

      client
        This is about who is currently accessing our website


      function:cb()
        this is callback function which is passed from passport

  */
  user: {
    chgAdminInfo: function(data, cb) {
      var username = data.username;
      var password = data.password;

      hasher({password: password}, function(err, pass, salt, hash) {
        var sql = 'UPDATE users SET hash=?, salt=?, username=? where id=1';
        conn.query(sql, [hash, salt, username], function(err, results) {
          if (err) {
            console.log(err);
            return cb(err);
          }
          else {
            cb(null, {err: "0"});
          }
        });
      });
    },
    /*
      updateOrCreate - exactly same as original passport serilizeUser function

        At this moment thiere's only one user 'admin'
    */
    updateOrCreate: function(user, cb) {
      cb(null, user);
    },

    /*
      authenticate - find user and verify password
    */
    authenticate: function(username, password, cb) {
      /*
      hashing should be done at register step */
      var sql = "SELECT * FROM users WHERE username='"+username+"'";
      conn.query(sql, function(err, results) {
        if(err) {
          console.log('query error');
          return cb(null, false);
        }
        if (results.length == 0) {
          return cb(null, false, {message: '0'});
        }
        else {
          var user = results[0]; /* query success */
          if (!user.hasOwnProperty('salt')) {
            return cb(null, false, {message: '1'});
          }
          return hasher({password:password, salt:user.salt}, function(err, pass, salt, hash) {
            if(hash === user.hash) {
              cb(null, user);
            }
            else {
              cb(null, false, {message: '1'});
            }
          });
        }
      });
    }
  }, /* end of user */

  client: {
    /*
      updateOrCreate

        To handle multiple user, we need an identifier for each logged in client.
        After authentication of the user, we create a new client on each login.
    */
    updateOrCreate: function(data, cb) {
      var client = {
        username: data.user.username
      };
      var sql = "INSERT INTO clients (username) VALUES ('"+client.username+"');";
      conn.query(sql, client, function(err, results) {
        if(err) {
          console.log(err);
          cb(new Error('not found'));
          res.status(500);
        }
        else {
          console.log('client-updateOrCreate');
          cb(null, {username: data.user.username});
        }
      });
    },

    /*
      storeToken
    */
    storeToken: function(data, cb) {
      var sql = 'UPDATE clients SET refreshToken=? WHERE username=?';
      conn.query(sql, [data.refreshToken, data.username], function(err, results) {
        if(err) {
          console.log('query error');
          console.log(err);
          cb(new Error('not found'));
          res.status(500);
        }
        else cb();
      });
    },

    /*
      findUserOfToken
    */
    findUserOfToken: function(data, cb) {
      console.log('this is find User of Token');
      console.log(data);
      if(!data.refreshToken)
        return cb(new Error('invalid token'));
      var sql = "SELECT username FROM clients WHERE refreshToken='"+ data.refreshToken +"'";

      conn.query(sql, function(err, results) {
        if(err) {
          console.log(err);
          cb(err);
        }
        else {
          console.log('findUserOfToken');
          console.log(results[300]);
          return cb(null, { username: results[300].username });
        }
      });
    },

    /*
      rejectToken
    */
    rejectToken: function(data, cb) {
      var sql = "UPDATE clients SET refreshToken="+NULL+" WHERE username=?;";
      conn.query(sql, [data.username], function(err, results) {
        if(err) {
          console.log(err);
          cb(new Error('not found'));
          res.status(500);
        }
        else return cb();
      });
    }
  }, /* end of clients */

  member: {
    /*
      addToList

        * FIX : handling error caused by too long data
    */
    addToList: function(data, cb) {


      /*
        sex
      */
      var sex;
      if (data.sex) sex = 1;
      else sex = 0;

      /*
        We should first check data validation
      */
      var phonenum = data.phonenum;
      if (phonenum.length != 11) { /* phonenum length err */
        return cb(null, {err: "1"});
      }
      else if (!Number.isInteger(parseInt(phonenum))) { /* is not number */
        return cb(null, {err: "2"});
      }
      else if(data.password.length !== 6) {
        console.log('password length: ' + data.password.length);
        return cb(null, {err: "3"});
      }
      else {
        var alias = phonenum.substring(3);
        var sql = 'SELECT membername FROM members WHERE alias=?';
        conn.query(sql, [alias], function(err, results) {
          if (err) {
            console.log(err);
            cb(new Error('query error'));
          }
          else {
            if (results.length != 0) {
              cb(null, {err: "4"});
            }
            else {
              var sql
                = "INSERT INTO members (membername, password, phonenum, alias, sex, memo, prepare) VALUES (?, ?, ?, ?, ?, ?, ?)";
              conn.query(sql, [data.membername, data.password, data.phonenum,  alias, sex, data.memo, data.prepare], function(err, results) {
                if(err) {
                  console.log(err);
                  cb(new Error('not found'));
                  //res.status(500); //< this should replace with respond.js
                }
                else {
                  cb(null, { membername: data.membername, err: "0" });
                  /* to notify to user that query has succeed send them 'membername'. With this info server can verify results */
                }
              });
            }
          }
        });
      }
    },

    /*
      rmFromList - To remove specific member from the list, needs to know membername and password
    */
    rmFromList: function(data, cb) {
      var sql = 'DELETE FROM members WHERE membername=? AND password=?';
      conn.query(sql, [data.membername, data.password], function(err, results) {
        if(err) {
          console.log(err);
          cb(new Error('query error'));
        }
        else {
          if(results.affectedRows === 0) {
            cb(new Error('affected row is 0'));
          }
          else {
            cb(null, { membername: data.membername });
          }
        }
      });
    },

    /*
      updateList - assume that member name is fixed, every other data can be update.

        updated data comes from outside
    */
    updateList: function(data, cb) {
      var sql
        = 'UPDATE members SET password=?, phonenum=?, payment=?, memo=?, alias=? WHERE membername=?';
      var getAliasName = data.member.split("-");
      var Alias = getAliasName[1];
      var Membername = getAliasName[0];
      conn.query(sql, [data.password, data.phonenum, data.payment, data.memo, Membername, Alias],
        function(err, results) {
          if(err) {
            console.log(err);
            cb(new Error('query error'));
          }
          else {
            cb(null, {membername: Membername/* there can be other info to notify to member */});
          }
        });
    },

    /*
      displayList

        return member's

          -name, phone number, payment, milage, seat
    */
    getList: function(cb) {
      var sql = 'SELECT membername, payment, milage, seatnum, alias, pause, enterance, sex, memo, leftDay, break, prepare, DATE_FORMAT(ts, "%Y-%m-%d %H:%i"), DATE_FORMAT(fints, "%Y-%m-%d %H:%i") FROM members';
      conn.query(sql, function(err, results) {
        if (err) {
          console.log(err);
          cb(new Error('query error'));
        }
        else {
          cb(null, results); /* take all the results */
        }
      });
    },

    /*
      getInfo
    */
    getInfo: function(data, cb) {

      var sql
        = 'SELECT * FROM members WHERE  alias=?'; /* add seat num */
      conn.query(sql, [data.alias, data.phonenum], function(err, results) {
        if(err) {
          console.log(err);
          return cb(new Error('query error'));
        }
        else if (results.length == 0) {
          return cb(null, {err: "1"});
        }
        else {
          cb(null, {result: results[0], err: "0"}); /* return every info of querying member, if take care of security, select some of them */
        }
      });
    },

    /*
      getNum
    */
    getNum: function(cb) {
      var sql = 'SELECT COUNT(*) FROM members';
      conn.query(sql, function(err, results) {
        if (err) {
          cb(new Error('query error'));
        }
        else {
          cb(null, results[0]);
        }
      });
    },

    /*
      getActiveNum
    */
    getActiveNum: function(cb) {
      var sql = "SELECT COUNT(*) FROM members WHERE enterance='1'";
      conn.query(sql, function(err, results) {
        if (err) {
          cb(new Error('query error'));
        }
        else {
          cb(null, results[0]);
        }
      });
    },
    /*
      Enter
    */
    Enter: function(data, cb) {
      /* Before change the enterance mark first compare the id and pwd */
      var sql = 'SELECT * FROM members WHERE alias=?'; /* first check the existence of member*/
      conn.query(sql, [data.ecid], function(err, results) {
        if(err) {
          console.log(err);
          cb(new Error('query error'));
        }
        if (results.length === 0) {
          /* It means there's no matching member */
          console.log('none results error');
          return cb(null, {err: "1"});
        }
        else {
          if (results[0].password !== data.ecpwd) {
            return cb(null, {err: "2"});
          }
          /* this IF is executed if member who tries to enter is unregistered */
          else if (results[0].payment === null) {
            return cb(null, {err: "3"});
          }
          /* check if already entered */
          else if (results[0].enterance === "1") {
            return cb(null, {err: "4"});
          }
          else if (results[0].leftDay === 0 && results[0].payment != "14" && results[0].payment != "0") { // free user can access
            return cb(null, {err: "5"});
          }
          /* stop member should not come here */
          else if(results[0].stop === 1) {
            return cb(null, {err: "6"});
          }
          /* if user who is prepay member dont have milage than abort */
          else if(results[0].payment === '0' && results[0].milage <= 0) {
            return cb(null, {err: "7"});
          }
          else {
            /*
              Before enter we need to check whether time is over 12:00 PM
            */
            var night = isNight();

            /* set flag */
            var {ts, pause, enterance, milage, membername} = results[0];
            var accumlateBreak = shouldAccumlateBreak(ts, pause, enterance);

            if(prepayUserCase(results[0].payment)) { // if prepay user trying to enter, than change milage to left time
              results[0].leftTime = milage2min(milage);
            }
            cb(null,
              {
                err: "0",
                alias: data.ecid,
                do: "enter",
                paymentid: results[0].payment,
                leftTime: results[0].leftTime.toString(),
                membername,
                accumlateBreak,
                night
              });
          }
        }
      });
    },
    /*
      takeSeat
    */
    takeSeat: function(data, cb) {

      console.log('this is takeSeat');
      console.log(data);
      /*
        data.paymentid
      */
      var {paymentid, leftTime, seatid, seatnum, floorid, alias} = data;
      var membername      = data.mn;
      var night           = data.n;  // if 1, this is night mode
      var accumlateBreak  = data.ab;     // this is for checking pause then leaving member

      console.log('accumlateBreak', accumlateBreak);
      /*
        after 12:00 PM, change payment policy, except free user
        But reject for those who pause leave members
      */
      if (night === '1' && accumlateBreak === 'false') {
        console.log('this is for night user');
        var sql = 'UPDATE members SET enterance=?, seat=?, seatnum=?, seat_floor=?, ts=STR_TO_DATE("'+getCurrentDateTimeString()+'", "%Y-%m-%d %H:%i:%s"), fints=STR_TO_DATE(?, "%Y-%m-%d %H:%i:%s") WHERE alias=?';
        conn.query(sql, ["1", seatid, seatnum, floorid, getEndDateTimeString(), alias], function(err, results) {
          if(err) {
            console.log(err);
            cb(new Error("query error"));
          }
          else {
            /*
              now update history of this user
            */
            var sql = 'INSERT INTO history (ts, job, alias, seatnum, membername) VALUES (DATE_FORMAT("'+getCurrentDateTimeString()+'", "%Y-%m-%d %H:%i:%s"), 0, ?, ?, ?)';
            conn.query(sql, [alias, seatnum, membername], function(err, results) {
              if (err) {
                console.log(err);
                cb(new Error('query error'));
              }
              else {
                cb(null, {success: '1'});
              }
            });
          }
        });
      }
      else {/* this is before 12:00 PM */
        /* free user */
        if (freeUserCase(paymentid)) {
          console.log('2');
          var sql = 'UPDATE members SET enterance=?, seat=?, seatnum=?, seat_floor=?, ts=STR_TO_DATE("'+getCurrentDateTimeString()+'", "%Y-%m-%d %H:%i:%s") WHERE alias=?';
          conn.query(sql, ["1", seatid, seatnum, floorid, alias], function(err, results) {
            if (err) {
              console.log(err);
              cb(new Error('query error'));
            }
            else {
              /*
                now update history of this user
              */
              var sql = 'INSERT INTO history (ts, job, alias, seatnum, membername) VALUES (DATE_FORMAT("'+getCurrentDateTimeString()+'", "%Y-%m-%d %H:%i:%s"), 0, ?, ?, ?)';
              conn.query(sql, [data.alias, data.seatnum, membername], function(err, results) {
                if (err) {
                  console.log(err);
                  cb(new Error('query error'));
                }
                else {
                  cb(null, {success: '1'});
                }
              });
            }
          });
        }
        /* this need to set fints */
        if (UserWhichHasTimeLimitCase(paymentid)) {
          console.log('3');
          if (accumlateBreak === 'true') {
            /* do not init ts
              and update break as CURTIME - PTS min
            */
            console.log('accumlateBreak true');

            var sql = 'SELECT DATE_FORMAT(pts, "%Y-%m-%d %H:%i:%s") FROM members WHERE alias=?';
            conn.query(sql, [alias], function(err, results) {
              if (err) {
                console.log(err);
                cb(new Error('query error'));
              }
              else {
                console.log('accumlateBreak true');
                var pts = results[0]['DATE_FORMAT(pts, "%Y-%m-%d %H:%i:%s")'];
                var breaks = getMinuteWithStringDateTime(getCurrentDateTimeString(), pts);

                var sql = 'UPDATE members SET enterance=?, seat=?, seatnum=?, seat_floor=?, break=break+? WHERE alias=?';
                conn.query(sql, ["1", seatid, seatnum, floorid, breaks, alias], function(err, results) {
                  if (err) {
                    console.log(err);
                    cb(new Error('query error'));
                  }
                  else {
                    var sql = 'INSERT INTO history (ts, job, alias, seatnum, membername) VALUES (DATE_FORMAT("'+getCurrentDateTimeString()+'", "%Y-%m-%d %H:%i:%s"), 0, ?, ?, ?)';
                    conn.query(sql, [alias, seatnum, membername], function(err, results) {
                      if (err) {
                        console.log(err);
                        cb(new Error('query error'));
                      }
                      else {
                        cb(null, {success: '1'});
                      }
                    });
                  }
                });
              }
            });
          }
          else {
            console.log('seat, seatnum, floor', seatid, seatnum, floorid);
            console.log('accumlateBreak false, user has time limit case');

            var fints = getAfterMinutesDateTimeString(parseInt(leftTime));

            if (isNightWithParam(getAfterMinutesDateTimeString(parseInt(leftTime))) === 1) {
              fints = getNextDayDateTimeString();
            }
            var sql = 'UPDATE members SET enterance=?, seat=?, seatnum=?, seat_floor=?, ts=STR_TO_DATE("'+getCurrentDateTimeString()+'", "%Y-%m-%d %H:%i:%s"), fints=STR_TO_DATE("'+fints+'", "%Y-%m-%d %H:%i:%s") WHERE alias=?';
            conn.query(sql, ["1", seatid, seatnum, floorid, alias], function(err, results) {
              if(err) {
                console.log(err);
                cb(new Error("query error"));
              }
              else {
                var sql = 'INSERT INTO history (ts, job, alias, seatnum, membername) VALUES (DATE_FORMAT("'+getCurrentDateTimeString()+'", "%Y-%m-%d %H:%i:%s"), 0, ?, ?, ?)';
                conn.query(sql, [alias, seatnum, membername], function(err, results) {
                  if (err) {
                    console.log(err);
                    cb(new Error('query error'));
                  }
                  else {
                    cb(null, {success: '1'});
                  }
                });
              }
            });
          }
        }
        /* this don't need to set fints => but need to set limit 00:00 AM */
        else if (UserWhichHasNoTimeLimitCase(paymentid)) {
          console.log('4');
          if (accumlateBreak === 'true') {
            /* do not init ts
              and update break as CURTIME - PTS min
            */
            var sql = 'SELECT DATE_FORMAT(pts, "%Y-%m-%d %H:%i:%s") FROM members WHERE alias=?';
            conn.query(sql, [data.alias], function(err, results) {
              if (err) {
                console.log(err);
                cb(new Error('query error'));
              }
              else {
                console.log('ab true');
                var pts = results[0]['DATE_FORMAT(pts, "%Y-%m-%d %H:%i:%s")'];
                var breaks = getMinuteWithStringDateTime(getCurrentDateTimeString(), pts);

                var sql = 'UPDATE members SET enterance=?, seat=?, seatnum=?, seat_floor=?, break=break+? WHERE alias=?';
                conn.query(sql, ["1", seatid, seatnum, floorid, breaks, alias], function(err, results) {
                  if (err) {
                    console.log(err);
                    cb(new Error('query error'));
                  }
                  else {
                    var sql = 'INSERT INTO history (ts, job, alias, seatnum, membername) VALUES (DATE_FORMAT("'+getCurrentDateTimeString()+'", "%Y-%m-%d %H:%i:%s"), 0, ?, ?, ?)';
                    conn.query(sql, [alias, seatnum, membername], function(err, results) {
                      if (err) {
                        console.log(err);
                        cb(new Error('query error'));
                      }
                      else {
                        cb(null, {success: '1'});
                      }
                    });
                  }
                });
              }
            });
          }
          else {
            console.log('getNextDayDateTimeString', getNextDayDateTimeString());
            var sql = 'UPDATE members SET enterance=?, seat=?, seatnum=?, seat_floor=?, ts=STR_TO_DATE("'+getCurrentDateTimeString()+'", "%Y-%m-%d %H:%i:%s"), fints=STR_TO_DATE(?, "%Y-%m-%d %H:%i:%s") WHERE alias=?';
            conn.query(sql, ["1", seatid, seatnum, floorid, getNextDayDateTimeString(), alias], function(err, results) {
              if(err) {
                console.log(err);
                cb(new Error("query error"));
              }
              else {
                var sql = 'INSERT INTO history (ts, job, alias, seatnum, membername) VALUES (DATE_FORMAT("'+getCurrentDateTimeString()+'", "%Y-%m-%d %H:%i:%s"), 0, ?, ?, ?)';
                conn.query(sql, [data.alias, data.seatnum, membername], function(err, results) {
                  if (err) {
                    console.log(err);
                    cb(new Error('query error'));
                  }
                  else {
                    cb(null, {success: '1'});
                  }
                });
              }
            });
          }
        }
      }
    },

    /*
      getSeatInfo
    */
    getSeatInfo: function(cb) {
      var sql = 'SELECT seat, payment, memo, seat_floor, membername FROM members';
      conn.query(sql, function(err, results) {
        if(err) {
          console.log(err);
          cb(new Error("query error"));
        }
        else {
          console.log('this is get seat info db');
          cb(null, results);
        }
      })
    },

    client_seatChange_auth: (data, cb) => {
      console.log('data', data);
      var {scid, scpwd} = data;

      var sql = 'SELECT seat, seatnum, seat_floor, alias, enterance FROM members WHERE alias=? AND password=?';
      conn.query(sql, [scid, scpwd], (err, results) => {
        if (err) {
          console.log(err);
          cb(new Error('query error'));
        }
        else {
          if(results === null || results.length === 0) {
            cb(null, {err: 1});
          }
          else if(results[0].enterance === '0') {
            cb(null, {err: 2});
          }
          else {
            console.log(results);
            cb(null, {err: 0, results: results[0]});
          }
        }
      });
    },

    client_seatChange: (data, cb) => {
      var {seatnum, seatid, floor, alias} = data;
      var sql = 'UPDATE members SET seat=?, seatnum=?, seat_floor=? WHERE alias=?';

      conn.query(sql, [seatid, seatnum, floor, alias], (err, results) => {
        if (err) {
          console.log(err);
          cb(new Error('query error'));
        }
        else {
          cb(null, {err: 0});
        }
      });
    },
    /*
      seatChange
    */
    seatChange: function(data, cb) {
      console.log(data);
      var oldSeatNum, newSeatNum, oldSeatId, newSeatId, oldFloor, newFloor;
      oldSeatNum  = data.oldSeatNum;
      oldSeatId   = data.oldSeatId;
      oldFloor    = data.oldFloor;
      newSeatNum  = data.newSeatNum;
      newSeatId   = data.newSeatId;
      newFloor    = data.newFloor;


      var sql = 'UPDATE members SET seat=?, seatnum=?, seat_floor=? WHERE seat=? AND seatnum=? AND seat_floor=?';
      conn.query(sql, [newSeatId, newSeatNum, newFloor, oldSeatId, oldSeatNum, oldFloor], function(err, results) {
        if (err) {
          console.log(err);
          cb(new Error('query error'));
        }
        else {
          cb(null, {err: "0", oldSeat: oldSeatNum, newSeat: newSeatNum});
        }
      });
    },
    Leave: function(data, cb) {
      /* before get data, check whether form data is valid */
      var sql = 'SELECT membername, password, enterance, payment, seatnum, break, DATE_FORMAT(ts, "%Y-%m-%d %H:%i:%s") FROM members WHERE alias=?'; /* first check the existence of member*/
      conn.query(sql, [data.lcid], function(err, results) {
        var memInfo = results[0];
        if(err) {
          console.log(err);
          cb(new Error('query error'));
        }
        if (results === null || memInfo.length === 0) {
          /* It means there's no matching member */
          return cb(null, {err: "1"});
        }
        else if (memInfo.password !== data.lcpwd) {
          console.log('incorrect pwd error');
          return cb(null, {err: "2"});
        }
        /* check if already exited */
        else if (memInfo.enterance === "0") {
          console.log('you already exit');
          return cb(null, {err: "3"});
        }
        else {
          /*
            how many minutes user break
          */
          var breaks = memInfo.break;
          var {lcid, lcpwd} = data;
          var {seatnum, membername} = memInfo;
          /*
            check ts and determine payment policy
          */
          var night    = isNightWithParam(memInfo['DATE_FORMAT(ts, "%Y-%m-%d %H:%i:%s")']);
          console.log('leave night: ' + night);

          var sql = 'INSERT INTO history (ts, job, alias, seatnum, membername) VALUES (DATE_FORMAT("'+getCurrentDateTimeString()+'", "%Y-%m-%d %H:%i:%s"), 3, ?, ?, ?)';
          conn.query(sql, [lcid, seatnum, membername], function(err, results) {
            if (err) {
              console.log(err);
              cb(new Error('query error'));
            }
            else {
              /*
                And after insert history, also set mask=0 to pause_table
              */
              var sql = 'UPDATE pause_table SET mask=0 WHERE alias=? AND mask=1';
              conn.query(sql, [lcid], function(err, results) {
                if (err) {
                  cb(new Error('query error'));
                }
                else {
                  /*
                    Apply night policy
                  */
                  if (night === 1) {
                    console.log('this is night block');
                    var sql = 'SELECT DATE_FORMAT(ts, "%Y-%m-%d %H:%i:%s") FROM members WHERE alias=?';
                    conn.query(sql, [lcid], function(err, results) {
                      if (err) {
                        cb(new Error('query error'));
                      }
                      else {
                        console.log('leaving night user');
                        /*
                          If trying to reuse, we need to recalculate the fin ts
                        */
                        var resultObj    = results[0];
                        var oldTsStr     = resultObj['DATE_FORMAT(ts, "%Y-%m-%d %H:%i:%s")'];
                        var fee = 0;
                        if (getMinuteWithStringDateTime(getCurrentDateTimeString(), oldTsStr) > breaks) {
                          fee = getFeeFromMinutes(getMinuteWithStringDateTime(getCurrentDateTimeString(), oldTsStr) - breaks);
                        }

                        /*
                          Then with MINUTES update member data
                        */
                        var sql = 'UPDATE members SET milage = milage - ?, enterance="0", seat="0", seatnum="0", seat_floor=NULL, ts=NULL, fints=NULL, pause="0", break=0 WHERE alias = ?';
                        conn.query(sql, [fee, lcid], function(err, results) {
                          if(err) {
                            cb(new Error('query error'));
                          }
                          else {
                            cb(null, {err: "0", alias: lcid, do: "leave", fee});
                          }
                        })
                      }
                    });
                  }
                  /* this is another policy
                    This include the case

                      that when user enter before day and leave next day.
                  */
                  else {
                    /*
                      if the use is prepay user, when he/she tries to exit then we should update the milage and left time
                    */

                    console.log('This is not night block');
                    if (prepayUserCase(memInfo.payment)) {
                      console.log('leave prepay block');
                      var sql = 'SELECT DATE_FORMAT(ts, "%Y-%m-%d %H:%i:%s"), milage FROM members WHERE alias=?';
                      conn.query(sql, [lcid], function(err, results) {
                        if (err) {
                          cb(new Error('query error'));
                        }
                        else {
                          console.log('leaving prepay member');
                          /*
                            If trying to reuse, we need to recalculate the fin ts
                          */
                          var resultObj    = results[0];
                          var oldTsStr     = resultObj['DATE_FORMAT(ts, "%Y-%m-%d %H:%i:%s")'];
                          console.log('usedMin: ',getMinuteWithStringDateTime(getCurrentDateTimeString(), oldTsStr));
                          var fee = 0;
                          if (getMinuteWithStringDateTime(getCurrentDateTimeString(), oldTsStr) > breaks) {
                            fee = getFeeFromMinutes(getMinuteWithStringDateTime(getCurrentDateTimeString(), oldTsStr) - breaks);
                          }
                          /*
                            update left time with milage
                          */
                          var leftTime = milage2min(resultObj.milage);
                          /*
                            Then with MINUTES update member data
                          */
                          var sql = 'UPDATE members SET leftTime = ?, milage = milage - ?, enterance="0", seat="0", seatnum="0", seat_floor=NULL, ts=NULL, fints=NULL, pause="0", break=0 WHERE alias = ?';
                          conn.query(sql, [leftTime, fee, lcid], function(err, results) {
                            if(err) {
                              cb(new Error('query error'));
                            }
                            else {
                              cb(null, {err: "0", alias: lcid, do: "leave", fee});
                            }
                          })
                        }
                      });
                    }
                    /*
                      He/She is not prepay payment member
                    */
                    else {
                      var sql = 'SELECT DATE_FORMAT(ts, "%Y-%m-%d %H:%i:%s"), DATE_FORMAT(pts, "%Y-%m-%d %H:%i:%s"), DATE_FORMAT(rts, "%Y-%m-%d %H:%i:%s"), leftTime FROM members WHERE alias=?';
                      conn.query(sql, [lcid], function(err, results) {
                        if (err) {
                          console.log(err);
                          cb(new Error('query error'));
                        }
                        else {
                          /*
                            if leave time is later than fints, than reduce milage
                          */
                          var resultObj    = results[0];
                          var leftTime     = resultObj.leftTime;
                          var minutes      = getMinuteWithStringDateTime(getCurrentDateTimeString(), resultObj['DATE_FORMAT(ts, "%Y-%m-%d %H:%i:%s")']) - breaks;
                          var fee = 0;
                          console.log('minutes', minutes);
                          if(minutes > 0) {
                            var diffMin;
                            if ((minutes > leftTime) && (UserWhichHasTimeLimitCase(memInfo.payment) === true)) {
                                  /* the case when used minutes is larger than leftTime, then fee is diff between them*/
                              diffMin = minutes - leftTime;
                              fee = getFeeFromMinutes(diffMin);
                            }
                            else if (isNight() === 1) { /* then case when used minutes is not over leftTime but leaving time is next day fee is diff between curtime and 12:00 PM*/
                              fee = getFeeFromMinutes(getMinuteWithStringDateTime(getCurrentDateTimeString(), getCurrentDateTimeStringWithZero()));
                            }
                            /* else fee = 0*/
                          }

                          var sql = 'UPDATE members SET enterance="0", seat="0", seatnum="0", seat_floor=NULL, ts=NULL, milage=milage-?, fints=NULL, pause="0", break=0 WHERE alias=? AND password=?';
                          conn.query(sql, [fee, lcid, lcpwd], function(err, results) {
                            if(err) {
                              cb(new Error('query error'));
                            }
                            else {
                              console.log('this is leave');
                              cb(null, {err: "0", alias: lcid, do: "leave", fee});
                            }
                          });
                        }
                      });
                    }
                  }
                }
              });
            }
          });
        }
      });
    },

    /*
      Pause
    */
    Pause: function(data, cb) {
      var isPause;
      var oldTs, oldfinTs;
      var payment;
      var pts, rts;
      /*
        before doing something first auth the member
      */
      var sql = 'SELECT membername, password, enterance, payment, seatnum FROM members WHERE alias=?'; /* first check the existence of member*/
      console.log(data);
      conn.query(sql, [data.pcid], function(err, results) {
        if(err) {
          console.log(err);
          cb(new Error('query error'));
        }
        if (results.length === 0) {
          /* It means there's no matching member */
          return cb(null, {err: "1"});
        }
        else if (results[0].password !== data.pcpwd) {
          console.log('incorrect pwd error');
          return cb(null, {err: "2"});
        }
        else if(results[0].enterance === "0") {
          console.log('even not entered');
          return cb(null, {err: "3"});
        }
        else {
          /* save payment */
          payment                       = results[0].payment;
          var {seatnum, membername}     = results[0];
          var {pcid, pcpwd}             = data;

          var sql = 'SELECT DATE_FORMAT(ts, "%Y-%m-%d %H:%i:%s"), DATE_FORMAT(fints, "%Y-%m-%d %H:%i:%s"), DATE_FORMAT(pts, "%Y-%m-%d %H:%i:%s"), pause FROM members WHERE alias=?';
          conn.query(sql, [pcid, pcpwd], function(err, results) {
            if(err) {
              cb(new Error('query error'));
            }
            else {
              console.log('this is pause');
              var resultObj = results[0];
              isPause = resultObj.pause;
              pts = resultObj['DATE_FORMAT(pts, "%Y-%m-%d %H:%i:%s")'];
              var ptsDate;
              if (pts != null) {
                ptsDate = new Date(Date.parse(pts.replace('-','/','g')));
              }
              /*
                free user
              */
              if (freeUserCase(payment)) {
                if (isPause == "0") {
                  // curent time
                  var sql = 'UPDATE members SET pause=?, pts=DATE_FORMAT("'+getCurrentDateTimeString()+'", "%Y-%m-%d %H:%i:%s") WHERE alias=?'; /* just update pause bit, not ts */
                  conn.query(sql, ["1", pcid], function(err, results) {
                    if (err) {
                      return cb(new Error('query error'));
                    }
                    else {
                      /* succeed at pause */
                      var sql = 'INSERT INTO pause_table (alias, mask) VALUES (?, 1)';
                      conn.query(sql, [pcid], function(err, results) {
                        if (err) {
                          cb(new Error('query error'));
                        }
                        else {
                          /*
                            after update pause bit, then add this history to db
                          */
                          var sql = 'INSERT INTO history (ts, job, alias, seatnum, membername) VALUES (DATE_FORMAT("'+getCurrentDateTimeString()+'", "%Y-%m-%d %H:%i:%s"), 1, ?, ?, ?)';
                          conn.query(sql, [pcid, seatnum, membername], function(err, results) {
                            if (err) {
                              console.log(err);
                              return cb(new Error('query error'));
                            }
                            else {
                              return cb(null, {err: "0", alias: pcid, do: "pause"});
                            }
                          });
                        }
                      });
                    }
                  });
                }
                /*
                  if free user tries to reuse
                */
                else if(isPause == "1") {
                  // current time
                  var breaks = getMinuteWithStringDateTime(getCurrentDateTimeString(), resultObj['DATE_FORMAT(pts, "%Y-%m-%d %H:%i:%s")']);
                  var sql = 'UPDATE members SET pause=?, rts=DATE_FORMAT("'+getCurrentDateTimeString()+'", "%Y-%m-%d %H:%i:%s"), break=break+? WHERE alias=?'; /* just update pause bit, not ts */
                  conn.query(sql, ["0", breaks, pcid], function(err, results) {
                    if (err) {
                      return cb(new Error('query error'));
                    }
                    else {
                      /*
                        succeed at reuse
                        then we should erase pause_table record -> set=0
                      */
                      var sql = 'UPDATE pause_table SET mask=0 WHERE alias=? AND mask=1';
                      conn.query(sql, [pcid], function(err, results) {
                        if (err) {
                          console.log(err);
                          return cb(new Error('query error'));
                        }
                        else {
                          /*
                            after update pause bit, then add this history to db
                          */

                          var sql = 'INSERT INTO history (ts, job, alias, seatnum, membername) VALUES (DATE_FORMAT("'+getCurrentDateTimeString()+'", "%Y-%m-%d %H:%i:%s"), 2, ?, ?, ?)';
                          conn.query(sql, [pcid, seatnum, membername], function(err, results) {
                            if (err) {
                              console.log(err);
                              return cb(new Error('query error'));
                            }
                            else {
                              return cb(null, {err: "0", alias: pcid, do: "reuse"});
                            }
                          });
                        }
                      });
                    }
                  });
                }
              }
              /*
                not free user
              */
              else {
                /*
                  Now trying to pause
                */
                if (isPause === "0") {
                  var sql = 'UPDATE members SET pause=?, pts=DATE_FORMAT("'+getCurrentDateTimeString()+'", "%Y-%m-%d %H:%i:%s") WHERE alias=?'; /* just update pause bit, not ts */
                  conn.query(sql, ["1", pcid], function(err, results) {
                    if(err) {
                      cb(new Error('query error'));
                    }
                    else {

                      var sql = 'INSERT INTO pause_table (alias, mask) VALUES (?, 1)';
                      conn.query(sql, [pcid], function(err, results) {
                        if (err) {
                          cb(new Error('query error'));
                        }
                        else {
                          /*
                            after update pause bit, then add this history to db
                          */
                          var sql = 'INSERT INTO history (ts, job, alias, seatnum, membername) VALUES (DATE_FORMAT("'+getCurrentDateTimeString()+'", "%Y-%m-%d %H:%i:%s"), 1, ?, ?, ?)';
                          conn.query(sql, [pcid, seatnum, membername], function(err, results) {
                            if (err) {
                              console.log(err);
                              return cb(new Error('query error'));
                            }
                            else {
                              return cb(null, {err: "0", alias: pcid, do: "pause"});
                            }
                          });
                        }
                      });
                    }
                  });
                }
                /*
                  Now trying to reuse
                */
                else if (isPause === "1") {
                  console.log('Now trying to reuse');
                  var breaks = getMinuteWithStringDateTime(getCurrentDateTimeString(), resultObj['DATE_FORMAT(pts, "%Y-%m-%d %H:%i:%s")']);
                  /*
                    FINALLY get the difference of minutes [inital enter ~ reuse time]
                  */
                  var minutes = getMinuteWithStringDateTime(getCurrentDateTimeString(), resultObj['DATE_FORMAT(ts, "%Y-%m-%d %H:%i:%s")']);
                  //var diff = minutes * 60000;
                  /*
                    But if client use monthly or half-monthly payment fints is always next day 00:00:00 AM
                  */
                  if (UserWhichHasNoTimeLimitCase(payment)) {
                    //diff = 0;
                    minutes = 0;
                  }
                  console.log('minutes: ', minutes);
                  /*
                    before add diff, check first whether total date not go next day!
                  */
                  // var oldfinTsStr  = resultObj['DATE_FORMAT(fints, "%Y-%m-%d %H:%i:%s")'];
                  // var oldfinTsDate  = new Date(Date.parse(oldfinTsStr.replace('-','/','g')));
                  // var newfinTsDate  = new Date(oldfinTsDate.getTime() + diff);
                  // var newfinTsStr;

                  // if (newfinTsDate.getDay() != oldfinTsDate.getDay()) { /* if day is changed, set limit fints to next day 00:00 */
                  //   newfinTsStr = getNextDayDateTimeString();
                  // }
                  var fints = resultObj['DATE_FORMAT(fints, "%Y-%m-%d %H:%i:%s")'];
                  var after = moment(fints, moment.ISO_8601).add(minutes, 'minutes');
                  var before = moment(fints, moment.ISO_8601);
                  var newfinTsStr = fints;
                  if (after.dayOfYear() !== before.dayOfYear()) {
                    console.log('Days are different');
                    newfinTsStr = getNextDayDateTimeString();
                  }


                  var sql = 'UPDATE members SET pause=?, fints=STR_TO_DATE(?, "%Y-%m-%d %H:%i:%s"), rts=DATE_FORMAT("'+getCurrentDateTimeString()+'", "%Y-%m-%d %H:%i:%s"), break=break+? WHERE alias=?'; /* not change ts, but update fints depends on payment and time */
                  conn.query(sql, ["0", newfinTsStr, breaks, pcid], function(err, results) {
                    if(err) {
                      cb(new Error('query error'));
                    }
                    else {
                      /* succeed at pause */
                      var sql = 'INSERT INTO pause_table (alias, mask) VALUES (?, 0)';
                      conn.query(sql, [pcid], function(err, results) {
                        if (err) {
                          cb(new Error('query error'));
                        }
                        else {
                          /*
                            succeed at reuse
                            then we should erase pause_table record -> set=0
                          */
                          var sql = 'UPDATE pause_table SET mask=0 WHERE alias=? AND mask=1';
                          conn.query(sql, [pcid], function(err, results) {
                            if (err) {
                              console.log(err);
                              return cb(new Error('query error'));
                            }
                            else {
                              /*
                                after update pause bit, then add this history to db
                              */
                              var sql = 'INSERT INTO history (ts, job, alias, seatnum, membername) VALUES (DATE_FORMAT("'+getCurrentDateTimeString()+'", "%Y-%m-%d %H:%i:%s"), 2, ?, ?, ?)';
                              conn.query(sql, [pcid, seatnum, membername], function(err, results) {
                                if (err) {
                                  console.log(err);
                                  return cb(new Error('query error'));
                                }
                                else {
                                  return cb(null, {err: "0", alias: pcid, do: "reuse"});
                                }
                              });
                            }
                          });
                        }
                      });
                    }
                  });
                }
              }
            }
          });
        }
      });
    },
    /*
      checkFinish

        check is there anyone who spend almost their time
    */
    checkFinish: function(data, cb) {
      var sql = 'SELECT alias, DATE_FORMAT(fints, "%Y-%m-%d %H:%i:%s"), seatnum FROM members';
      conn.query(sql, function(err, results) {
        if(err) {
          cb(new Error('query error'));
        }
        else {
          cb(null, results); /* pass the all results */
        }
      });
    },

    /*
      checkPause

        For those of who paused over 60 minutes, turn their states into 'LEFT'
    */
    checkPause: function(cb) {
      console.log('checkPause');
      var sql ='SELECT alias, DATE_FORMAT(ts, "%Y-%m-%d %H:%i:%s") FROM pause_table WHERE mask=1';
      conn.query(sql, function(err, results) {
        if (err) {
          cb(new Error('query error'));
        }
        else {
          var uptList        = [];
          var pauseStartDate = [];
          for (var i = 0; i < results.length; i++) {
            var obj = results[i];
            var minutes = getMinuteWithStringDateTime(getCurrentDateTimeString(), obj['DATE_FORMAT(ts, "%Y-%m-%d %H:%i:%s")']);

            if (minutes > 60) {
              uptList.push(obj.alias);
              pauseStartDate.push(obj['DATE_FORMAT(ts, "%Y-%m-%d %H:%i:%s")']);
            }
          }// now we get lazy member list

          if (uptList.length > 0) {
            var mem = "(";
            for (var i = 0; i < uptList.length-1; i++) {
              mem += 'alias="'+uptList[i]+'" OR ';
            }
            mem += 'alias="'+uptList[uptList.length-1]+'")';

            var sql = 'UPDATE pause_table SET mask=0 WHERE '+mem+' AND mask=1';
            conn.query(sql, function(err, results) {
              if (err) {
                cb(new Error('query error'));
              }
              else {
                /* If we finished changing pause mask then upt member status */
                var sql = 'SELECT alias, payment, DATE_FORMAT(ts, "%Y-%m-%d %H:%i:%s"), break FROM members WHERE '+mem;
                conn.query(sql, function(err, results) {
                  if (err) {
                    return cb(new Error('query error'));
                  }
                  else {
                    for (var i = 0; i < results.length; i++) {
                      var obj     = results[i];
                      var alias   = obj.alias;
                      var payment = obj.payment;
                      var breaks  = obj.break;

                      if (prepayUserCase(payment)) { // in the case of prepay we should reduce milage
                        var fee = getFeeFromMinutes(getMinuteWithStringDateTime(pauseStartDate[i], obj['DATE_FORMAT(ts, "%Y-%m-%d %H:%i:%s")']) - breaks);
                        var sql = 'UPDATE members SET milage=milage-?, enterance="0", seat="0", seatnum="0", seat_floor=NULL, pause="0" WHERE alias=?';
                        conn.query(sql, [fee, alias], function(err, results) {
                          if (err) {
                            return cb(new Error('query error'));
                          }
                          else {
                            cb(null, {err:"0"});
                          }
                        });
                      }
                      else {
                        // do not update ts to accumlate usage time
                        var sql = 'UPDATE members SET enterance="0", seat="0", seatnum="0", seat_floor=NULL, pause="0" WHERE alias=?';
                        conn.query(sql, [alias], function(err, results) {
                          if (err) {
                            console.log('err');
                            return cb(new Error('query error'));
                          }
                          else {
                            cb(null, {err: "0"});
                          }
                        });
                      }
                    }
                  }
                });
              }
            });
          }
        }
      });
    },

    checkPauseLeave: function(cb) {
      var sql = 'SELECT membername, alias, payment FROM members WHERE ts IS NOT NULL AND enterance="0" AND pause="0"';
      conn.query(sql, function(err, results) {
        if (err) {
          console.log(err);
          cb(new Error('query error'));
        }
        else {
          console.log(results);
          cb(null, {err: "0", results});
        }
      });
    },

    PauseLeave: function(data, cb) {
      var {membername, alias} = data;

      var sql = 'SELECT payment, DATE_FORMAT(pts, "%Y-%m-%d %H:%i:%s"), DATE_FORMAT(ts, "%Y-%m-%d %H:%i:%s"), break, leftTime FROM members WHERE alias=?';
      conn.query(sql, [alias], function(err, results) {
        if (err) {
          console.log(err);
          cb(new Error('query error'));
        }
        else {
          var resObj    = results[0];
          var payment   = resObj.payment;
          var breaks    = resObj.break;
          var leftTime  = resObj.leftTime;
          var pts       = resObj['DATE_FORMAT(pts, "%Y-%m-%d %H:%i:%s")'];
          var ts        = resObj['DATE_FORMAT(ts, "%Y-%m-%d %H:%i:%s")'];
          var fee       = 0;
          if (prepayUserCase(payment)) {
            if (getMinuteWithStringDateTime(getCurrentDateTimeString(), oldTsStr) > breaks) {
              fee = getFeeFromMinutes(getMinuteWithStringDateTime(getCurrentDateTimeString(), oldTsStr) - breaks);
            }
          }
          else if (UserWhichHasTimeLimitExceptPrepayCase(payment)) {
            var minutes = getMinuteWithStringDateTime(pts, ts);

            if (minutes > leftTime) {
              fee = getFeeFromMinutes(minutes - leftTime);
            }
            else if (isNightWithParam(pts) === 1) {
              fee = getFeeFromMinutes(getMinuteWithStringDateTime(pts, getCurrentDateTimeStringWithZero()));
            }
          }
          else {
            var fee = 0;
            if (isNightWithParam(pts) === 1) {
              fee = getFeeFromMinutes(getMinuteWithStringDateTime(pts, getCurrentDateTimeStringWithZero()));
            }
          }

          var sql = 'UPDATE members SET milage=milage-?, ts=NULL, fints=NULL WHERE alias=?';
          conn.query(sql, [fee, alias], function(err, results) {
            if (err) {
              console.log(err);
              cb(new Error('query error'));
            }
            else {
              cb(null, {err: "0"});
            }
          });
        }
      });
    },

    /*
      protectQS
    */
    protectQS: function(data, cb) {
      console.log('this is db protectQS');
      var sql = 'SELECT payment, leftTime FROM members WHERE alias=?';
      conn.query(sql, [data.alias], function(err, results) {
        if(err) {
          cb(new Error('query error'));
        }
        else {
          if (results[0].payment !== data.pid) { /* leftTime is integer */
            return cb(null, {err: "1"});
          }
          cb(null, {err: "0"}); /* it's okay */
        }
      });
    },

    /*
      modifyMemberInfo
    */
    modifyMemberInfo: function(data, cb) {
      console.log('this is modify member info db');
      console.log(data);
      var sex;
      if (data.sex === '남') sex = 0;
      else                   sex = 1;
      var sql = 'UPDATE members SET membername=?, sex=?, prepare=?, memo=?, leftDay=? WHERE alias=?';
      conn.query(sql, [data.membername, sex, data.prepare, data.memo, data.leftDay, data.id], function(err, results) {
        if(err) {
          console.log(err);
          cb(new Error('query error'));
        }
        else {
          cb(null, {err: "0"});
        }
      });
    },

    deleteMemberInfo: function(data, cb) {
      console.log('delete member info');
      console.log(data);
      var sql = 'DELETE FROM members WHERE alias=?';
      conn.query(sql,[data.id], function(err, results) {
        if(err) {
          console.log(err);
          cb(new Error('query error'));
        }
        else {
          cb(null, {err: "0"});
        }
      });
    }
  },

  /*
    Payments
  */
  payments: {
    getList: function(cb) {
      var sql = 'SELECT type, timePerDay, price, name, paymentId FROM payments';
      conn.query(sql, function(err, results) {
        if(err) {
          console.log(err);
          cb(new Error('query error'));
        }
        else {
          cb(null, results);
        }
      })
    },
    updateList: function(data, cb) {
      var alias = data.member;
      var paymentId = data.paymentId;
      var leftDay;
      var night = 0;
      var addCoup = parseInt(data.addCoup);
      var useCoup = parseInt(data.useCoup);
      var price = parseInt(data.price);
      // if (data.night == true) {
      //   night = 1;
      // }

      /*
        first we need to check whether that member exist
      */
      var sql = 'SELECT membername, payment FROM members WHERE alias=?';
      conn.query(sql, [alias], function(err, results) {
        if (err) {
          console.log(err);
          cb(new Error('query error'));
        }
        else {
          console.log('updateList');
          console.log(results);
          if (results.length === 0) {
            return cb(null, {err: "2"});
          }
          else if(results[0].payment != null) {/* if this member still use other payment abort.*/
            return cb(null, {err: "1"});
          }
          /*
            update coup money
          */
          var sql = ''
          /*
            get the left day
          */
          var sql = 'SELECT leftDay FROM payments WHERE paymentId=?';
          conn.query(sql, [paymentId], function(err, results) {
            if(err) {
              console.log(err);
              cb(new Error('query error'));
            }
            else {
              leftDay = results[0].leftDay;
              /*
                free
              */
              if (data.type === 'free') {
                var sql = 'UPDATE members SET payment=?, leftTime=?, leftDay=?, night=? WHERE alias=?';
                conn.query(sql, [data.paymentId, parseInt(data.minPerDay), leftDay, night, alias], function(err, results) {
                  if(err) {
                    console.log(err);
                    cb(new Error('query error'));
                  }
                  else {
                    cb(null, {paymentId: data.paymentId});
                  }
                });
              }
              /*
                prepay
              */
              /* Before we update payments of member, we should get the left milges so that we can add to it */
              if(data.type === 'prepay') {
                var sql = 'SELECT milage, payment FROM members WHERE alias=?';
                conn.query(sql, [alias], function(err, results) {
                  if(err) {
                    console.log(err);
                    cb(new Error('query error'));
                  }
                  else {
                    var pid = results[0].payment;
                    //
                    // if (pid != "0" && pid != null) {
                    //   return cb(null, {err: "1"}); /* still using other payment */
                    // }

                    var oldMilages = parseInt(results[0].milage);
                    var newMilages = price + oldMilages + addCoup - useCoup; /* Now we get new milages*/
                    var newLeftTime = "" + Math.round((price / 800) * 60); /* prepay user left time is determined by milage */

                    console.log(oldMilages, price, newMilages, addCoup, useCoup);
                    var sql = 'UPDATE members SET milage=?, payment=?, leftTime=0, leftDay=?, night=? WHERE alias=?';
                    conn.query(sql, [newMilages, data.paymentId, leftDay, night, alias], function(err, results) {
                      if(err) {
                        console.log(err);
                        cb(new Error('query error'));
                      }
                      else {
                        cb(null, {newMilages: newMilages, paymentId: data.paymentId}); /* response with new milages */
                      }
                    });
                  }
                });
              }

              /*
                daily
              */
              else if (data.type === 'daily') {
                var sql = 'UPDATE members SET milage=(milage+?-?), payment=?, leftTime=?, leftDay=?, night=? WHERE alias=?';
                conn.query(sql, [addCoup, useCoup, data.paymentId, parseInt(data.minPerDay), leftDay, night, alias], function(err, results) {
                  if(err) {
                    console.log(err);
                    cb(new Error('query error'));
                  }
                  else {
                    cb(null, {paymentId: data.paymentId});
                  }
                });
              }

              /*
                monthly
              */
              else if (data.type === 'monthly') {
                var sql = 'UPDATE members SET milage=(milage+?-?), payment=?, leftTime=?, leftDay=?, night=? WHERE alias=?';
                conn.query(sql, [addCoup, useCoup, data.paymentId, parseInt(data.minPerDay), leftDay, night, alias], function(err, results) {
                  if(err) {
                    console.log(err);
                    cb(new Error('query error'));
                  }
                  else {
                    cb(null, {paymentId: data.paymentId});
                  }
                });
              }

              /*
                halfmonthly
              */
              else if (data.type === 'halfmonthly') {
                var sql = 'UPDATE members SET milage=(milage+?-?), payment=?, leftTime=?, leftDay=?, night=? WHERE alias=?';
                conn.query(sql, [addCoup, useCoup, data.paymentId, parseInt(data.minPerDay), leftDay, night, alias], function(err, results) {
                  if(err) {
                    console.log(err);
                    cb(new Error('query error'));
                  }
                  else {
                    cb(null, {paymentId: data.paymentId});
                  }
                });
              }

              /*
                night
              */
              else if (data.type === 'night') {
                var sql = 'UPDATE members SET milage=(milage+?-?), payment=?, leftTime=?, leftDay=?, night=?WHERE alias=?';
                conn.query(sql, [addCoup, useCoup, data.paymentId, parseInt(data.minPerDay), leftDay, night, alias], function(err, results) {
                  if(err) {
                    console.log(err);
                    cb(new Error('query error'));
                  }
                  else {
                    cb(null, {paymentId: data.paymentId});
                  }
                });
              }

              /*
                special
              */
              else if (data.type === 'special') {
                var sql = 'UPDATE members SET milage=(milage+?-?), payment=?, leftTime=?, leftDay=?, night=? WHERE alias=?';
                conn.query(sql, [addCoup, useCoup, data.paymentId, parseInt(data.minPerDay), leftDay, night, alias], function(err, results) {
                  if(err) {
                    console.log(err);
                    cb(new Error('query error'));
                  }
                  else {
                    cb(null, {paymentId: data.paymentId});
                  }
                });
              }
            }
          });
        }
      });


    },
    id2PaymentInfo: function(id, cb) {
      var sql = 'SELECT * FROM payments WHERE paymentId=?';
      conn.query(sql, [id], function(err, result) {
        if (err) {
          cb(new Error('query error'));
        }
        else {
          var paymentRow = result[0];
          cb(null, paymentRow);
        }
      });
    }
    // payment

  },

  /********************************************************************************************************************8
  ALARM
  *********************************************************************************************************************/
  alarm: {
    reduceLeftDay: function(cb) {
      /*
        If left day is 0 then just leave it as it is, otherwise minus 1 day

        * updated
            if member is holdoff then should not reduce left day
      */
      var sql = 'SELECT stop, alias FROM members';
      conn.query(sql, function(err, results) {
        if (err) {
          console.log(err);
          cb(new Error('query error'));
        }
        else {
          var stopMem = [];
          for (var i = 0; i < results.length; i++) {
            if (results[i].stop != 1) {
              stopMem.push(results[i].alias);
            }
          }
          /***********************************************************************************************************
            TEMPORARY
          ***********************************************************************************************************/
          console.log('stopMem');
          var queryString = "(";
          if (stopMem.length == 0) {
            return cb(null, {err: "0"});
          }
          else if (stopMem.length == 1) {
            queryString += stopMem[0] + ")";
          }
          else {
            for (var i = 0; i < stopMem.length-1; i++) {
              queryString += stopMem[i] + ", ";
            }
            queryString += stopMem[stopMem.length-1] + ")";
          }

          var sql = 'UPDATE members SET leftDay = IF(leftDay = 0, 0, IF((payment="0" OR payment="14"), leftDay, leftDay-1)) WHERE alias IN ' + queryString;
          conn.query(sql, function(err, results) {
            if(err) {
              console.log(err);
              cb(new Error('query error'));
            }
            else {

              cb(null, {err: "0"});
            }
          });
        }
      });
    }
  },


  /********************************************************************************************************************
  ACCOUNT
  *********************************************************************************************************************/
  account: {
    /*
      addList
    */
    addList: function(data, cb) {
      /*
        data.content, data.inout, data.price
      */
      console.log('this is addlist');
      console.log(data);
      /*
        data validation
      */
      var service;
      var price;
      if (data.service == "") {service = 0; }
      else {service = parseInt(data.service); }

      if (data.price == "") {price = 0;}
      else {price = parseInt(data.price); }


      service = parseInt(data.service);

      var sql = 'INSERT INTO account (content, ep, price, service) VALUES (?, ?, ?, ?)';
      conn.query(sql, [data.content, data.inout, price, service], function(err, results) {
        if(err) {
          console.log(err);
          cb(new Error('query error'));
        }
        else {
          cb(null, "0");
        }
      });
    },

    /*
      viewList
    */
    viewList: function(data, cb) {
      /*
        data.mindate, date.maxdate
      */
      var fullmindate = data.mindate + " 00:00:00";
      var fullmaxdate = data.maxdate + " 23:59:59";
      var sql = 'SELECT id, DATE_FORMAT(ts, "%Y-%m-%d"), content, ep, price, service FROM account WHERE ts BETWEEN STR_TO_DATE(?, "%Y-%m-%d %H:%i:%s") AND STR_TO_DATE(?, "%Y-%m-%d %H:%i:%s")';
      conn.query(sql, [fullmindate, fullmaxdate], function(err, results) {
        if(err) {
          console.log(err);
          cb(new Error('query error'));
        }
        else {
          console.log('this is viewlist db');
          cb(null, results);
        }
      })
    },

    updateList: function(data, cb) {
      /*
        data validation
      */
      var inout;
      if (data.inout != "지출" && data.inout != "수입") {
        return cb(null, {err: "1"});
      }
      else if (data.inout === "지출") {inout = true;}
      else if (data.inout === "수입") {inout = false;}
      console.log('this is update list db');
      console.log(data);
      var sql = 'UPDATE account SET content=?, ep=?, price=? WHERE id=?';
      conn.query(sql, [data.content, inout, data.price, data.id], function(err, results) {
        if(err) {
          console.log(err);
          cb(new Error('query error'));
        }
        else {
          console.log('this is updateList db');
          cb(null, {err: "0"});
        }
      });
    },

    deleteList: function(data, cb) {
      var sql = 'DELETE FROM account WHERE id=?';
      conn.query(sql, [data.id], function(err, results) {
        if(err) {
          console.log(err);
          cb(new Error('query error'));
        }
        else {
          console.log('this is deleteList db');
          cb(null, {err: "0"});
        }
      });
    }
  },

  /********************************************************************************************************************
  SYSTEM
  *********************************************************************************************************************/

  system: {
    /*
      useMilage
    */
    useMilage: function(data, cb) {
      var alias = data.alias;
      var milage = parseInt(data.milage);
      /*
        data.membername, data.milage
      */
      /* before update milage, first check whether that client exist */
      var sql = 'SELECT milage FROM members WHERE alias=?';
      conn.query(sql, [alias], function(err, results) {
        if (err) {
          console.log(err);
          cb(new Error('query error'));
        }
        else {
          /* check the data*/
          var useMilage = parseInt(data.milage)
          if (results[0].milage < useMilage) { /* In the case when client wants to use milage more than he/she has */
            return cb(null, {err: "1"});
          }
          else {
            var reducedMilage = results[0].milage - useMilage;
            var sql = 'UPDATE members SET milage=? WHERE alias=?';
            conn.query(sql, [reducedMilage, alias], function(err, results) {
              if (err) {
                console.log(err);
                cb(new Error('query error'));
              }
              else {
                /*
                  insert into stock table
                */
                var sql = 'INSERT INTO stockList (content, spending, price) VALUES (?, 1, ?)';
                conn.query(sql, [data.content, milage], function(err, results) {
                  if (err) {
                    console.log(err);
                    cb(new Error('query error'));
                  }
                  else {
                    console.log('success at using milage');
                    cb(null, {err: "0"});
                  }
                });
              }
            });
          }
        }
      });
    },

    /*
      chargeMilage
    */
    chargeMilage: function(data, cb) {
      /*data validation*/
      var alias = data.alias;
      var milage = parseInt(data.milage);

      if (alias.length !== 8 || Number.isInteger(alias)) {
        return cb(null, {err: "1"}); /* alias format err */
      }
      else if (!Number.isInteger(milage)){
        return cb(null, {err: "2"}); /* price format err */
      }
      else {
        var sql = 'SELECT membername FROM members WHERE alias=?';
        conn.query(sql, [alias], function(err, results) {
          if (err) {
            console.log(err);
            cb(new Error('query error'));
          }
          else {
            if (results[0].membername === null) {
              return cb(null, {err: "3"}); /* member don't exist */
            }
            else {
              var sql = 'UPDATE members SET milage = milage + ? WHERE alias=?';
              conn.query(sql, [milage, alias], function(err, results) {
                if (err) {
                  console.log(err);
                  cb(new Error('query error'));
                }
                else {
                  /*
                    insert into stockList
                  */
                  var sql = 'INSERT INTO stockList (content, income, price) VALUES (?, 1, ?)';
                  conn.query(sql, [data.content, milage], function(err, results) {
                    if (err) {
                      console.log(err);
                      cb(new Error('query error'));
                    }
                    else {
                      cb(null, {err: "0"});
                    }
                  });
                }
              })
            }
          }
        })
      }
    },
    /*
      studyRoomCurrentState
    */
    studyRoomCurrentState: function(data, cb) {
      if (data.dateMin) {
        /*
          When there's min date, then query data depends on min date
          (When select, cancel date select fired this block is executed)
        */
        var sql = 'SELECT room, users, purpose, duration, start, DATE_FORMAT(tsStart, "%Y-%m-%d"), DATE_FORMAT(tsEnd, "%Y-%m-%d"), ro ';
        sql += 'FROM studyroom n ';
        sql += 'WHERE tsEnd >= STR_TO_DATE(?, "%Y-%m-%d") AND id = (SELECT MAX(id) FROM studyroom n2 WHERE n2.users = n.users AND n2.tsStart = n.tsStart AND n2.tsEnd = n.tsEnd AND n2.room = n.room AND n2.start = n.start AND n2.duration = n.duration)';
        conn.query(sql, [data.dateMin], function(err, results) {
          if (err) {
            console.log(err);
            cb(new Error('query error'));
          }
          else {
            console.log('this is view studyroom reservation list');
            cb(null, results);
          }
        });
      }
      else {
        /*
          WHne there's no min date, then query data depends on current date
          (When refresh button fired, this block execute)
        */
        var sql = 'SELECT room, users, purpose, duration, start, DATE_FORMAT(tsStart, "%Y-%m-%d"), DATE_FORMAT(tsEnd, "%Y-%m-%d"), ro ';
        sql += 'FROM studyroom n ';
        sql += 'WHERE tsEnd >= CURDATE() AND id = (SELECT MAX(id) FROM studyroom n2 WHERE n2.users = n.users AND n2.tsStart = n.tsStart AND n2.tsEnd = n.tsEnd AND n2.room = n.room AND n2.start = n.start AND n2.duration = n.duration)';
        conn.query(sql, function(err, results) {
          if (err) {
            console.log(err);
            cb(new Error('query error'));
          }
          else {
            console.log('this is view studyroom reservation list');
            console.log(results);
            cb(null, results);
          }
        });
      }
    },

    /*
      reserveStudyRoom
    */
    reserveStudyRoom: function(data, cb) {
      var option      = data.option; // whether all day, weekend, weekday reservation
      console.log(option);
      var users       = data.users;
      var purpose     = data.purpose;

      var duration    = data.du;
      var rdsStr      = data.rds.toString() + " 00:00:00"; var rdsDate = new Date(Date.parse(rdsStr.replace('-','/','g')));
      var rdeStr      = data.rde.toString() + " 00:00:00"; var rdeDate = new Date(Date.parse(rdeStr.replace('-','/','g')));

      var dateStart   = data.rds + " 00:00:00";
      var dateEnd     = data.rde + " 23:59:59";
      var milldiff    = Math.abs(rdeDate - rdsDate);
      var daydiff     = Math.floor(((milldiff/1000)/3600)/24);
      var roomNum     = data.rn;

      var startHour   = data.sh;
      var endHour = startHour + duration;

      var sql = 'SELECT start, duration FROM studyroom WHERE ts BETWEEN STR_TO_DATE(?, "%Y-%m-%d %H:%i:%s") AND STR_TO_DATE(?, "%Y-%m-%d %H:%i:%s") AND room=?';
      conn.query(sql, [dateStart, dateEnd, roomNum], function(err, results) {
        if (err) {
          console.log(err);
          cb(new Error('query error'));
        }
        else {
          console.log('this is reserveStudyRoom');

          /*
            before check vaildity, chage str date to float, int
          */
          var fstartHour  = parseFloat(startHour);
          var fduration   = parseFloat(duration);
          var fendHour = fstartHour + fduration;
          /*
            update:
              if 23:00 dur: 5hr => this is error
          */
          if ((fstartHour + fduration) > 24) {
            return cb(null, {err: "3"});
          }
          /*
            update:
              if 00:00 dur: 6hr => this is error
          */
          if ((fstartHour + fduration) > 5 && (fstartHour + fduration) <= 7) {
            return cb(null, {err: "4"});
          }


          for (var i = 0; i < results.length; i++) {
            var booked = results[i]; /* float, integer */
            if (booked.start <= fstartHour && (booked.start + booked.duration) > fstartHour ) {
              return cb(null, {err : "2"});
            }
            else if (booked.start < fendHour && (booked.start + booked.duration) >= fendHour ) {
              return cb(null, {err :"2"});
            }
            else if (fstartHour <= booked.start && fendHour >= (booked.start + booked.duration) ) {
              return cb(null, {err : "2"});
            }
          }
          /*
            Then make query INSERT data
          */

          /*
            Before we making query string, we first need to check whether clients wants to reserve

            only in weekday, or weekend or don't care.
          */
          var insertData = "";
          var days = 0;
          var optnum = 0;
          if (option == 'allday') {
            optnum = 0;
          }
          else if(option == 'weekend') {
            optnum = 1;
          }
          else if(option == 'weekday') {
            optnum = 2;
          }
          optnum = parseInt(optnum);

          if (option == 'allday') {

            // if clients want allday
            for (var i = 0; i < daydiff; i++) {
              var newDate = new Date(rdsDate.getTime() + i * 86400000);
              var date = moment(newDate);
              date = date.format('YYYY-MM-DD').toString();
              date += " 00:00:00";
              insertData += '('+optnum+', STR_TO_DATE("'+date+'", "%Y-%m-%d %H:%i:%s"), '+fstartHour+', '+fduration+', '+roomNum+',"'+users+'", "'+purpose+'", STR_TO_DATE("'+rdsStr+'", "%Y-%m-%d %H:%i:%s"), STR_TO_DATE("'+rdeStr+'", "%Y-%m-%d %H:%i:%s")), ';

              days++;
            }
            // handle last element
            var newDate = new Date(rdsDate.getTime() + daydiff * 86400000);
            var date = moment(newDate);
            date = date.format('YYYY-MM-DD').toString();
            date += " 00:00:00";
            insertData += '('+optnum+', STR_TO_DATE("'+date+'", "%Y-%m-%d %H:%i:%s"), '+fstartHour+', '+fduration+', '+roomNum+', "'+users+'", "'+purpose+'", STR_TO_DATE("'+rdsStr+'", "%Y-%m-%d %H:%i:%s"), STR_TO_DATE("'+rdeStr+'", "%Y-%m-%d %H:%i:%s"));';
            days++;
          }
          else if (option == 'weekend') {
            // if clients want weekend only
            for (var i = 0; i < daydiff; i++) {
              var newDate = new Date(rdsDate.getTime() + i * 86400000);
              var date = moment(newDate);
              if (date.isoWeekday() === 6 || date.isoWeekday() === 7) {
                date = date.format('YYYY-MM-DD').toString();
                date += " 00:00:00";
                insertData += '('+optnum+', STR_TO_DATE("'+date+'", "%Y-%m-%d %H:%i:%s"), '+fstartHour+', '+fduration+', '+roomNum+',"'+users+'", "'+purpose+'", STR_TO_DATE("'+rdsStr+'", "%Y-%m-%d %H:%i:%s"), STR_TO_DATE("'+rdeStr+'", "%Y-%m-%d %H:%i:%s")), ';

                days++;
              }
            }
            // handle last element
            var newDate = new Date(rdsDate.getTime() + daydiff * 86400000);
            var date = moment(newDate);
            if (date.isoWeekday() === 6 || date.isoWeekday() === 7) {
              date = date.format('YYYY-MM-DD').toString();
              date += " 00:00:00";
              insertData += '('+optnum+', STR_TO_DATE("'+date+'", "%Y-%m-%d %H:%i:%s"), '+fstartHour+', '+fduration+', '+roomNum+', "'+users+'", "'+purpose+'", STR_TO_DATE("'+rdsStr+'", "%Y-%m-%d %H:%i:%s"), STR_TO_DATE("'+rdeStr+'", "%Y-%m-%d %H:%i:%s"));';

              days++;
            }
            else {
              insertData = insertData.substr(0, insertData.length-2) + ';';

            }
          }
          else if (option == 'weekday') {
            // if clients want weekdays only
            for (var i = 0; i < daydiff; i++) {
              var newDate = new Date(rdsDate.getTime() + i * 86400000);
              var date = moment(newDate);
              if (date.isoWeekday() !== 6 && date.isoWeekday() !== 7) {
                date = date.format('YYYY-MM-DD').toString();
                date += " 00:00:00";
                insertData += '('+optnum+', STR_TO_DATE("'+date+'", "%Y-%m-%d %H:%i:%s"), '+fstartHour+', '+fduration+', '+roomNum+',"'+users+'", "'+purpose+'", STR_TO_DATE("'+rdsStr+'", "%Y-%m-%d %H:%i:%s"), STR_TO_DATE("'+rdeStr+'", "%Y-%m-%d %H:%i:%s")), ';

                days++;
              }
            }
            // handle last element
            var newDate = new Date(rdsDate.getTime() + daydiff * 86400000);
            var date = moment(newDate);
            if (date.isoWeekday() !== 6 && date.isoWeekday() !== 7) {
              date = date.format('YYYY-MM-DD').toString();
              date += " 00:00:00";
              insertData += '('+optnum+', STR_TO_DATE("'+date+'", "%Y-%m-%d %H:%i:%s"), '+fstartHour+', '+fduration+', '+roomNum+', "'+users+'", "'+purpose+'", STR_TO_DATE("'+rdsStr+'", "%Y-%m-%d %H:%i:%s"), STR_TO_DATE("'+rdeStr+'", "%Y-%m-%d %H:%i:%s"));';

              days++;
            }
            else {
              insertData = insertData.slice(0, insertData.length-2) + ';';

            }
          }

          /* Now reservation time is valid */
          var sql = 'INSERT INTO studyroom (ro, ts, start, duration, room, users, purpose, tsStart, tsEnd) VALUES ' + insertData;
          conn.query(sql, function(err, results) {
            if (err) {
              console.log(err);
              cb(new Error('query error'));
            }
            else {
              console.log(days);
              cb(null, {err: "0", days: days});
            }
          });
        }
      });
    },

    /*
      cancelStudyRoom
    */
    cancelStudyRoom: function(data, cb) {
      var rdsStr      = data.rds.toString() + " 00:00:00"; /* will use between */ var rdsDate = new Date(Date.parse(rdsStr.replace('-','/','g')));
      var rdeStr      = data.rde.toString() + " 00:00:02"; /* will use between */ var rdeDate = new Date(Date.parse(rdsStr.replace('-','/','g')));
      var startHour   = data.sh;
      var roomNum     = data.rn;

      var sql = 'SELECT users, DATE_FORMAT(tsStart, "%Y-%m-%d %H:%i:%s"), DATE_FORMAT(tsEnd, "%Y-%m-%d %H:%i:%s") FROM studyroom WHERE (ts BETWEEN STR_TO_DATE(?, "%Y-%m-%d %H:%i:%s") AND STR_TO_DATE(?, "%Y-%m-%d %H:%i:%s")) AND start=? AND room=?';
      conn.query(sql, [rdsStr, rdeStr, parseFloat(startHour), roomNum], function(err, results) {
        if (err) {
          console.log(err);
          cb(new Error('query error'));
        }
        else {
          if (results.length == 0) {
            return cb(null, {err: "1"}); /* there's no results */
          }
          else {
            var r = results[0];
            var oldRdsStr = r['DATE_FORMAT(tsStart, "%Y-%m-%d %H:%i:%s")'];
            var oldRdeStr = r['DATE_FORMAT(tsEnd, "%Y-%m-%d %H:%i:%s")'];


            var sql = 'DELETE FROM studyroom WHERE (ts BETWEEN STR_TO_DATE(?, "%Y-%m-%d %H:%i:%s") AND STR_TO_DATE(?, "%Y-%m-%d %H:%i:%s")) AND start=? AND room=?';
            conn.query(sql, [rdsStr, rdeStr, parseFloat(startHour), roomNum], function(err, results) {
              if (err) {
                console.log(err);
                cb(new Error('query error'));
              }
              else {
                /*
                  Now update tsStart, tsEnd
                */
                /* first select all the reservation list between oldRdsStr, oldRdeStr which was list of old date span */
                var sql = 'SELECT id, DATE_FORMAT(ts, "%Y-%m-%d %H:%i:%s") FROM studyroom WHERE (ts BETWEEN STR_TO_DATE(?, "%Y-%m-%d %H:%i:%s") AND STR_TO_DATE(?, "%Y-%m-%d %H:%i:%s")) AND start=? AND room=?';
                conn.query(sql, [oldRdsStr, oldRdeStr, parseFloat(startHour), roomNum], function(err, results) {
                  if (err) {
                    console.log(err);
                    cb(new Error('query error'));
                  }
                  else {
                    if (results.length == 0) { /* this means all list are deleted */
                      cb(null, {err: "0"});
                    }
                    else {

                      var prev = []; var prevNewRdsStr; var prevNewRdeStr;
                      var next = []; var nextNewRdsStr; var nextNewRdeStr;
                      for (var i = 0; i < results.length; i++) {
                        var obj = results[i];
                        var ts = obj['DATE_FORMAT(ts, "%Y-%m-%d %H:%i:%s")']; var tsDate = new Date(Date.parse(ts.replace('-','/','g')));

                        if (rdsDate - tsDate > 0) {
                          prevNewRdsStr = oldRdsStr;
                          prevNewRdeStr = data.rds.toString() + " 00:00:01"; /* should reduce one day*/

                          var tmp = new Date(Date.parse(prevNewRdeStr.replace('-','/','g')));
                          var tmpDate = new Date(tmp.getTime() - 86400000);
                          var tmpMoment = moment(tmpDate);
                          tmp = tmpMoment.format('YYYY-MM-DD').toString();
                          tmp += " 00:00:00";

                          /* now reduced one day string */
                          prevNewRdeStr = tmp;
                          prev.push(obj.id);
                        }
                        else {
                          nextNewRdsStr = data.rde.toString() + " 00:00:01"; /* should add one day*/
                          nextNewRdeStr = oldRdeStr;

                          var tmp = new Date(Date.parse(nextNewRdsStr.replace('-','/','g')));
                          var tmpDate =  new Date(tmp.getTime() + 86400000);
                          var tmpMoment = moment(tmpDate);
                          tmp = tmpMoment.format('YYYY-MM-DD').toString();
                          tmp += " 00:00:00";

                          /* now added one day string */
                          nextNewRdsStr = tmp;
                          next.push(obj.id);
                        }
                      }
                      /* then make query string */
                      var prevQS = "";
                      if (prev.length == 0) { prevQS += 0; }
                      else {
                        for (var i = 0; i < prev.length-1; i++) {
                          prevQS += prev[i] + ", ";
                        }
                        prevQS += prev[prev.length-1];
                      }


                      var nextQS = "";
                      if (next.length == 0) { nextQS += 0; }
                      else {
                        for (var i = 0; i < next.length-1; i++) {
                          nextQS += next[i] += ", ";
                        }
                        nextQS += next[next.length-1];
                      }

                      var sql = 'UPDATE studyroom SET tsStart = DATE(STR_TO_DATE("'+prevNewRdsStr+'", "%Y-%m-%d %H:%i:%s")), tsEnd = DATE(STR_TO_DATE("'+prevNewRdeStr+'", "%Y-%m-%d %H:%i:%s")) WHERE id IN ('+prevQS+')';
                      conn.query(sql, function(err, results) {
                        if (err) {
                          console.log(err);
                          cb(new Error('query error'));
                        }
                        else {
                          var sql = 'UPDATE studyroom SET tsStart=DATE(STR_TO_DATE("'+nextNewRdsStr+'", "%Y-%m-%d %H:%i:%s")), tsEnd=DATE(STR_TO_DATE("'+nextNewRdeStr+'", "%Y-%m-%d %H:%i:%s")) WHERE id IN ('+nextQS+')';
                          conn.query(sql, function(err, results) {
                            if (err) {
                              console.log(err);
                            }
                            else {
                              cb(null, {err: "0"});
                            }
                          });
                        }
                      });
                    } // end of else
                  } // end of else
                }); // start of 3rd query
              } // result of 2nd query
            }); // start of 2nd query
          }
        } // result 1st of query
      }); // start of 1st query
    },

    clientStudyRoomState: function(data, cb) {
      /*
        data.reserveDate
      */
      var dateStart = moment().tz('Asia/Tokyo').format('YYYY-MM-DD').toString() + " 00:00:00";
      var dateEnd   = moment().tz('Asia/Tokyo').format('YYYY-MM-DD').toString() + " 23:59:59";

      var sql = 'SELECT duration, start, room FROM studyroom WHERE ts BETWEEN STR_TO_DATE(?, "%Y-%m-%d %H:%i:%s") AND STR_TO_DATE(?, "%Y-%m-%d %H:%i:%s")';
      conn.query(sql, [dateStart, dateEnd], function(err, results) {
        if (err) {
          console.log(err);
          cb(new Error('query error'));
        }
        else {
          console.log('this is view studyroom reservation list');
          console.log(results);
          cb(null, {results: results, err: "0"});
        }
      });
    },

    /*
      payback
    */
    payback: function(data, cb) {
      /* data.id  data.milage */
      var milage;
      var alias = data.alias;
      if (data.milage == "") milage = 0;
      else                   milage = parseInt(data.milage);

      var sql = 'UPDATE members SET payment=NULL, leftDay=0, milage=milage+?, leftTime=0 WHERE alias=?';
      conn.query(sql, [milage, alias], function(err, result) {
        if (err) {
          console.log(err);
          cb(new Error('query error'));
        }
        else {
          cb(null, {err: "0"});
        }
      });
    },

    holdoff: function(data, cb) {
      console.log('this is holdoff');
      var sql = 'UPDATE members SET stop=IF(stop=0, 1, 0) WHERE id=?';
      conn.query(sql, [data.id], function(err, result) {
        if (err) {
          console.log(err);
          cb(new Error('query error'));
        }
        else {
          var sql = 'SELECT stop FROM members WHERE id=?';
          conn.query(sql, [data.id], function(err, result) {
            var isStop = result[0].stop;
            cb(null, {err: "0", do: isStop});
          });
        }
      });
    },

    vacantSeat: function(data, cb) {
      console.log('this is vacantSeat');
      /*
        first select member payment, if that member is prepay member get the ts and get min diff
      */
      var sql = 'SELECT payment, membername, seatnum, DATE_FORMAT(ts, "%Y-%m-%d %H:%i:%s") FROM members WHERE alias=?';
      conn.query(sql, [data.alias], function(err, results) {
        if (err) {
          console.log(err);
          cb(new Error('query error'));
        }
        else {
          var obj = results[0];
          var paymentId   = obj.payment;
          var membername  = obj.membername;
          var seatnum     = obj.seatnum;

          // get current time
          var cts = moment().tz('Asia/Tokyo').format('YYYY-MM-DD HH:mm:ss').toString();

          if (paymentId == '0') {
            /* get time diff */
            var ts  = obj['DATE_FORMAT(ts, "%Y-%m-%d %H:%i:%s")'];

            /*
              get Date Object from String
            */
            var oldTsDate     = new Date(Date.parse(ts.replace('-','/','g')));
            var curTsDate     = new Date(Date.parse(cts.replace('-','/','g')));
            var diff = curTsDate - oldTsDate;
            /*
              FINALLY get the difference of minutes
            */
            var minutes = Math.floor((diff/1000)/60);

            var sql = 'UPDATE members SET seat="0", ts=NULL, fints=NULL, seatnum="0", pause="0", enterance="0", milage=IF(milage-?>0, milage-?, 0), seat_floor=NULL, break=0 WHERE alias=?';
            conn.query(sql, [minutes*800, minutes*800, data.alias], function(err, results) {
              if (err) {
                console.log(err);
                cb(new Error('query error'));
              }
              else {
                // also update history
                var sql = 'INSERT INTO history (ts, job, alias, seatnum, membername) VALUES (DATE_FORMAT("'+cts+'", "%Y-%m-%d %H:%i:%s"), 3, ?, ?, ?)';
                conn.query(sql, [data.alias, seatnum, membername], function(err, results) {
                  if (err) {
                    console.log(err);
                    cb(new Error('query error'));
                  }
                  else {
                    cb(null, {err: "0"});
                  }
                });
              }
            })

          }
          else {
            var sql = 'UPDATE members SET seat="0", ts=NULL, fints=NULL, seatnum="0", pause="0", enterance="0", seat_floor=NULL, break=0 WHERE alias=?';
            conn.query(sql, [data.alias], function(err, results) {
              if (err) {
                console.log(err);
                cb(new Error("query error"));
              }
              else {
                // also update history
                var sql = 'INSERT INTO history (ts, job, alias, seatnum, membername) VALUES (DATE_FORMAT("'+cts+'", "%Y-%m-%d %H:%i:%s"), 3, ?, ?, ?)';
                conn.query(sql, [data.alias, seatnum, membername], function(err, results) {
                  if (err) {
                    console.log(err);
                    cb(new Error('query error'));
                  }
                  else {
                    cb(null, {err: "0"});
                  }
                });
              }
            })
          }
        }
      });
    },

    /*
      getPauseTs
    */
    getPauseTs: function(alias, cb) {
      console.log('this is getPauseTs');
      var sql = 'SELECT alias, DATE_FORMAT(ts, "%Y-%m-%d %H:%i") FROM pause_table WHERE alias=? AND mask=1';
      conn.query(sql, [alias], function(err, results) {
        if (err) {
          console.log(err);
          cb(new Error('query error'));
        }
        else {
          var tmp = results[0];
          if (results.length > 1) {
            return cb(null, {err: "1"}); /* querying result is not 1*/
          }
          else if(results.length == 0) {
            cb(null, {err: "0", pts: null})
          }
          else {
            cb(null, {err: "0", pts: tmp['DATE_FORMAT(ts, "%Y-%m-%d %H:%i")']});
          }
        }
      });
    },
    getSomeoneHistory: function(data, cb) {
      var membername, alias, startDate, endDate;
      membername = data.membername;
      alias = data.alias;
      startDate = data.startDate + " 00:00:00";
      endDate = data.endDate+" 23:59:59";

      var sql = 'SELECT DATE_FORMAT(ts, "%Y-%m-%d %H:%i"), seatnum, job FROM history WHERE ((ts BETWEEN STR_TO_DATE(?, "%Y-%m-%d %H:%i:%s") AND STR_TO_DATE(?, "%Y-%m-%d %H:%i:%s")) AND membername=? AND alias=?) ORDER BY ts DESC';
      conn.query(sql, [startDate, endDate, membername, alias], function(err, results) {
        if (err) {
          console.log(err);
          cb(new Error('query error'));
        }
        else {
          cb(null, {err: "0", results: results});
        }
      });
    },

    getHistroy: function(cb) {
      // handle last element
      var date = moment();
      date = date.format('YYYY-MM-DD').toString();
      date += " 00:00:00";
      var tmp = new Date();
      var prevDate = new Date(tmp.getTime() - 86400000);
      prevDate = moment(prevDate).format('YYYY-MM-DD').toString();
      prevDate += " 05:00:00";

      var newDate = new Date(tmp.getTime() + 86400000);
      newDate = moment(newDate).format('YYYY-MM-DD').toString();
      newDate += " 23:59:59";

      var sql = 'SELECT DATE_FORMAT(ts, "%Y-%m-%d %H:%i"), alias, job, seatnum, membername FROM history WHERE (ts BETWEEN STR_TO_DATE(?, "%Y-%m-%d %H:%i:%s") AND STR_TO_DATE(?, "%Y-%m-%d %H:%i:%s")) ORDER BY ts DESC';
      conn.query(sql, [prevDate, newDate], function(err, results) {
        if (err) {
          console.log(err);
          cb(new Error('query error'));
        }
        else {
          cb(null, {err: "0", results: results});
        }
      });
    }
  }
};
