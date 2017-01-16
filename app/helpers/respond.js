/*
  respond

    * About
      This module basically deals with the server response
*/

module.exports = {
  /**************************************************************************************
  SYSTEM
  ***************************************************************************************/
  /*
    vacant-seat
  */
  vacant_seat: function(req, res) {
    res.send(req.err);
  },
  /*
    hold_on_off
  */
  hold_on_off: function(req, res) {
    console.log('##############');
    res.send(req.do.toString());
  },
  /*
    payback_succ
  */
  payback_succ: function(req, res) {
    res.send('success');
  },
  /*
    get_memberinfo_succ
  */
  get_memberinfo_succ: function(req, res) {
    var json = JSON.stringify(req.member);
    res.send(json);
  },
  /*
    delete_memberinfo_succ
  */
  delete_memberinfo_succ: function(req, res) {
    res.send('success');
  },
  /*
    modify_memberinfo_succ
  */
  modify_memberinfo_succ: function(req, res) {
    console.log('modify member info succ');
    res.send('success');
  },
  /*
    accountlist_delete_succ
  */
  accountlist_delete_succ: function(req, res) {
    console.log('accountlist delete succ');
    res.send('success');
  },

  /*
    err_ep
  */
  err_ep: function(req, res) {
    console.log('err ep');
    res.send('fail');
  },
  /*
    accountlist_update_succ
  */
  accountlist_update_succ: function(req, res) {
    console.log('update successfully');
    res.send('success');
  },

  /*
    booked_succ
  */
  book_succ: function(req, res) {
    console.log('booked successfully');
    var retpack = JSON.stringify(req.reserve); /* {err: '0'} */
    res.send(retpack);
  },

  /*
    already_booked
  */
  already_booked: function(req, res) {
    console.log('already booked :(');
    var retpack = JSON.stringify(req.reserve); /* {err: '2' } */
    res.send(retpack);
  },

  /*
    incorrect_booking
  */
  incorrect_booking: function(req, res) {
    var retpack = JSON.stringify(req.reserve);
    res.send(retpack);
  },

  book_cancel: function(req, res) {
    res.send(req.cancel.err); /* "0" succ / "1" err */
  },
  /*
    success_at_getting_reserve_state
  */
  success_at_getting_reserve_state: function(req, res) {
    console.log('success at getting reservation list ');
    var retpack = JSON.stringify(req.reserveState);
    res.send(retpack);
  },

  /*
    get_accountlist_succ
  */
  get_accountlist_succ: function(req, res) {
    console.log('success at getting accountlist');
    var retpack = JSON.stringify(req.viewList);
    res.send(retpack);
  },

  /*
    invalid_date_format
  */
  invalid_date_format: function(req, res) {
    console.log('invalid date format');
    res.send('invalid date format')
  },

  /*
    lack of milage
  */
  lack_of_milage: function(req ,res) {
    console.log('lack of milage');
    var retpack = JSON.stringify({err: "1"});
    res.send(retpack);
  },

  /*
    success at using milage
  */
  success_at_using_milage: function(req, res) {
    console.log('success at using milage');
    var retpack = JSON.stringify({err: "0"});
    res.send(retpack);
  },

  success_at_charge_milage: function(req, res) {
    res.send('success');
  },

  alias_format_err: function(req, res) {
    res.send('err1');
  },

  milage_format_err: function(req, res) {
    res.send('err2');
  },

  member_dont_exist: function(req, res) {
    res.send('err3');
  },
  /**************************************************************************************
  CLIENT
  ***************************************************************************************/
  /*
    unregistered_member
  */
  unregistered_member: function(req, res) {
    res.render('clients_index', {unregistered_member_err: "1"});
  },

  /*
    password_is_wrong
  */
  password_is_wrong: function(req, res) {
    res.render('clients_index', {password_err: "1"});
  },
  /*
    pause_reuse_succ
  */
  pause_reuse_succ: function(req, res) {
    console.log('pause/reuse done successfully');
    var pr;
    if (req.member.do == "pause") pr = 0;
    else if (req.member.do == "reuse") pr = 1;
    res.render('clients_index', {pr: pr});
  },

  /*
    even_not_entered
  */
  even_not_entered: function(req, res) {
    res.render('clients_index', {even_not_entered_err: "1"});
  },

  /*
    client_incorrect_pwd
  */
  client_incorrect_pwd: function(req, res) {
    console.log('wrong password');
    res.render('clients_index', {cli_wrong_pwd: "1"});
  },

  /*
    unregistered_client
  */
  unregistered_client: function(req, res) {
    console.log('you are not registered');
    res.render('clients_index', {unregistered_member_err: "1"});
  },

  /*
    already_exited
  */
  already_exited: function(req, res) {
    console.log('you already exited');
    res.render('clients_index', {already_exited: "1"});
  },

  /*
    already_entered
  */
  already_entered_err: function(req, res) {
    res.render('clients_index', {already_entered_err: "1"});
  },

  /*
    spend_all_day
  */
  spend_all_day: function(req, res) {
    res.render('clients_index', {spend_all_day_err : "1"} );
  },

  /*
    stop_member_err
  */
  stop_member_err: function(req, res) {
    res.render('clients_index', {stop_member_err : "1"});
  },

  /*
    lack_milage_err
  */
  lack_milage_err: function(req, res) {
    res.render('clients_index', {lack_milage_err : "1"});
  },

  /*
    Periodic check
  */
  periodic_check: function(req, res) {
    console.log('this is periodic check');
    console.log(req.alert);
    var json = JSON.stringify(req.alert);
    res.send(json);
  },

  /*
    periodic_pause_check
  */
  periodic_pause_check: function(req, res) {
    res.send(req.err);
  },

  /*
    client_leave_succ
  */
  client_leave_succ: function (req, res) {
    console.log(req.member);
    console.log('this is response');
    res.render('clients_index', {client_leave_succ: "1", fee: req.member.fee});
  },

  /*
    client_enter_succ
  */
  client_enter_succ: function (req, res) {
    //console.log(req.member);
    console.log('this is response');
    console.log(req.seatinfo);
    console.log(req.query);
    /*
      Now req.seatinfo include seat_floor which is floorid
    */
    var json = JSON.stringify(req.seatinfo); /* before send object, must stringify! */
    res.render('floor_3f',
    {
      alias: req.query.alias,
      seatinfo: json,
      paymentid: req.query.pid,
      leftTime: req.query.lt,
      membername: req.query.mn,
      night: req.query.n,
      accumlateBreak: req.query.accumlateBreak
    });
  },

  /*
    client_seat_status
  */
  client_seat_status: function (req, res) {
    var json = JSON.stringify(req.seatinfo);
    res.render('clients_seats_status',
    {
      seatinfo: json
    });
  },

  /*
    client_seat_stats_admin
  */
  client_seat_status_admin: function(req, res) {
    var json = JSON.stringify(req.seatinfo);
    res.send(json);
  },
  /*
    3F, 4F page rendering
  */
  view_3f: function(req, res) {
    console.log('this is 3f');
    console.log(req.seatinfo);
    console.log(req.body);
    /*
      Now req.seatinfo include seat_floor which is floorid
    */
    var json = JSON.stringify(req.seatinfo); /* before send object, must stringify! */
    res.render('floor_3f',
    {
      alias: req.body.alias,
      seatinfo: json,
      paymentid: req.body.pid,
      leftTime: req.body.lt,
      membername: req.body.mn,
      night: req.body.n
    });
  },
  view_4f: function(req, res) {
    console.log('this is 4f');
    console.log(req.seatinfo);
    console.log(req.body);
    /*
      Now req.seatinfo include seat_floor which is floorid
    */
    var json = JSON.stringify(req.seatinfo); /* before send object, must stringify! */
    res.render('floor_4f',
    {
      alias: req.body.alias,
      seatinfo: json,
      paymentid: req.body.pid,
      leftTime: req.body.lt,
      membername: req.body.mn,
      night: req.body.n
    });
  },
  // view_b1: function(req, res) {
  //   console.log('this is b1');
  //   console.log(req.seatinfo);
  //   console.log(req.body);
  //   /*
  //     Now req.seatinfo include seat_floor which is floorid
  //   */
  //   var json = JSON.stringify(req.seatinfo); /* before send object, must stringify! */
  //   res.render('floor_b1',
  //   {
  //     alias: req.body.alias,
  //     seatinfo: json,
  //     paymentid: req.body.pid,
  //     leftTime: req.body.lt
  //   });
  // },
  /*
    clients_page
  */
  client_page: function(req, res) {
    res.render('clients_index');
  },

  /**********************************************************************************************
  REGISTER
  **********************************************************************************************/

  /*
    phonenum length error
  */
  phonenum_length_err: function(req, res) {
    console.log('this is phonenum length err');
    res.send("1");
  },

  /*
    phonenum is not number
  */
  password_length_err: function(req, res) {
    console.log('this is password length err');
    res.send("2");
  },

  /*
    already_register
  */
  already_register: function(req, res) {
    console.log('this is already register err');
    res.send("3");
  },

  /*
    still_use_other_payment
  */
  still_use_other_payment: function(req, res) {
    res.send('err1');
  },

  /*
    no_member
  */
  no_member: function(req, res) {
    res.send('err2');
  },
  /*
    recharge success
  */
  recharge_succ: function(req, res) {
    res.send('err0');
  },
  /*
    auth
  */
  auth: function(req, res) {
    res.status(200).render('layout_test',
    {
      renderSrc: {
        numOfMem:       req.source.numOfMem,
        numOfActiveMem: req.source.numOfActiveMem
      }
    });
  },

  /*
    token
  */
  token: function(req, res) {
    res.status(201).json({
      // json contain accessToken

    });
  },

  /*
    reject
  */
  reject: function(req, res) {
    res.status(204).end();
  },

  /*
    expired
  */
  expired: function(req, res) {
    res.end('Access token has expired', 205);
    /*
      instead of res.end() using next() would be possible
      but we should code that situation at later
    */
  },

  /*
    no matching user found
  */
  user_not_found: function(res, req) {
    res.status(206).send('user_not_found');
    /*
      instead of res.end() using next() would be possible
      but we should code that situation at later
    */
  },

  /*
    Unauthorized
  */
  unAuthorized: function(req, res) {
    /*
      In here we should change text with Unauthorized page
    */
    res.end('Unauthorized');
  }
}
