/****************************************************************************************
SEAT STATUS
****************************************************************************************/
var firstSeatLabel_3f   = 1;
var firstSeatLabel_4f   = 39;

var sc3f = $('#seat-map-3f').seatCharts({
  map: [
    'nnnnnn__n',
    'nnnnnn__n',
    '________n',
    'nnnnnn__n',
    'nnnnnn__n',
    '________n',
    'nnnn_____',
    'nnnn_____',
    'WWWWWEEWW',
  ],
  seats: {
    n: {
      price   : 100,
      classes : 'normal-seats', //your custom CSS class
      category: '좌석'
    },
    E: {
      classes: 'enterance'
    },
    W: {
      classes: 'wall'
    }
  },
  naming : {
    top : false,
    left: false,
    getLabel : function (character, row, column) {
      if ((row == 9 && column == 6) || (row == 9 && column == 7)) {
        return 'E';
      }
      if ((row==9&&column==1)||(row==9&&column==2)||(row==9&&column==2)||(row==9&&column==3)||(row==9&&column==4)||(row==9&&column==5)||(row==9&&column==8)||(row==9&&column==9)) {
        return '';
      }
      return firstSeatLabel_3f++;
    },
  },
  legend : {
    node : $('#legend-3f'),
      items : [
      [ 'n', 'available',   '남아있는 자리' ],
      [ 'E', 'unavailable', '입구']
      ]
  },

  click: function () {
    if (this.status() == 'available') {
      /*
        script about two seats simultanously  can not be reserved
      */
      sc3f.find('n.selected').status('available');

      return 'selected';
    } else if (this.status() == 'selected') {
      //seat has been vacated
      return 'available';
    } else if (this.status() == 'unavailable') {
      //seat has been already booked
      return 'unavailable';
    } else {
      return this.style();
    }
  }
});

var sc4f = $('#seat-map-4f').seatCharts({
  map: [
    'n_n_n_n_nn',
    'n_n_n_n___',
    '________nn',
    '__________',
    '________nn',
    '__________',
    'n_n_n_n_nn',
    'n_n_n_nWEW',
    'PP___PPW__',
    '_______W__',
    'PPPP__PW__',
    'PPPP__PW__',
    'PPPP__PW__',
    '______PW__',
    '_______E__',
    'wwww___E__'
  ],
  seats: {
    n: {
      classes : 'normal-seats', //your custom CSS class
      category: '좌석'
    },
    P: {
      classes: 'premium',
      category: '관리형반'
    },
    E: {
      classes: 'enterance'
    },
    W: {
      classes: 'wall'
    }
  },
  naming : {
    top : false,
    left: false,
    getLabel : function (character, row, column) {
      if ((row == 15 && column == 8) || (row == 16 && column == 8)||(row==8&&column==9)) {
        return 'E';
      }
      if ((row==14&&column==8)||(row==13&&column==8)||(row==12&&column==8)||(row==11&&column==8)||(row==10&&column==8)||(row==9&&column==8)||(row==8&&column==10)||(row==8&&column==8)
        ||(row==16&&column==1)||(row==16&&column==2)||(row==16&&column==3)||(row==16&&column==4)) {
        return '';
      }
      return firstSeatLabel_4f++;
    },
  },
  legend : {
    node : $('#legend-4f'),
      items : [
      [ 'n', 'available',   '남아있는 자리' ],
      [ 'P', 'available',   '관리형반 자리' ],
      [ 'E', 'unavailable', '입구']
      ]
  },

  click: function () {
    if (this.status() == 'available') {
      /*
        script about two seats simultanously  can not be reserved
      */
      sc4f.find('n.selected').status('available');
      sc4f.find('P.selected').status('available');
      return 'selected';
    } else if (this.status() == 'selected') {
      //seat has been vacated
      return 'available';
    } else if (this.status() == 'unavailable') {
      //seat has been already booked
      return 'unavailable';
    } else {
      return this.style();
    }
  }
});
/*
  Seat Status
*/
$('a#seat-refresh').click(function(event) {
  /*
    reset their status as available
  */
  sc3f.find('n.unavailable').each(function() {
    this.status('available')
  });
  sc4f.find('n.unavailable').each(function() {
    this.status('available')
  });
  sc4f.find('P.unavailable').each(function() {
    this.status('available')
  });

  $.ajax({
    url: 'clients/seatstate-admin',
    method: 'post'
  }).done(function(results) {
    var jsonSeatInfo = JSON.parse(results);
    console.log(jsonSeatInfo);

    var unavail_seats_3f      = [];
    var unavail_seats_3f_obj  = {};
    var unavail_seats_4f      = [];
    var unavail_seats_4f_obj  = {};

    for (var i = 0; i < jsonSeatInfo.length; i++) {
      var seatobj = jsonSeatInfo[i];
      /*
        We have to check whether seatobj element seat floor is same with current page floorid:3
      */
      if (seatobj.seat_floor === "3" /* "3" */) {
        unavail_seats_3f.push(seatobj.seat);
        unavail_seats_3f_obj[seatobj.seat] = seatobj;
      }

      else if (seatobj.seat_floor === "4" /* "3" */) {
        unavail_seats_4f.push(seatobj.seat);
        unavail_seats_4f_obj[seatobj.seat] = seatobj;
      }
    }
    sc3f.status(unavail_seats_3f, 'unavailable');
    sc4f.status(unavail_seats_4f, 'unavailable');

    /*
      then add each seat tag a title attribute
    */
    sc3f.find('n.unavailable').each(function() {
      var seatId = this.node().attr('id');
      var member = unavail_seats_3f_obj[seatId];
      var name = member.membername;
      this.node().attr('title', name); // add attr title with member name
    });
    sc4f.find('n.unavailable').each(function() {
      var seatId = this.node().attr('id');
      var member = unavail_seats_4f_obj[seatId];
      var name = member.membername;
      this.node().attr('title', name); // add attr title with member name
    });
    sc4f.find('P.unavailable').each(function() {
      var seatId = this.node().attr('id');
      var member = unavail_seats_4f_obj[seatId];
      var name = member.membername;
      this.node().attr('title', name); // add attr title with member name
    });
  });
});
/*
  Seat Change Button Clicked
*/
$('#seat-change').click(function(event) {
  var oldseat, newseat, ios, ins, sid_o, sid_n, floor_o, floor_n;
  var seatChk_o = false;
  var seatChk_n = false;
  oldseat = $('#oldseat').val(); ios = parseInt(oldseat);
  newseat = $('#newseat').val(); ins = parseInt(newseat);

  if (oldseat === "" || newseat === "") {
    alert('좌석 번호를 입력해주세요.');
    return false;
  }

  sc3f.find('n.unavailable').each(function() {
    var seatNum = this.node().text();
    var seatId  = this.node().attr('id');
    if (ios == seatNum) {
      seatChk_o = true;
      sid_o     = seatId;
      floor_o   = "3";
    }

  });
  sc3f.find('n.available').each(function() {
    var seatNum = this.node().text();
    var seatId  = this.node().attr('id');
    if (ins == seatNum) {
      seatChk_n = true;
      sid_n     = seatId;
      floor_n   = "3";
    }
  });

  sc4f.find('n.unavailable').each(function() {
    var seatNum = this.node().text();
    var seatId  = this.node().attr('id');
    console.log(seatNum);
    if (ios == seatNum) {
      seatChk_o = true;
      sid_o     = seatId;
      floor_o   = "4";
    }
  });
  sc4f.find('n.available').each(function() {
    var seatNum = this.node().text();
    var seatId  = this.node().attr('id');
    if (ins == seatNum) {
      seatChk_n = true;
      sid_n     = seatId;
      floor_n   = "4";
    }
  });

  sc4f.find('P.unavailable').each(function() {
    var seatNum = this.node().text();
    var seatId  = this.node().attr('id');
    console.log(seatNum);
    if (ios == seatNum) {
      seatChk_o = true;
      sid_o     = seatId;
      floor_o   = "4";
    }
  });
  sc4f.find('P.available').each(function() {
    var seatNum = this.node().text();
    var seatId  = this.node().attr('id');
    if (ins == seatNum) {
      seatChk_n = true;
      sid_n     = seatId;
      floor_n   = "4";
    }
  });
  if(!seatChk_o || !seatChk_n) {
    alert('정확한 좌석번호를 입력해주세요.');
    return false;
  }

  $.ajax({
    url: '/clients/seatchange',
    method: 'post',
    data: {
      oldSeatId : sid_o,
      oldSeatNum: ios,
      oldFloor  : floor_o,
      newSeatId : sid_n,
      newSeatNum: ins,
      newFloor  : floor_n
    }
  }).done(function(results) {
    var json = JSON.parse(results);
    if (json.err === "0") {
      alert('좌석을 이동하였습니다. \n\n'+ json.oldSeat + " 번 좌석 -> " + json.newSeat + " 번 좌석\n");
    }
    else {
      alert('좌석이동에 실패하였습니다.')
    }
  });


});
/*
  enterance
*/
sc3f.get(['9_1', '9_2', '9_3', '9_4', '9_5', '9_6', '9_7', '9_8','9_9']).status('unavailable');
sc4f.get(['15_8', '16_8', '14_8', '13_8', '12_8','11_8','10_8','9_8','8_8','8_9','8_10', '16_1', '16_2', '16_3', '16_4']).status('unavailable');

/****************************************************************************************
END OF SEAT STATUS
****************************************************************************************/
