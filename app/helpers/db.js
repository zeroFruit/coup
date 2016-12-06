const sformat         = require('string-format');
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
/***************************************************************************************
  What should be fixed.

    1. make respond function which deals with error handling

    2. When this app is in production, modify the logging

    3. db utils related with users/client should move to another module 'models/Users'

***************************************************************************************/
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

        var user = results[0]; /* query success */
        return hasher({password:password, salt:user.salt}, function(err, pass, salt, hash) {
          if(hash === user.hash) {
            console.log('LocalStrategy', user);
            cb(null, user);
          }
          else {
            cb(null, false);
          }
        });
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
      if(!data.refreshToken)
        return cb(new Error('invalid token'));
      var sql = "SELECT * FROM clients WHERE refreshToken='"+ data.refreshToken +"'";

      conn.query(sql, function(err, results) {
        if(err) {
          console.log(err);
          cb(err);
        }
        else {
          console.log(results[0]);
          return cb(null,
            { username: results[0].username }
          );
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
      //test
      console.log('this is addToList');
      console.log(data);

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
        return cb(null, {err: "3"});
      }
      else {
        var alias = phonenum.substring(3);
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
          console.log(results);
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
      var sql = 'SELECT membername, payment, milage, seatnum, alias, pause, enterance, sex, memo, leftDay, prepare, DATE_FORMAT(ts, "%Y-%m-%d %H:%i"), DATE_FORMAT(fints, "%Y-%m-%d %H:%i") FROM members';
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
      console.log(data);
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
          console.log('query results');
          console.log(results[0]);
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
          console.log(results[0]);
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
          console.log(results[0]);
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
      console.log(data);
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
            console.log('incorrect pwd error');
            return cb(null, {err: "2"});
          }
          /* this IF is executed if member who tries to enter is unregistered */
          else if (results[0].payment === null) {
            console.log('unregistered member');
            return cb(null, {err: "3"});
          }
          /* check if already entered */
          else if (results[0].enterance === "1") {
            console.log('you already entered');
            return cb(null, {err: "4"});
          }
          else if (results[0].leftDay === 0 && results[0].payment != "14" && results[0].payment != "0") { // free user can access
            console.log('you spend all the time');
            return cb(null, {err: "5"});
          }
          /* stop member should not come here */
          else if(results[0].stop === 1) {
            console.log('you should first change your stop mask');
            return cb(null, {err: "6"});
          }
          /* if user who is prepay member dont have milage than abort */
          else if(results[0].payment === '0' && results[0].milage <= 0) {
            console.log('you are prepay member but no milage, abort');
            return cb(null, {err: "7"});
          }
          // else if() {
          //
          // }
          else {
            console.log('this is enter');
            console.log(results);
            cb(null,
              {
                err: "0",
                alias: data.ecid,
                do: "enter",
                paymentid: results[0].payment,
                leftTime: results[0].leftTime.toString()
              });
          }
        }
      });
    },
    /*
      takeSeat
    */
    takeSeat: function(data, cb) {
      /*
        data.paymentid
      */
      var paymentid = data.paymentid;
      var leftTime  = data.leftTime;

      /* free user */
      if (paymentid === '14') {
        var sql = 'UPDATE members SET enterance=?, seat=?, seatnum=?, seat_floor=?, ts=CURRENT_TIMESTAMP WHERE alias=?';
        conn.query(sql, ["1", data.seatid, data.seatnum, data.floorid, data.alias], function(err, results) {
          if (err) {
            console.log(err);
            cb(new Error('query error'));
          }
          else {
            cb(null, {success: '1'});
          }
        });
      }
      /* this need to set fints */
      if (paymentid === '0' || paymentid === '2' || paymentid === '4' || paymentid === '5' || paymentid === '6'
        || paymentid === '8' || paymentid === '9' || paymentid === '10' || paymentid === '11') {
          var sql = 'UPDATE members SET enterance=?, seat=?, seatnum=?, seat_floor=?, ts=CURRENT_TIMESTAMP, fints = DATE_ADD(CURRENT_TIMESTAMP, INTERVAL ? MINUTE) WHERE alias=?';
          conn.query(sql, ["1", data.seatid, data.seatnum, data.floorid, parseInt(leftTime), data.alias], function(err, results) {
            if(err) {
              console.log(err);
              cb(new Error("query error"));
            }
            else {
              console.log('this is takeseat with fin ts set');
              console.log(results);
              cb(null, {success: '1'});
            }
          });
      }
      /* this don't need to set fints => but need to set limit 00:00 AM */
      else if (paymentid === '1' || paymentid === '3' || paymentid === '7' || paymentid === '12' || paymentid === '13' ) {
        var nextday = moment().tz('Asia/Tokyo').add(1, 'd').format('YYYY-MM-DD').toString();
        nextday = nextday + " 00:00:00"; /* get nextday 00:00:00 AM */

        var sql = 'UPDATE members SET enterance=?, seat=?, seatnum=?, seat_floor=?, ts=CURRENT_TIMESTAMP, fints=STR_TO_DATE(?, "%Y-%m-%d %H:%i:%s") WHERE alias=?';
        conn.query(sql, ["1", data.seatid, data.seatnum, data.floorid, nextday, data.alias], function(err, results) {
          if(err) {
            console.log(err);
            cb(new Error("query error"));
          }
          else {
            console.log('this is takeseat');
            console.log(results);
            cb(null, {success: '1'});
          }
        });
      }
    },

    /*
      getSeatInfo
    */
    getSeatInfo: function(cb) {
      var sql = 'SELECT seat, payment, memo, seat_floor FROM members';
      conn.query(sql, function(err, results) {
        if(err) {
          console.log(err);
          cb(new Error("query error"));
        }
        else {
          console.log('this is get seat info db');
          console.log(results);
          cb(null, results);
        }
      })
    },
    /*
      Leave
        1. get the old timestamp
        2. update the old timestamp and enterance mark with 0
        3. get the new timestamp
    */
    Leave: function(data, cb) {
      //var retval = {};
      //retval.oldts;
      //retval.newts = {};
      /* before get data, check whether form data is valid */
      var sql = 'SELECT membername, password, enterance, payment FROM members WHERE alias=?'; /* first check the existence of member*/
      console.log(data);
      conn.query(sql, [data.lcid], function(err, results) {
        if(err) {
          console.log(err);
          cb(new Error('query error'));
        }
        if (results.length === 0) {
          /* It means there's no matching member */
          return cb(null, {err: "1"});
        }
        else if (results[0].password !== data.lcpwd) {
          console.log('incorrect pwd error');
          return cb(null, {err: "2"});
        }
        /* check if already exited */
        else if (results[0].enterance === "0") {
          console.log('you already exit');
          return cb(null, {err: "3"});
        }
        else {
          /*
            when matcing client is exist
          */


          /*
            if the use is prepay user, when he/she tries to exit then we should update the milage and left time
          */
          if (results[0].payment === "0") {
            var sql = 'SELECT DATE_FORMAT(ts, "%Y-%m-%d %H:%i:%s") FROM members WHERE alias=?';
            conn.query(sql, [data.lcid], function(err, results) {
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
                var currentTsStr = moment().tz('Asia/Tokyo').format('YYYY-MM-DD HH:mm:ss').toString();
                /*
                  get Date Object from String
                */
                var oldTsDate     = new Date(Date.parse(oldTsStr.replace('-','/','g')));
                var curTsDate     = new Date(Date.parse(currentTsStr.replace('-','/','g')));
                var diff = curTsDate - oldTsDate;
                /*
                  FINALLY get the difference of minutes
                */
                var minutes = Math.floor((diff/1000)/60);
                var hour = parseInt(minutes / 60);
                var over = minutes % 60;
                if (over > 10) {
                  hour = hour + 1;
                }
                var fee = hour * 800;
                /*
                  Then with MINUTES update member data
                */
                var sql = 'UPDATE members SET leftTime = leftTime - ?, milage = milage - ?, enterance="0", seat="0", seatnum="0", seat_floor=NULL, ts=NULL, fints=NULL, pause="0" WHERE alias = ?';
                conn.query(sql, [minutes, fee, data.lcid], function(err, results) {
                  if(err) {
                    cb(new Error('query error'));
                  }
                  else {
                    cb(null, {err: "0", alias: data.lcid, do: "leave"});
                  }
                })
              }
            });
          }
          /*
            He/She is not prepay payment member
          */
          else {
            var sql = 'UPDATE members SET enterance="0", seat="0", seatnum="0", seat_floor=NULL, ts=NULL, fints=NULL, pause="0" WHERE alias=? AND password=?';
            conn.query(sql, [data.lcid, data.lcpwd], function(err, results) {
              if(err) {
                cb(new Error('query error'));
              }
              else {
                console.log('this is leave');
                console.log(results);
                cb(null, {err: "0", alias: data.lcid, do: "leave"});
              }
            });
          }
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
      /*
        before doing something first auth the member
      */
      var sql = 'SELECT membername, password, enterance, payment FROM members WHERE alias=?'; /* first check the existence of member*/
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
          payment = results[0].payment;
          console.log('payment: ' + payment);
          /*
            when matcing client is exist, first insert into pause_table
          */

          var sql = 'SELECT DATE_FORMAT(ts, "%Y-%m-%d %H:%i:%s"), DATE_FORMAT(fints, "%Y-%m-%d %H:%i:%s"), pause FROM members WHERE alias=?';
          conn.query(sql, [data.pcid, data.pcpwd], function(err, results) {
            if(err) {
              cb(new Error('query error'));
            }
            else {
              console.log('this is pause');
              console.log(results);
              var resultObj = results[0];
              isPause = resultObj.pause;

              /*
                free user
              */
              if (payment == "14") {
                if (isPause == "0") {
                  var sql = 'UPDATE members SET pause=?, ts=CURRENT_TIMESTAMP WHERE alias=?';
                  conn.query(sql, ["1", data.pcid], function(err, results) {
                    if (err) {
                      return cb(new Error('query error'));
                    }
                    else {
                      /* succeed at pause */
                      console.log('success pause');
                      var sql = 'INSERT INTO pause_table (alias, mask) VALUES (?, 1)';
                      conn.query(sql, [data.pcid], function(err, results) {
                        if (err) {
                          cb(new Error('query error'));
                        }
                        else {
                          return cb(null, {err: "0", alias: data.pcid, do: "pause"})
                        }
                      });
                    }
                  });
                }
                else if(isPause == "1") {
                  console.log('hello');
                  var sql = 'UPDATE members SET pause=?, ts=CURRENT_TIMESTAMP WHERE alias=?';
                  conn.query(sql, ["0", data.pcid], function(err, results) {
                    if (err) {
                      return cb(new Error('query error'));
                    }
                    else {
                      /*
                        succeed at reuse
                        then we should erase pause_table record -> set=0
                      */
                      var sql = 'UPDATE pause_table SET mask=0 WHERE alias=? AND mask=1';
                      conn.query(sql, [data.pcid], function(err, results) {
                        if (err) {
                          console.log(err);
                          return cb(new Error('query error'));
                        }
                        return cb(null, {err: "0", alias: data.pcid, do: "reuse"});
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
                  var sql = 'UPDATE members SET pause=?, ts=CURRENT_TIMESTAMP WHERE alias=?';
                  conn.query(sql, ["1", data.pcid], function(err, results) {
                    if(err) {
                      cb(new Error('query error'));
                    }
                    else {

                      var sql = 'INSERT INTO pause_table (alias, mask) VALUES (?, 1)';
                      conn.query(sql, [data.pcid], function(err, results) {
                        if (err) {
                          cb(new Error('query error'));
                        }
                        else {
                          return cb(null, {err: "0", alias: data.pcid, do: "pause"})
                        }
                      });
                    }
                  });
                }
                  /*
                    Now trying to reuse
                  */
                else if (isPause === "1") {
                  /*
                    If trying to reuse, we need to recalculate the fin ts
                  */
                  oldTsStr     = resultObj['DATE_FORMAT(ts, "%Y-%m-%d %H:%i:%s")'];
                  oldfinTsStr  = resultObj['DATE_FORMAT(fints, "%Y-%m-%d %H:%i:%s")'];
                  currentTsStr = moment().tz('Asia/Tokyo').format('YYYY-MM-DD HH:mm:ss').toString();
                  /*
                    get Date Object from String
                  */
                  var oldTsDate     = new Date(Date.parse(oldTsStr.replace('-','/','g')));
                  var oldfinTsDate  = new Date(Date.parse(oldfinTsStr.replace('-','/','g')));
                  var curTsDate     = new Date(Date.parse(currentTsStr.replace('-','/','g')));
                  var diff = curTsDate - oldTsDate;
                  /*
                    FINALLY get the difference of minutes
                  */
                  var minutes = Math.floor((diff/1000)/60);
                  /*
                    But if client use monthly or half-monthly payment fints is always next day 00:00:00 AM
                  */
                  if (payment === '1' || payment === '3' || payment === '7' || payment === '12' || payment === '13' )
                    diff = 0;

                  /*
                    before add diff, check first whether total date not go next day!
                  */
                  var newfinTsDate  = new Date(oldfinTsDate.getTime() + diff);
                  if (newfinTsDate.getDay() != oldfinTsDate.getDay()) { /* if day is changed, set limit fints to next day 00:00 */
                    newfinTsDate.setDate(oldfinTsDate.getDate() + 1);
                    newfinTsDate.setHours(0, 0, 0);
                  }


                  var newfinTsStr = moment(newfinTsDate).format('YYYY-MM-DD HH:mm:ss').toString();
                  var sql = 'UPDATE members SET pause=?, ts=CURRENT_TIMESTAMP, fints=STR_TO_DATE(?, "%Y-%m-%d %H:%i:%s") WHERE alias=?';
                  conn.query(sql, ["0", newfinTsStr, data.pcid], function(err, results) {
                    if(err) {
                      cb(new Error('query error'));
                    }
                    else {
                      /* succeed at pause */
                      var sql = 'INSERT INTO pause_table (alias, mask) VALUES (?, 0)';
                      conn.query(sql, [data.pcid], function(err, results) {
                        if (err) {
                          cb(new Error('query error'));
                        }
                        else {
                          /*
                            succeed at reuse
                            then we should erase pause_table record -> set=0
                          */
                          var sql = 'UPDATE pause_table SET mask=0 WHERE alias=? AND mask=1';
                          conn.query(sql, [data.pcid], function(err, results) {
                            if (err) {
                              console.log(err);
                              return cb(new Error('query error'));
                            }
                            return cb(null, {err: "0", alias: data.pcid, do: "reuse"});
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
    */
    checkPause: function(cb) {
      console.log('hello');
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
            var tsStr = obj['DATE_FORMAT(ts, "%Y-%m-%d %H:%i:%s")'];
            var tsObj = new Date(Date.parse(tsStr.replace('-','/','g')));
            var tsCur = moment().tz('Asia/Tokyo').format('YYYY-MM-DD HH:mm:ss').toString();
            var diff = Math.abs(tsCur - tsObj);

            var minutes = Math.floor((diff/1000)/60);

            console.log(minutes);

            if (minutes > 60) {
              uptList.push(obj.alias);
              pauseStartDate.push(tsObj);
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
                var sql = 'SELECT alias, payment, DATE_FORMAT(ts, "%Y-%m-%d %H:%i:%s") FROM members WHERE '+mem;
                conn.query(sql, function(err, results) {
                  if (err) {
                    return cb(new Error('query error'));
                  }
                  else {
                    for (var i = 0; i < results.length; i++) {
                      var obj     = results[i];
                      var alias   = obj.alias;
                      var payment = obj.payment;

                      if (payment === "0") { // in the case of prepay we should reduce milage
                        /*
                          important! length of results and pauseStartDate is same
                          so we can use same index
                        */
                        var tsStr   = obj['DATE_FORMAT(ts, "%Y-%m-%d %H:%i:%s")'];
                        var tsDate  = new Date(Date.parse(tsStr.replace('-','/','g')));
                        var diff    = pauseStartDate[i] - tsDate;

                        var minutes = Math.floor((diff/1000)/60);
                        /* this member status is changed as left */
                        var sql = 'UPDATE members SET leftTime=leftTime-?, milage=milage-?, enterance="0", seat="0", seatnum="0", seat_floor=NULL, ts=NULL, fints=NULL, pause="0" WHERE alias=?';
                        conn.query(sql, [minutes, (minutes*13), alias], function(err, results) {
                          if (err) {
                            return cb(new Error('query error'));
                          }
                          else {
                            cb(null, {err:"0"});
                          }
                        });
                      }
                      else {
                        var sql = 'UPDATE members SET enterance="0", seat="0", seatnum="0", seat_floor=NULL, ts=NULL, fints=NULL, pause="0" WHERE alias=?';
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

    /*
      protectQS
    */
    protectQS: function(data, cb) {
      console.log('this is db protectQS');
      console.log(data);
      var sql = 'SELECT payment, leftTime FROM members WHERE alias=?';
      conn.query(sql, [data.alias], function(err, results) {
        if(err) {
          cb(new Error('query error'));
        }
        else {
          console.log(results);
          if (results[0].payment !== data.pid || results[0].leftTime.toString() !== data.lt) { /* leftTime is integer */
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
      var sql = 'UPDATE members SET membername=?, sex=?, prepare=?, memo=? WHERE alias=?';
      conn.query(sql, [data.membername, sex, data.prepare, data.memo, data.id], function(err, results) {
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
      if (data.night == true) {
        night = 1;
      }

      /*
        first we need to check whether that member exist
      */
      var sql = 'SELECT membername FROM members WHERE alias=?';
      conn.query(sql, [alias], function(err, results) {
        if (err) {
          console.log(err);
          cb(new Error('query error'));
        }
        else {
          console.log('updateList');
          console.log(results);
          console.log(results.length);
          if (results.length === 0) {
            return cb(null, {err: "2"});
          }
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
                    console.log(results);
                    var pid = results[0].payment;

                    if (pid != "0" && pid != null) {
                      return cb(null, {err: "1"}); /* still using other payment */
                    }

                    var oldMilages = Number(results[0].milage);
                    var newMilages = Number(data.price) + oldMilages; /* Now we get new milages*/
                    var newLeftTime = "" + Math.round((Number(data.price) / 800) * 60); /* Now update left time */
                    console.log(oldMilages);
                    console.log(newMilages);
                    var sql = 'UPDATE members SET milage=?, payment=?, leftTime=?, leftDay=?, night=? WHERE alias=?';
                    conn.query(sql, [newMilages, data.paymentId, newLeftTime, leftDay, night, alias], function(err, results) {
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
                monthly
              */
              else if (data.type === 'monthly') {
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
                halfmonthly
              */
              else if (data.type === 'halfmonthly') {
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
                night
              */
              else if (data.type === 'night') {
                var sql = 'UPDATE members SET payment=?, leftTime=?, leftDay=?, night=?WHERE alias=?';
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
                special
              */
              else if (data.type === 'special') {
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
          console.log(stopMem);
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
      console.log(data.mindate);
      console.log(data.maxdate);
      var fullmindate = data.mindate + " 00:00:00";
      var fullmaxdate = data.maxdate + " 23:59:59";
      console.log(fullmindate);
      console.log(fullmaxdate);
      var sql = 'SELECT id, DATE_FORMAT(ts, "%Y-%m-%d"), content, ep, price, service FROM account WHERE ts BETWEEN STR_TO_DATE(?, "%Y-%m-%d %H:%i:%s") AND STR_TO_DATE(?, "%Y-%m-%d %H:%i:%s")';
      conn.query(sql, [fullmindate, fullmaxdate], function(err, results) {
        if(err) {
          console.log(err);
          cb(new Error('query error'));
        }
        else {
          console.log('this is viewlist db');
          console.log(results);
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
      /*
        data.membername, data.milage
      */
      /* before update milage, first check whether that client exist */
      var sql = 'SELECT milage FROM members WHERE alias=?';
      conn.query(sql, [data.membername], function(err, results) {
        if (err) {
          console.log(err);
          cb(new Error('query error'));
        }
        else {
          /* check the data*/
          console.log('this is useMilage');
          console.log(results);

          var useMilage = parseInt(data.milage)
          if (results[0].milage < useMilage) { /* In the case when client wants to use milage more than he/she has */
            return cb(null, {err: "1"});
          }
          else {
            var reducedMilage = results[0].milage - useMilage;

            var sql = 'UPDATE members SET milage=? WHERE alias=?';
            conn.query(sql, [reducedMilage, data.membername], function(err, results) {
              if (err) {
                console.log(err);
                cb(new Error('query error'));
              }
              else {
                /*
                  insert into stock table
                */
                var sql = 'INSERT INTO stockList (content, spending, price) VALUES (?, 1, ?)';
                conn.query(sql, [data.content, parseInt(data.milage)], function(err, results) {
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
      var alias = data.membername;
      if (alias.length !== 8 || Number.isInteger(alias)) {
        return cb(null, {err: "1"}); /* alias format err */
      }
      else if (!Number.isInteger(parseInt(data.milage))){
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
              conn.query(sql, [parseInt(data.milage), alias], function(err, results) {
                if (err) {
                  console.log(err);
                  cb(new Error('query error'));
                }
                else {
                  /*
                    insert into stockList
                  */
                  console.log('chargemilage');
                  console.log(data);
                  var sql = 'INSERT INTO stockList (content, income, price) VALUES (?, 1, ?)';
                  console.log(sql);
                  conn.query(sql, [data.content, parseInt(data.milage)], function(err, results) {
                    if (err) {
                      console.log(err);
                      cb(new Error('query error'));
                    }
                    else {
                      console.log('success charge milage');
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
      /*
        data.reserveDate
      */
      var dateStart = data.reserveDate + " 00:00:00";
      var dateEnd   = data.reserveDate + " 23:59:59";

      var sql = 'SELECT room, users, purpose, duration, start, DATE_FORMAT(tsStart, "%Y-%m-%d"), DATE_FORMAT(tsEnd, "%Y-%m-%d") FROM studyroom WHERE ts BETWEEN STR_TO_DATE(?, "%Y-%m-%d %H:%i:%s") AND STR_TO_DATE(?, "%Y-%m-%d %H:%i:%s")';
      conn.query(sql, [dateStart, dateEnd], function(err, results) {
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
    },

    /*
      reserveStudyRoom
    */
    reserveStudyRoom: function(data, cb) {
      var users       = data.users;
      var purpose     = data.purpose;

      var duration    = data.du;
      var rdsStr      = data.rds.toString() + " 00:00:01"; var rdsDate = new Date(Date.parse(rdsStr.replace('-','/','g')));
      var rdeStr      = data.rde.toString() + " 00:00:01"; var rdeDate = new Date(Date.parse(rdeStr.replace('-','/','g')));

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
          console.log(results);

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
          for (var i = 0; i < results.length; i++) {
            var booked = results[i]; /* float, integer */
            if (booked.start < fstartHour && (booked.start + booked.duration) > fstartHour ) {
              return cb(null, {err : "2"});
            }
            else if (booked.start < fendHour && (booked.start + booked.duration) > fendHour ) {
              return cb(null, {err :"2"});
            }
            else if (fstartHour < booked.start && fendHour > (booked.start + booked.duration) ) {
              return cb(null, {err : "2"});
            }
          }
          /*
            Then make query INSERT data
          */
          var insertData = "";
          for (var i = 0; i < daydiff; i++) {
            var newDate = new Date(rdsDate.getTime() + i * 86400000);
            var date = moment(newDate);
            date = date.format('YYYY-MM-DD').toString();
            date += " 00:00:01";
            insertData += '(STR_TO_DATE("'+date+'", "%Y-%m-%d %H:%i:%s"), '+fstartHour+', '+fduration+', '+roomNum+',"'+users+'", "'+purpose+'", STR_TO_DATE("'+rdsStr+'", "%Y-%m-%d %H:%i:%s"), STR_TO_DATE("'+rdeStr+'", "%Y-%m-%d %H:%i:%s")), ';
          }
          // handle last element
          var newDate = new Date(rdsDate.getTime() + daydiff * 86400000);
          var date = moment(newDate);
          date = date.format('YYYY-MM-DD').toString();
          date += " 00:00:01";
          insertData += '(STR_TO_DATE("'+date+'", "%Y-%m-%d %H:%i:%s"), '+fstartHour+', '+fduration+', '+roomNum+', "'+users+'", "'+purpose+'", STR_TO_DATE("'+rdsStr+'", "%Y-%m-%d %H:%i:%s"), STR_TO_DATE("'+rdeStr+'", "%Y-%m-%d %H:%i:%s"));';

          console.log('insertData');
          console.log(insertData);
          /* Now reservation time is valid */
          var sql = 'INSERT INTO studyroom (ts, start, duration, room, users, purpose, tsStart, tsEnd) VALUES ' + insertData;
          conn.query(sql, function(err, results) {
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

            console.log('old rds/rde');
            console.log(oldRdsStr + " " + oldRdeStr);

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
                    console.log('select result: '+ results.length);
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
                          tmp += " 00:00:01";

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
                          tmp += " 00:00:01";

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
                      console.log('prevQS ' + prevQS);


                      var nextQS = "";
                      if (next.length == 0) { nextQS += 0; }
                      else {
                        for (var i = 0; i < next.length-1; i++) {
                          nextQS += next[i] += ", ";
                        }
                        nextQS += next[next.length-1];
                      }


                      console.log('nextQS ' + nextQS);

                      var sql = 'UPDATE studyroom SET tsStart = DATE(STR_TO_DATE("'+prevNewRdsStr+'", "%Y-%m-%d %H:%i:%s")), tsEnd = DATE(STR_TO_DATE("'+prevNewRdeStr+'", "%Y-%m-%d %H:%i:%s")) WHERE id IN ('+prevQS+')';
                      console.log(sql);
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
                          })
                        }
                      });
                    }
                  }
                });
              }
            });
          }
        }
      });
    },

    clientStudyRoomState: function(data, cb) {
      /*
        data.reserveDate
      */
      var dateStart = moment().tz('Asia/Tokyo').format('YYYY-MM-DD').toString() + " 00:00:00";
      var dateEnd   = moment().tz('Asia/Tokyo').format('YYYY-MM-DD').toString() + " 23:59:59";

      var sql = 'SELECT * FROM studyroom WHERE ts BETWEEN STR_TO_DATE(?, "%Y-%m-%d %H:%i:%s") AND STR_TO_DATE(?, "%Y-%m-%d %H:%i:%s")';
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
      if (data.milage == "") milage = 0;
      else                   milage = parseInt(data.milage);

      var sql = 'UPDATE members SET payment=NULL, leftDay=0, milage=milage+?, leftTime=0 WHERE id=?';
      conn.query(sql, [milage, data.id], function(err, result) {
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

      var sql = 'UPDATE members SET stop=IF(stop=0, 1, 0) WHERE id=?';
      conn.query(sql, [data.id], function(err, result) {
        if (err) {
          console.log(err);
          cb(new Error('query error'));
        }
        else {
          var sql = 'SELECT stop FROM members WHERE id=?';
          conn.query(sql, [data.id], function(err, result) {
            console.log(result);
            var isStop = result[0].stop;
            cb(null, {err: "0", do: isStop});
          });
        }
      });
    },

    vacantSeat: function(data, cb) {
      /*
        first select member payment, if that member is prepay member get the ts and get min diff
      */
      console.log(data);
      var sql = 'SELECT payment, DATE_FORMAT(ts, "%Y-%m-%d %H:%i:%s") FROM members WHERE alias=?';
      conn.query(sql, [data.alias], function(err, results) {
        if (err) {
          console.log(err);
          cb(new Error('query error'));
        }
        else {
          var obj = results[0];
          var paymentId = obj.payment;

          if (paymentId == '0') {
            /* get time diff */
            var ts  = obj['DATE_FORMAT(ts, "%Y-%m-%d %H:%i:%s")'];
            var cts = moment().tz('Asia/Tokyo').format('YYYY-MM-DD HH:mm:ss').toString();

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

            var sql = 'UPDATE members SET seat="0", ts=NULL, fints=NULL, seatnum="0", pause="0", enterance="0", milage=IF(milage-?>0, milage-?, 0), seat_floor=NULL WHERE alias=?';
            conn.query(sql, [minutes*800, minutes*800, data.alias], function(err, results) {
              if (err) {
                console.log(err);
                cb(new Error('query error'));
              }
              else {
                cb(null, {err: "0"});
              }
            })

          }
          else {
            var sql = 'UPDATE members SET seat="0", ts=NULL, fints=NULL, seatnum="0", pause="0", enterance="0", seat_floor=NULL WHERE alias=?';
            conn.query(sql, [data.alias], function(err, results) {
              if (err) {
                console.log(err);
                cb(new Error("query error"));
              }
              else {
                cb(null, {err: "0"});
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
      var sql = 'SELECT alias, DATE_FORMAT(ts, "%Y-%m-%d %H:%i") FROM pause_table WHERE alias=? AND mask=1';
      conn.query(sql, [alias], function(err, results) {
        if (err) {
          console.log(err);
          cb(new Error('query error'));
        }
        else {
          var tmp = results[0];
          console.log('db');
          console.log(results);
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
    }
  }
};
