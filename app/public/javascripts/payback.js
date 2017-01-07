$(document).ready(function() {

  $('a#payback-determine').click(function(event) {
    paybackSubmit();
  });
});

function initPayback(membername, alias, milage, leftDay, payment) {
  $('#payback-name').val(membername);
  $('#payback-alias').val(alias);
  $('#payback-coup').val(milage);
  $('#payback-leftdays').val(leftDay);
  $('#payback-payment').val(payment);
}

function paybackSubmit() {
  var membername  = $('#payback-name').val();
  var alias       = $('#payback-alias').val();
  var cashback    = $('#payback-cashback').val();
  var payment     = $('#payback-payment').val();

  if (payment == "-") {
    alert("사용중인 요금제가 없습니다.");
    $('#payback-cashback').val('');
  }
  else if (cashback == "") {
    alert("값을 입력해주세요.");
  }
  else {
    $.ajax({
      url: '/system/payback-determine',
      method: 'post',
      data: {
        membername  : membername,
        alias       : alias,
        milage      : cashback
      }
    }).done(function(result) {
      if (result == 'success') {
        alert('환불처리 되었습니다.');
        clearPaybackModal();
      }
    });
  }
}

function clearPaybackModal() {
  $('#payback-cashback').val('');
}
