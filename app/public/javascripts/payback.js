$(document).ready(function() {
  /*
    Payback
  */
  $('a#payback').click(function(event) {
    $('#payback-modal').css("display", "block");
  });
  $('#payback-submit').click(function(event) {
    event.preventDefault();
    var alias = $('#payback-name').val();

    if (alias === "") {
      alert('ID를 입력해주세요.');
      return false;
    }

    $.ajax({
      url: '/system/payback',
      method: 'post',
      data: {alias: alias}
    }).done(function(results) {
      var json = JSON.parse(results);
      console.log(json);
      $('#payback-hidden-container').css('display', 'block');
      $('#payback-submitform').css('display', 'block');
      $('#payback-result').append(
        '<h4> 이름: '+json.membername+'</h4><br>' +
        '<h4> 이용 요금제: '+json.payment+'</h4><br>' +
        '<h4> 잔여 일: '+ json.leftDay +' 일</h4><br>' +
        '<h4> 잔여 마일리지: '+json.milage+' 포인트</h4><br>' +
        '<input type="hidden" name="payback-id" value="'+ json.id +'">'
      );
    });
  });
  $('a#payback-determine').click(function(event) {
    var id = $('input[name="payback-id"]').val();
    var cashback = $('#payback-cashback').val();
    $.ajax({
      url: '/system/payback-determine',
      method: 'post',
      data: {
        id: id,
        milage: cashback
      }
    }).done(function(result) {
      if (result == 'success') {
        alert('환불처리 되었습니다.');
        // clean up
        $('payback-hidden-container').css('display', 'none');
        var container = document.getElementById('payback-result');
        while(container.firstChild) {
          container.removeChild(container.firstChild);
        }
        $('input[name="payback-id"]').val("");
        $('#payback-name').val("");
        $('#payback-submitform').css('display', 'none');
      }
    });
  });
  
});
