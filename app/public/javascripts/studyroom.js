$(document).ready(function() {
  /*
    Open Studyroom Window
  */
  $('#reserve-studyroom').click(function(event) {
    /*
      block
    */
    $('#studyroom-reservation-modal').css("display", "block");
  });
  /*
    REFRESH studyroom status
  */
  $('#refresh-studyroom-status').click(function(event) {
    /*
      open the select hour form
    */
    clearStudyroomStatus();

    $.ajax({
      url: '/system/studyroom-currentstate',
      method: 'post'
    }).done(function(results) {
      renderStudyroomStatus(results);
      $('#status-choosedDate').text('(현재 날짜 기준)');
      updateStudyroomStatusTable();

    }); // end of callback
  });
  /*
    Study Room Reservation
  */
  /* send the selected date value to server and get the reservation state */
  $('#reserve-date-select').click(function(event) {
    var reserveDateMin = $('#studyroom-datetimepickerMin').data("date");
    var reserveDateMax = $('#studyroom-datetimepickerMax').data("date");

    if (reserveDateMin === undefined || reserveDateMax === undefined) {
      alert('날짜를 선택해주세요.');
    }
    else {
      /*
        open the select hour form
      */
      clearStudyroomStatus()

      $('#select-hours-container').css('display', 'block');

      $.ajax({
        url: '/system/studyroom-currentstate',
        method: 'post',
        data: {
          dateMin: reserveDateMin
        }
      }).done(function(results) {
        renderStudyroomStatus(results);
        $('#status-choosedDate').text(`${reserveDateMin} ~ ${reserveDateMax} 날짜 기준`);
        updateStudyroomStatusTable();
      }); // end of callback
    }
  });

  /*
    Study Room Cancel
  */
  /* send the selected date value to server and get the reservation state */
  $('#cancel-date-select').click(function(event) {
    var cancelDateMin = $('#studyroom-datetimepickerMin-cancel').data("date");
    var cancelDateMax = $('#studyroom-datetimepickerMax-cancel').data("date");

    if (cancelDateMin === undefined || cancelDateMax === undefined) {
      alert('날짜를 선택해주세요.');
    }
    else {

      /*
        open the select hour form
      */
      clearStudyroomStatus();
      /*
        open the select hour form
      */
      $('#cancel-hours-container').css('display', 'block');

      $.ajax({
        url: '/system/studyroom-currentstate',
        method: 'post',
        data: {
          dateMin: cancelDateMin
        }
      }).done(function(results) {
        renderStudyroomStatus(results);
        $('#status-choosedDate').text(`${cancelDateMin} ~ ${cancelDateMax} 날짜 기준`);
        updateStudyroomStatusTable();
      }); // end of callback
    }
  });

  /* show select hour container */
  $('#reservation-date').on('dp.change', function(e) {
    /*
      everytime date is change, should clear the table
    */
    $('tbody#reservation-table-body-1').children('tr').each(function() {
      $(this).find('th[name="avail"]').text('');
    });
  });
  /* if clicked hour select button -> reserve the room */
  $('#reserve-hour-select').click(function() {
    var startHour = $('#select-hours').find('option:selected').attr("name");
    var roomNum   = $('#select-room').find('option:selected').attr("name");
    var duration  = $('#duration').val();
    var users     = $('#studyroom-users').val();
    var purpose   = $('#studyroom-purpose').val();
    var reserveDateMin = $('#studyroom-datetimepickerMin').data("date");
    var reserveDateMax = $('#studyroom-datetimepickerMax').data("date");
    /* this option is for chooseing all, weekend, weekday */
    var option         = $('#select-option').find('option:selected').attr("name");

    if (startHour === '' || duration === '' || reserveDateMax === undefined) {
      alert('입력되지 않은 값이 있습니다..');
      return false;
    }


    $.ajax({
      url: '/system/reserve-studyroom',
      method: 'post',
      data: {
        sh: startHour,
        du: duration,
        rds: reserveDateMin,
        rde: reserveDateMax,
        rn: roomNum,
        users: users,
        purpose: purpose,
        option: option
      }
    }).done(function(results) {
      console.log(results);
      var json = JSON.parse(results);

      if (json.err == "2") {
        alert('이미 예약된 시간입니다.');
      }
      else if(json.err == "3") {
        alert('24시를 넘어서는 예약할 수 없습니다.');
      }
      else if(json.err == "4") {
        alert("운영시간이 아닙니다.");
      }
      else if(json.err == "0") {
        alert('예약에 성공했습니다.\n\n  예약 일 수 :'+json.days+' 일');
      }
      /*
        should empty the datepicker input value
      */
      clearStudyroomDatetimePicker();

      /*
        Should clear the select hour form after that..
      */
      $('#select-hours').prop('selectedIndex', 0);
      $('#duration').val('');
      $('#studyroom-users').val('');
      $('#studyroom-purpose').val('');
      $('#select-hours-container').css('display', 'none');

    });
  });

  /* cancel reservation */
  $('#reserve-hour-select-cancel').click(function() {
    var startHour = $('#select-hours-cancel').find('option:selected').attr("name");
    var roomNum   = $('#select-room-cancel').find('option:selected').attr("name");
    var reserveDateMin = $('#studyroom-datetimepickerMin-cancel').data("date");
    var reserveDateMax = $('#studyroom-datetimepickerMax-cancel').data("date");

    if (startHour === '' || duration === '' || reserveDateMax === undefined) {
      alert('입력되지 않은 값이 있습니다..');
      return false;
    }

    $.ajax({
      url: '/system/reserve-studyroom-cancel',
      method: 'post',
      data: {
        sh: startHour,
        rds: reserveDateMin,
        rde: reserveDateMax,
        rn: roomNum
      }
    }).done(function(results) {
      if (results == "0") {
        alert("취소하였습니다.");
        /*
          should empty the datepicker input value
        */
        clearStudyroomDatetimePicker();
        /*
          Should clear the select hour form after that..
        */
        $('#select-hours-cancel').prop('selectedIndex', 0);
        $('#select-room-cancel').prop('selectedIndex', 0);
        $('#cancel-hours-container').css('display', 'none');
      }
      else if (results == "1") {
        alert("취소실패! 취소 날짜와 시작시간을 한 번 더 확인해주세요.");
      }
    });
  });
});

function clearStudyroomStatus() {
  /* before block container, erase old tr */
  var tbody1 = document.getElementById('reservation-table-body-1');
  while(tbody1.firstChild) {
    tbody1.removeChild(tbody1.firstChild);
  }
  var tbody2 = document.getElementById('reservation-table-body-2');
  while(tbody2.firstChild) {
    tbody2.removeChild(tbody2.firstChild);
  }
  var tbody3 = document.getElementById('reservation-table-body-3');
  while(tbody3.firstChild) {
    tbody3.removeChild(tbody3.firstChild);
  }
}

function emptyDatePicker() {

}

function renderStudyroomStatus(results) {
  var json = JSON.parse(results);
  var room1Reservation = json.room1;
  var room2Reservation = json.room2;
  var room3Reservation = json.room3;
  /*
    SHOULD RENDER THE JSON DATA
  */
  /*
    Now we should separate depends on the room number
  */
  /* render room 1 column */
  for (var i = 0; i < room1Reservation.length; i++) {
    var jsonelt = room1Reservation[i];

    if (jsonelt.users == "") {
      jsonelt.users = "-";
    }
    if (jsonelt.purpose == "") {
      jsonelt.purpose = "-";
    }
    var rs = jsonelt['DATE_FORMAT(tsStart, "%Y-%m-%d")'];
    var re = jsonelt['DATE_FORMAT(tsEnd, "%Y-%m-%d")'];
    var option = jsonelt.ro;
    if (option == 0) {
      option = "평일, 주말";
    }
    else if (option == 1) {
      option = "주말";
    }
    else if (option == 2) {
      option = "평일";
    }
    $('#reservation-table-body-1').append(
      '<tr name="sr1-'+i+'">'+
      ' <td data-title="rd">'+ rs +' ~ '+ re +'</td>' +
      ' <td data-title="st">'+ jsonelt.start +'</td>' +
      ' <td data-title="du">'+ jsonelt.duration +'</td>' +
      ' <td data-title="room">'+ jsonelt.room +'</td>' +
      ' <td data-title="user">'+ jsonelt.users +'</td>' +
      ' <td data-title="purpose">'+ jsonelt.purpose +'</td>' +
      ' <td data-title="option">'+ option +'</td>'
    );
  }
  /* render room 2 column */
  for (var i = 0; i < room2Reservation.length; i++) {
    var jsonelt = room2Reservation[i];

    if (jsonelt.users == "") {
      jsonelt.users = "-";
    }
    if (jsonelt.purpose == "") {
      jsonelt.purpose = "-";
    }
    var rs = jsonelt['DATE_FORMAT(tsStart, "%Y-%m-%d")'];
    var re = jsonelt['DATE_FORMAT(tsEnd, "%Y-%m-%d")'];
    var option = jsonelt.ro;
    if (option == 0) {
      option = "평일, 주말";
    }
    else if (option == 1) {
      option = "주말";
    }
    else if (option == 2) {
      option = "평일";
    }
    $('#reservation-table-body-2').append(
      '<tr name="sr2-'+i+'">'+
      ' <td data-title="rd">'+ rs +' ~ '+ re +'</td>' +
      ' <td data-title="st">'+ jsonelt.start +'</td>' +
      ' <td data-title="du">'+ jsonelt.duration +'</td>' +
      ' <td data-title="room">'+ jsonelt.room +'</td>' +
      ' <td data-title="user">'+ jsonelt.users +'</td>' +
      ' <td data-title="purpose">'+ jsonelt.purpose +'</td>' +
      ' <td data-title="option">'+ option +'</td>'
    );
  }
  /* render room 3 column */
  for (var i = 0; i < room3Reservation.length; i++) {
    var jsonelt = room3Reservation[i];

    if (jsonelt.users == "") {
      jsonelt.users = "-";
    }
    if (jsonelt.purpose == "") {
      jsonelt.purpose = "-";
    }
    var rs = jsonelt['DATE_FORMAT(tsStart, "%Y-%m-%d")'];
    var re = jsonelt['DATE_FORMAT(tsEnd, "%Y-%m-%d")'];
    var option = jsonelt.ro;
    if (option == 0) {
      option = "평일, 주말";
    }
    else if (option == 1) {
      option = "주말";
    }
    else if (option == 2) {
      option = "평일";
    }
    $('#reservation-table-body-3').append(
      '<tr name="sr3-'+i+'">'+
      ' <td data-title="rd">'+ rs +' ~ '+ re +'</td>' +
      ' <td data-title="st">'+ jsonelt.start +'</td>' +
      ' <td data-title="du">'+ jsonelt.duration +'</td>' +
      ' <td data-title="room">'+ jsonelt.room +'</td>' +
      ' <td data-title="user">'+ jsonelt.users +'</td>' +
      ' <td data-title="purpose">'+ jsonelt.purpose +'</td>' +
      ' <td data-title="option">'+ option +'</td>'
    );
  }
}

function updateStudyroomStatusTable() {
  /*
    tablesort
  */
  $('#study1-table').trigger('update');
  $('#study2-table').trigger('update');
  $('#study3-table').trigger('update');
}

function clearStudyroomDatetimePicker() {
  $('#studyroom-datetimepickerMin input').val('');
  $('#studyroom-datetimepickerMax input').val('');
  $('#studyroom-datetimepickerMin-cancel input').val('');
  $('#studyroom-datetimepickerMax-cancel input').val('');
}
