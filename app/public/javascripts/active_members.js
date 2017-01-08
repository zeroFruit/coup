$(document).ready(function() {
  /*
    Active member list button clicked
  */
  $('a#active-members').click(function(event) {
    /* get the token */
    $.ajax({
      url: '/system/active-members',
      method: 'post',
    }).done(function(results) {
      var json = JSON.parse(results);
      console.log(json);

      for (var i = 0; i < json.length; i++) {
        var jsonObj = json[i];
        var ispause = '-';
        if (jsonObj.pause === '1') ispause = '일시정지 중';
        var total = parseInt(jsonObj.usedMin);
        var hour  = parseInt(total / 60);
        var min   = total % 60;

        var btotal = parseInt(jsonObj.break);
        var bhour  = parseInt(btotal/60);
        var bmin   = btotal % 60;
        $('#active-members-table-body').append(
          '<tr name="active-member-'+i+'">'+
          ' <td data-title="ID">'+ jsonObj.alias +'</td>' +
          ' <td data-title="membername">'+ jsonObj.membername +'</td>' +
          ' <td data-title="payment">'+ jsonObj.payment +'</td>' +
          ' <td data-title="enterts">'+ jsonObj['DATE_FORMAT(ts, "%Y-%m-%d %H:%i")'] +'</td>' +
          ' <td data-title="fints">'+ jsonObj.lts +'</td>' +
          ' <td data-title="usedMin">'+ hour +' 시간 '+ min +' 분'+'</td>' +
          ' <td data-title="ispause">'+ ispause+'</td>' +
          ' <td data-title="break">'+  bhour +' 시간 '+ bmin +' 분'+'</td>' +
          ' <td data-title="pts">'+ jsonObj.pts +'</td>' +
          ' <td data-title="vacant"><i class="fa fa-times vacant-seat" aria-hidden="true" style="cursor:pointer"></i></td>' +
          '</tr>'
        );

        /*
          all member VACANT-SEAT click event handler
        */
        $('tr[name="active-member-'+i+'"] td i.vacant-seat').on('click', function(event) {
          var $parent = $(this).parent().parent('tr');
          var alias = $parent.find('td:eq(0)').text();

          $.ajax({
            url: '/system/vacant-seat',
            method: 'post',
            data: {alias: alias}
          }).done(function(result) {
            if (result == "0") {
              alert('퇴실처리 하였습니다.');
              //$parent.parent().remove('tr[name="active-member-'+i+'"]');
            }
          });
        });
      }
      $('#active-members-table').tablesorter();

      $('#active-members-list').css("display", "block");
    });
  });
  
});
