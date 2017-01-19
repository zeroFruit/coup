/*
  clients

    * Protected page (common property except 'auth')
      If you are admin, you can reach here.
      To ensure that only admin can access this page, will include jwtauth.
      This module protect the route; checking token and auth with db

    * About
      This page is for clients who want to take seats
*/
var jwtauth     = require('../middlewares/jwtauth');
var requireAuth = require('../middlewares/requireAuth');
var member      = require('../models/member');
var rendering   = require('../models/renderingPage');
var system      = require('../models/system');
var respond     = require('../helpers/respond');
var express     = require('express');


module.exports.set = function(app, passport) {

  /*
    /clients/index (POST)

    client can take seats, protected by tokens and can be accessed through admin page
  */
  app.post('/clients/index',function(req, res, next) {
    console.log('this is clients/index post');
    next();
  }, function(req, res, next) {
    //res.render('clients_index');
    res.status(200).render('clients_index');
  });


  app.get('/clients/index',function(req, res, next) {
    console.log('this is clients/index get');
    next();
  }, jwtauth, requireAuth, function(req, res, next) {
    //res.render('clients_index');
    res.status(200).render('clients_index');
  });


  /*
    /clients/enter (POST)
  */
  app.post('/clients/enter', function(req, res, next) {
    res.render('clients_login', {enter: "1", leave: "0", pause: "0"});
  });

  /*
    /clients/leave (POST)
  */
  app.post('/clients/leave', function(req, res, next) {
    res.render('clients_login', {enter: "0", leave: "1", pause: "0"});
  });

  /*
    /clients/pause (POST)
  */
  app.post('/clients/pause', function(req, res, next) {
    res.render('clients_login', {enter: "0", leave: "0", pause: "1"});
  });

  /*
    /clients/studyroom (POST)
  */
  app.get('/clients/studyroom', function(req, res, next) {
    /*
      before rendering page, get the reservation data from db
    */
    //console.log(req.body); <-- there's no body params because of GET method
    system.clientStudyRoomState(req, res, next);

  }, function(req, res, next) {
    var retpack = req.results; /* retpack = { room1: ~, room2: ~, room3: ~ }*/
    var room1State = [];
    var room2State = [];
    var room3State = [];
    for (var i = 0; i < retpack.length; i++) {
      var schedule = retpack[i];
      if      (schedule.room == "1") room1State.push(schedule);
      else if (schedule.room == "2") room2State.push(schedule);
      else if (schedule.room == "3") room3State.push(schedule);
    }

    retpack = {};
    retpack.room1 = room1State;
    retpack.room2 = room2State;
    retpack.room3 = room3State;
    var json = JSON.stringify(retpack);
    console.log(json);
    res.render('clients_studyroom', { roomState: json });
  });

  /*
    /clients/return (POST)
  */
  app.post('/clients/return', function(req, res, next) {
    res.status(200).render('clients_index');
  });

  /*
    /clients/enter/auth (POST)

      this route is for authenticate the client when enter
  */
  app.post('/clients/enter/auth', function(req, res, next) {

    member.Enter(req, res, next);
  }, function(req, res, next) {
    /*
      error checking
    */
    if(req.member.err === "1") {
      //return res.send('member does not exist');
      respond.unregistered_member(req, res);
    }
    else if (req.member.err === "2") {
      //return res.send('password is wrong');
      respond.password_is_wrong(req, res);
    }
    else if(req.member.err === "3") {
      //return res.send('unregistered member');
      respond.unregistered_member(req, res);
    }
    else if(req.member.err === "4") {
      respond.already_entered_err(req, res);
    }
    else if(req.member.err === "5") {
      respond.spend_all_day(req, res);
    }
    else if(req.member.err === "6") {
      respond.stop_member_err(req, res);
    }
    else if(req.member.err === "7") {
      respond.lack_milage_err(req, res);
    }
    else {
      /* if success at auth, then get the seats info */
      // respond.client_auth_succ(req, res);
      next();
    }
  }, /*function(req, res, next) {
    member.getSeatInfo(req, res, next);
  },*/ function(req, res, next) {
    //console.log(req.seatinfo); /* print seat info */
    //respond.client_enter_succ(req, res);
    res.redirect('/clients/floor?alias='+req.member.alias+'&pid='+req.member.paymentid+'&lt='+req.member.leftTime+'&mn='+req.member.membername+'&n='+req.member.night+'&accumlateBreak='+req.member.accumlateBreak);
  });

  /*
    /clients/seats/:id

      service the map of the seat
  */
  app.get('/clients/floor', /* NEED SECURITY */ function(req, res, next) {
    if(req.query.alias === undefined || req.query.pid === undefined || req.query.lt === undefined) {
      return res.send('bad request');
    }
    member.protectQS(req, res, next); /* check if query string is dirty or not */
  }, function(req, res, next) {
    if(req.dirty.err === "1") {
      return res.send('bad request');
    }
    else {
      member.getSeatInfo(req, res, next);
    }
  }, function (req, res, next) {
    respond.client_enter_succ(req, res);
  });

  /*
    /clients/seatstate
  */
  app.get('/clients/seatstate', function(req, res, next) {
    member.getSeatInfo(req, res, next);
  }, function(req, res, next) {
    respond.client_seat_status(req, res);
  });

  /*
    /clients/seatstate-admin
  */
  app.post('/clients/seatstate-admin', function(req, res, next) {
    member.getSeatInfo(req, res, next);
  }, function(req, res, next) {
    respond.client_seat_status_admin(req, res);
  });

  /*
    /clients/seatchange
  */
  app.post('/clients/seatchange', function(req, res, next) {
    member.seatChange(req, res, next);
  }, function(req, res, next) {
    console.log(req.results.err);
    if (req.results.err == "0") {
      var json = JSON.stringify(req.results);
      res.send(json);
    }
  });
  /*
    /clients/leave/auth (POST)

      this route is for authenticate the client when leaving
  */
  app.post('/clients/leave/auth', function(req, res, next) {
    member.Leave(req, res, next);
  }, function(req, res, next) {
    /*
      error checking
    */
    if(req.member.err === "1") {
      return respond.unregistered_client(req, res);
      // should pass snackbar params
    }
    else if(req.member.err === "2") {
      return respond.client_incorrect_pwd(req, res);
      // should pass snackbar params
    }
    else if(req.member.err === "3") {
      return respond.already_exited(req, res);
      // should pass snackbar params
    }
    else {
      respond.client_leave_succ(req, res);
    }
  });

  /*
    /clients/pause/auth (POST)
  */
  app.post('/clients/pause/auth', function(req, res, next) {
    console.log('this is pause router');
    member.Pause(req, res, next);
  }, function(req, res, next) {
    /*
      error checking
    */
    if(req.member.err === "1") {
      respond.unregistered_client(req, res);
    }
    else if(req.member.err === "2") {
      respond.password_is_wrong(req, res);
    }
    else if(req.member.err === "3") {
      respond.even_not_entered(req, res);
    }
    else {
      respond.pause_reuse_succ(req, res);
    }
  });
  /*
    /clients/seat (POST)
  */
  app.post('/clients/seat', function(req, res, next) {
    /*
      now should update the db

        * req.body include floorid
    */
    member.takeSeat(req, res, next);
  }, function(req, res, next) {
    if(req.member.success !== "1")
      return res.send('error');
    res.render('clients_index', {client_entered_succ: "1"});
  });

  /*
    /clients/scheduler (POST)
  */
  app.post('/clients/scheduler', function(req, res, next) {
    //res.send('success');
    member.checkFinish(req, res, next);
  }, function(req, res, next) {
    respond.periodic_check(req, res);
  });

  /*
    /clients/pausechk
  */
  app.post('/clients/pausechk', function(req, res, next) {
    member.checkPause(req, res, next);
  }, function(req, res, next) {
    respond.periodic_pause_check(req, res);
  });

  /*
    /clients/pauseleave
  */
  app.post('/clients/pauseleave', function(req, res, next) {
    member.checkPauseLeave(req, res, next);
  }, function(req, res, next) {
    if (req.results.err === "0") {
      res.send(req.results.results);
    }
  });
  /*
    /clients/floor (POST)

      When client wants to view different floor seat
  */
  app.post('/clients/floor', function(req, res, next) {
    /* should prepare rendering source */
    member.getSeatInfo(req, res, next);
  },
  function(req, res, next) {
    console.log('this is client-floor');
    var floorNum = req.body.floornum;
    if(floorNum === "3") {
      respond.view_3f(req, res);
    }
    else if (floorNum === "4") {
      respond.view_4f(req, res);
    }
    else if (floorNum === "-1") {
      respond.view_b1(req, res);
    }
  });
}
