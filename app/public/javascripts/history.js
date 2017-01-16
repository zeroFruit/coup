$(document).ready(function() {
  /*
    history
  */
  $('#history').click(function(event) {

    $.ajax({
      url: '/system/history',
      method: 'post'
    }).done(function(results) {
      for (var i = 0; i < results.length; i++) {
        var obj = results[i];
        $('#history-table-body').append(
          '<tr name="history-'+i+'">'+
          ' <td data-title="ID">'+ obj['DATE_FORMAT(ts, "%Y-%m-%d %H:%i")'] +'</td>' +
          ' <td data-title="alias">'+ obj.alias +'</td>' +
          ' <td data-title="membername">'+ obj.membername +'</td>' +
          ' <td data-title="seatnum">'+ obj.seatnum +'</td>' +
          ' <td data-title="do">'+ obj.do +'</td>' +
          '</tr>'
        );
        if (obj.job == 0) {
          $('tr[name="history-'+i+'"]').css('background-color', '#baffc9');
        }
        else if(obj.job == 1) {
          $('tr[name="history-'+i+'"]').css('background-color', '#ffffba');
        }
        else if(obj.job == 2) {
          $('tr[name="history-'+i+'"]').css('background-color', '#bae1ff');
        }
        else if(obj.job == 3) {
          $('tr[name="history-'+i+'"]').css('background-color', '#ffb3ba');
        }
      }
      $('#history-modal').css("display", "block");
    });
  });
});
