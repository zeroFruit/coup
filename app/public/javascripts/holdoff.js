$(document).ready(function() {
  /*
    Holdoff
  */
  $('a#holdoff').click(function(event) {
    $('#holdoff-modal').css("display", "block");
  });
  $('#holdoff-submit').click(function(event) {
    event.preventDefault();

    /*
      before getting data erase the old content
    */
    var container = document.getElementById('holdoff-result');
    while(container.firstChild) {
      container.removeChild(container.firstChild);
    }
    /* do next job */
    var alias = $('#holdoff-name').val();

    if (alias === "") {
      alert('ID를 입력해주세요.');
      return false;
    }

    $.ajax({
      url: '/system/holdoff',
      method: 'post',
      data: {alias: alias}
    }).done(function(results) {
      var json = JSON.parse(results);
      console.log(json);

      var holdoff;
      if (json.stop == 0) {
        holdoff = "정상 진행중";
      }
      else if(json.stop == 1) {
        holdoff = "보류 상태";
      }
      $('#holdoff-hidden-container').css('display', 'block');
      $('#holdoff-result').append(
        '<h4> 이름: '+json.membername+'</h4><br>' +
        '<h4> 이용 요금제: '+json.payment+'</h4><br>' +
        '<h4> 잔여 일: '+ json.leftDay +' 일</h4><br>' +
        '<h4> 잔여 마일리지: '+json.milage+' 포인트</h4><br>' +
        '<h4> 보류 여부: '+ holdoff +'</h4><br>' +
        '<input type="hidden" name="holdoff-id" value="'+ json.id +'">' +
        '<input type="hidden" name="holdoff-stop" value="'+ json.stop +'">'
      );
    });
  });
  $('a#holdoff-determine').click(function(event) {
    var id    = $('input[name="holdoff-id"]').val();
    var stop  = $('input[name="holdoff-stop"]').val();
    $.ajax({
      url: '/system/holdoff-determine',
      method: 'post',
      data: {
        id: id,
        stop: stop
      }
    }).done(function(result) {
      if (result == "1") { /* re-running */
        alert("이제 보류합니다.");
      }
      else if(result == "0") {
        alert("이제 재시작합니다.");
      }
    });
  });
  
});
