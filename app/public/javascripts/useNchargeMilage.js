$(document).ready(function() {
  /*
    Use Milage
  */
  $('#use-milage').click(function() {
    $('#use-milage-modal').css("display", "block");
  });
  /* when submit the form*/
  $('#use-milage-submit').click(function(event) {
    event.preventDefault();
    useMilageSubmit();
  });

  /*
    charge milage
  */
  $('#charge-milage').click(function() {
    $('#charge-milage-modal').css("display", "block");
  });
  /* when submit the form*/
  $('#charge-milage-submit').click(function(event) {
    event.preventDefault();
    chargeMilageSubmit();
  });
});

function useMilageSubmit() {
  var membername = $('#use-milage-name').val();
  var milage     = $('#amount-use-milage').val();
  var content    = $('#content-use-milage').val();
  var memo       = $('#memo-use-milage').val();


  $.ajax({
    url: '/system/use-milage',
    method: 'post',
    data: {
      membername    : membername,
      milage        : milage,
      content       : content,
      memo          : memo
    }
  }).done( function (results) {
    var json = JSON.parse(results);
    console.log(json);
    // show snackbar or some alert to admin
    if (json.err === "1") {
      // failed
      show_snackbar('lack-of-milage-err-snackbar');
    }
    else if(json.err === "0") {
      //success
      show_snackbar('success-at-using-milage-snackbar');
    }

    $('#use-milage-name').val("");
    $('#amount-use-milage').val("");
    $('#content-use-milage').val("");
    $('#memo-use-milage').val("");
  });
}

function chargeMilageSubmit() {
  var membername = $('#charge-milage-name').val();
  var milage     = $('#amount-charge-milage').val();
  var content    = $('#content-charge-milage').val();

  $.ajax({
    url: '/system/charge-milage',
    method: 'post',
    data: {
      accessToken   : valAccess,
      refreshToken  : valRefresh,
      membername    : membername,
      milage        : milage,
      content       : content
    }
  }).done(function(result) {
    if (result == "success") {
      alert('충전되었습니다.');
      $('#charge-milage-name').val("");
      $('#amount-charge-milage').val("");
      $('#content-charge-milage').val("");
    }
    else if (result == "err1") {
      alert('ID가 잘못되었습니다.');
    }
    else if (result == "err2") {
      alert('마일리지를 잘못 입력하였습니다.');
    }
    else if (result == "err3") {
      alert('존재하지 않는 회원입니다.');
    }
  });
}
