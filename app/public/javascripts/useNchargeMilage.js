$(document).ready(function() {
  /*
    Use Milage
  */
  $('#use-milage').click(function() {
    $('#use-milage-modal').css("display", "block");
  });
  /*
    when submit the form
  */
  $('#use-milage-submit').click(function(event) {
    event.preventDefault();
    useMilageSubmit();
  });

  /*
    charge milage
  */
  $('#charge-milage').click(function() {
    $('#discount-charge-milage').val('0');
    $('#price-charge-milage').val('0');

    $('#charge-milage-modal').css("display", "block");
  });

  /*
    when submit the form
  */
  $('#charge-milage-submit').click(function(event) {
    event.preventDefault();
    chargeMilageSubmit();
  });
});


function initUseMilage(membername, alias, milage) {
  $('#use-milage-name').val(membername);
  $('#use-milage-alias').val(alias);
  $('#use-milage-coup').val(milage);

  $('#use-milage-modal').css("display", "block");
}


function initAddMilage(membername, alias, milage) {
  $('#add-milage-name').val(membername);
  $('#add-milage-alias').val(alias);
  $('#add-milage-coup').val(milage);
  $("#discount-charge-milage").val('0');
  $('#price-charge-milage').val('0');

  $('#charge-milage-modal').css("display", "block");
}


function useMilageSubmit() {
  var membername = $('#use-milage-name').val();
  var alias      = $('#use-milage-alias').val();
  var milage     = $('#amount-use-milage').val();
  var content    = $('#content-use-milage').val();
  var memo       = $('#memo-use-milage').val();

  if (Number.isInteger(parseInt(milage))==false) {
    alert('값을 정확히 입력해주세요.');
  }
  else {
    $.ajax({
      url: '/system/use-milage',
      method: 'post',
      data: {
        membername    : membername,
        alias         : alias,
        milage        : milage,
        content       : content,
        memo          : memo
      }
    }).done( function (results) {
      var json = JSON.parse(results);
      // show snackbar or some alert to admin
      if (json.err === "1") {
        // failed
        alert('코업머니가 부족합니다.');
      }
      else if(json.err === "0") {
        //success
        alert('코업머니를 사용하였습니다.');
      }

      clearUseMilageWin();
    });
  }
}

function clearUseMilageWin() {
  $('#amount-use-milage').val("");
  $('#memo-use-milage').val("");
}

function chargeMilageSubmit() {
  var membername  = $('#add-milage-name').val();
  var alias       = $('#add-milage-alias').val();
  var milage      = $('#amount-charge-milage').val();
  var content     = $('#content-charge-milage').val();
  var discount    = $('#discount-charge-milage').val();
  var price       = $('#price-charge-milage').val();
  var option      = $('#cash-charge-option option:selected').text();
  var memo        = $('#memo-charge-milage').val();

  if (Number.isInteger(parseInt(milage))==false || Number.isInteger(parseInt(discount))==false || Number.isInteger(parseInt(price))==false) {
    alert('값을 정확히 입력해주세요.');
  }
  else {
    $.ajax({
      url: '/system/charge-milage',
      method: 'post',
      data: {
        membername    : membername,
        alias         : alias,
        milage        : milage,
        content       : content,
        discount      : discount,
        price         : price,
        option        : option,
        memo          : memo
      }
    }).done(function(result) {
      if (result == "success") {
        alert('충전되었습니다.');
        clearChargeMilageWin();
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
}

function clearChargeMilageWin() {
  $('#charge-milage-name').val('');
  $('#amount-charge-milage').val('');
  $('#content-charge-milage').val('');
  $('#discount-charge-milage').val('');
  $('#price-charge-milage').val('');
  $('#cash-charge-option option:eq(0)').prop('selected', true);
  $('#memo-charge-milage').val('');
}
