/*
  test

    * Protected page (common property except 'auth')
      If you are admin, you can reach here.
      To ensure that only admin can access this page, will include jwtauth.
      This module protect the route; checking token and auth with db

    * About
      This is for testing modules

*/
var jwtauth     = require('../middlewares/jwtauth');
var requireAuth = require('../middlewares/requireAuth');
var respond     = require('../helpers/respond');
var utils       = require('../helpers/utils');
var express     = require('express');

// test module
var member      = require('../models/member');


module.exports.set = function(app, passport) {
  /*
    /test (GET)
  */
  // app.get('/test',/* jwtauth, requireAuth,*/ function(req, res, next) {
  //   res.render('test');
  // });
  //
  // app.post('/test/account', function(req, res, next) {
  //   res.render('account_manage');
  // });

  app.post('/test/manage', function(req, res, next) {
    res.render('test');
  });


  app.post('/test', function(req, res, next) {
    member.updateMemberInfo(req, res, next);
  },
  function(req, res, next) {
    if(req.member) {
      console.log(req.member);
      res.send('success');
    }
    else
      res.send('failed');
  });

  /* TEST */
  app.post('/getdb', function(req, res, next) {
    var sig = req.body.getdb;
    console.log(sig);

    if (sig === '1') {
      /*
        In addition to #sig we should send the row info, i.e membername, seatnum, payment in req.body
      */
      req.body.membername = 'member';
      console.log('this is update signal');
      member.getMemberInfo(req, res, next);
    }
    else if (sig === '2') {
      /*
        In addition to #sig we should send the membername, password in req.body
      */
      req.body.membername = 'member';
      req.body.password = 'pwd33';
      console.log('this is remove signal');
      member.deleteMember(req, res, next); /* req.member contains membername if success */
    }
    else {
      res.send('failed');
    }
  }, function(err, req, res, next) {
    if(err)
      res.status(500).send('no line affected');
    /*
      If there's error, reaches here
    */
    console.log('in the router');
    console.log(req.member);
    res.send(req.member);
  });


  /***********************************************************************************************

    NETWORKING NETWORKING NETWORKING NETWORKING NETWORKING NETWORKING
  ************************************************************************************************/
  /*
    1. Get member list test
  */
  var json = '';
  app.post('/network', function(req, res, next) {
    console.log(req.body);

    if (req.body.request === 0) {
      member.getMemberList(req, res, next);
      /*
        if succeed, req.member contains member list.
      */
      // console.log('<Router>');
      // var json = JSON.stringify(req.member);
      // console.log('<Json>');
      // console.log(json);
      //
      // return res.send(json);
    }
    else if (req.body.request === 1) {
      // do something else
      member.getMemberList(req, res, next);
    }
    else {
      // error
      next();
    }

  }, function(req, res, next) {
    console.log('<Router>');
    json = JSON.stringify(req.member);
    console.log(json);

    return res.send(req.member);
  });


  /*
    2. Member password compare test
  */
  app.post('/network/auth', function(req, res, next) {
    console.log(req.body);
    if (req.body.request === 2) {
      member.getMemberInfo(req, res, next);
      /*
        If success, req.member contain that member's info

        next() is executed inside the member
      */
    }
  }, function(req, res, next) {
    console.log("<Router>");
    var inputpass;
    var retpack;
    /*
    data validation */
    if(req.body.inputpass) {
      inputpass = req.body.inputpass;
    }
    else {
      console.log('inputpass is empty');
    }

    /*
    Now compare the password */
    if (inputpass === req.member.password) {
      console.log("inputpass is same");
      retpack = {compare: "true"};

      var json = JSON.stringify(retpack);
      res.writeHead(200, {"Content-type": "application/json"});
      return res.end(json);
    }
    /* else */
      console.log("different");
      retpack = {compare: "false"};

      var json = JSON.stringify(retpack);
      res.writeHead(200, {"Content-type": "application/json"});
      return res.end(json);

  });

  /*
    3. change enterance mark test, when enter
  */
  app.post('/network/enter', function(req, res, next) {
    console.log('enter');
    console.log(req.body);

    if(req.body.request === 3) {
      /* request code is correct */
      member.Enter(req, res, next);
    }
    else {
      // request is wrong
    }
  }, function(req, res, next) {
    var retpack;
    console.log('<Router>');

    retpack = {enterleave: "true"};
    var json = JSON.stringify(retpack);
    res.writeHead(200, {"Content-type": "application/json"});
    return res.end(json);
  });

  /*
    4. change enterance mark test, when leave
  */
  app.post('/network/leave', function(req, res, next) {
    console.log('leave');
    console.log(req.body);

    if (req.body.request === 4) {
      member.Leave(req, res, next);
    }
    else {
      // request is wrong
    }
  }, function(req, res, next) {
    var retpack;
    console.log('<Router>');
    var oldDateObj  = utils.tsFormater(utils.tsCreateFromMysql(req.ts.oldts));
    var newDateObj  = utils.tsFormater(utils.tsCreateFromMysql(req.ts.newts));
    var diffInMille = Math.abs(utils.tsCreateFromMysql(req.ts.oldts) - utils.tsCreateFromMysql(req.ts.newts));
    console.log(oldDateObj);
    console.log(newDateObj);
    var minutes = Math.floor((diffInMille/1000)/60);
    console.log(minutes);
    retpack = {
      enterleave: "true",
      oldts: oldDateObj,
      newts: newDateObj,
      used: minutes
    };
    var json = JSON.stringify(retpack);
    res.writeHead(200, {"Content-type": "application/json"});
    return res.end(json);
  });



  /*************************************************************************************
    TEST client page
  **************************************************************************************/


}
