
$(document).ready(function() {

  /* When clicked refresh */
  $('a#refresh-userusagelist').click(function() {
    refreshUsageList();
    refreshEnteranceList();
  });
});

function clearUsageList() {
  var usage_table_body = document.getElementById('member-usage-table-body');

  while(usage_table_body.firstChild) {
    usage_table_body.removeChild(usage_table_body.firstChild);
  }
  $('#member-usage-datetimepicker-start input').val(moment().format('YYYY-MM-DD').toString());
  $('#member-usage-datetimepicker-end input').val(moment().format('YYYY-MM-DD').toString());
}
function clearUsageList2() {
  var usage_table_body = document.getElementById('member-usage-table-body');

  while(usage_table_body.firstChild) {
    usage_table_body.removeChild(usage_table_body.firstChild);
  }
}
function clearHistoryList() {
  var tbody1 = document.getElementById('member-enterance-table-body');
  var tbody2 = document.getElementById('member-enterance-static-table-body');

  while(tbody1.firstChild) {
    tbody1.removeChild(tbody1.firstChild);
  }
  while(tbody2.firstChild) {
    tbody2.removeChild(tbody2.firstChild);
  }
}

function refreshEnteranceList() {
  var membername = $('#member-usage-list-name').text();
  var alias = $('#member-usage-list-id').text();
  var startDate = $('#member-usage-datetimepicker-start input').val();
  var endDate = $('#member-usage-datetimepicker-end input').val();

  $.ajax({
    url: '/system/enterancelist',
    method: 'post',
    data: {
      membername: membername,
      alias: alias,
      startDate: startDate,
      endDate: endDate
    }
  }).done(function(results) {
    clearHistoryList();
    appendPersonalHistoryTBody(results);
  });
}

function appendPersonalHistoryTBody(results) {
  var tsList = [];
  for (var i = results.length-1; i >= 0; i--) {
    var obj = results[i];
    var ts = obj['DATE_FORMAT(ts, "%Y-%m-%d %H:%i")'];
    var o = {};
    o.ts = ts;
    o.job = parseInt(obj.job);
    tsList.push(o);

    $('#member-enterance-table-body').append(
      '<tr name="'+obj.job+'">'+
      ' <td data-title="ts">'+ ts +'</td>' +
      ' <td data-title="seatnum">'+ obj.seatnum +'</td>' +
      ' <td data-title="do">'+ obj.do +'</td>' +
      '</tr>'
    );
    if (obj.job == 0) {
      $('tr[name="'+obj.job+'"]').css('background-color', '#baffc9');
    }
    else if(obj.job == 1) {
      $('tr[name="'+obj.job+'"]').css('background-color', '#ffffba');
    }
    else if(obj.job == 2) {
      $('tr[name="'+obj.job+'"]').css('background-color', '#bae1ff');
    }
    else if(obj.job == 3) {
      $('tr[name="'+obj.job+'"]').css('background-color', '#ffb3ba');
    }
  }
  var sum = calcHistory(tsList);
  $('#member-enterance-static-table-body').append(
    '<tr name="total">'+
    ' <td data-title="ts">'+ sum +'</td>' +
    '</tr>'
  );

}
function calcHistory(tmp) {
  var stack = [];
  var sum = 0;
  for (var i = 0; i < tmp.length; i++) {
    // var t = moment(tmp[i], 'YYYY-MM-DD HH:mm');
    var e = tmp[i];
    switch(e.job) {
      case 0:
        stack.push(e.ts);
        break;
      case 1:
        if (stack.length != 0) {
          var s = stack.pop();
          var enter = moment(s, 'YYYY-MM-DD HH:mm');
          var pause = moment(e.ts, 'YYYY-MM-DD HH:mm');
          var duration = moment.duration(pause.diff(enter));
          sum += parseInt(duration.asMinutes());
        }
        break;
      case 2:
        stack.push(e.ts);
        break;
      case 3:
        if (stack.length != 0) {
          var s = stack.pop();
          var enter = moment(s, 'YYYY-MM-DD HH:mm');
          var leave = moment(e.ts, 'YYYY-MM-DD HH:mm');
          var duration = moment.duration(leave.diff(enter));
          sum += parseInt(duration.asMinutes());
        }
        break;
      default:
        break;
    }
  }// end of for
  return sum;
}
function showUsageList(membername, alias) {
  $('#member-usage-list-name').text(membername);
  $('#member-usage-list-id').text(alias);
}

function refreshUsageList() {
  var membername = $('#member-usage-list-name').text();
  var alias = $('#member-usage-list-id').text();
  var startDate = $('#member-usage-datetimepicker-start input').val();
  var endDate = $('#member-usage-datetimepicker-end input').val();

  $.ajax({
    url: '/system/usagelist',
    method: 'post',
    data: {
      membername: membername,
      alias: alias,
      startDate: startDate,
      endDate: endDate
    }
  }).done(function(results) {
    clearUsageList2();
    if (results.err == "0") {
      /* render table with results */
      var list = results.results;
      for (var i = 0; i < list.length; i++) {
        var elt = list[i];
        var d = elt.ts.split("T");
        var pd = elt.payDay;
        if (pd == null) { pd = '-'; }
        else { pd = elt.payDay.split("T"); }

        d = d[0]; pd = pd[0];
        $('#member-usage-table-body').append(
          '<tr name="'+elt.id+'">'+
          ' <td data-title="content">'+ elt.content +'</td>' +
          ' <td data-title="num">'+ elt.product_num +'</td>' +
          ' <td data-title="discount">'+ elt.service +'</td>' +
          ' <td data-title="notpaid">'+ elt.notPaid +'</td>' +
          ' <td data-title="price">'+ elt.price +'</td>' +
          ' <td data-title="salesday">'+ d +'</td>' +
          ' <td data-title="option">'+ elt.sales_option +'</td>' +
          ' <td data-title="payday">'+ pd +'</td>' +
          ' <td data-title="addcoup">'+ elt.addCoup +'</td>' +
          ' <td data-title="usecoup">'+ elt.useCoup +'</td>' +
          ' <td date-title="modify" style="text-align:center">' +
          '   <i class="fa fa-pencil-square-o modify-usage-list fa-2x" aria-hidden="true" style="cursor:pointer;" title="변경"></i> &nbsp;' +
          '   <i class="fa fa-trash-o remove-usage-list fa-2x" aria-hidden="true" style="cursor:pointer;" title="삭제"></i> &nbsp;' +
          ' </td>' +
          '</tr>'
        );
        /* MODIFY USAGE LIST event listener */
        $('tr[name="'+elt.id+'"] td i.modify-usage-list').on('click', function(event) {
          var $this = $(this);
          editUsageList($this);
        });
        /* DELETE USAGE LIST event listener */
        $('tr[name="'+elt.id+'"] td i.remove-usage-list').on('click', function(event) {
          var $this = $(this);
          deleteUsageList($this);
        });

      }

    }
  });
}
function editUsageList($target) {
  var $parent = $target.parent().parent('tr');
  var editable = $parent.find('td:eq(1)').attr("contenteditable");
  if (editable === undefined || editable == 'false') {
    alert("내용을 변경한 뒤 다시한번 더 클릭해주세요. \n\n <수정가능목록> \n  1. 수량\n  2. 할인\n  3. 미납\n  4. 금액\n  5. 납부방법\n  6. 적립코업머니\n  7. 사용코업머니\n");
    $parent.find('td:eq(1)').attr("contenteditable", true); // num of prod
    $parent.find('td:eq(2)').attr("contenteditable", true); // discount
    $parent.find('td:eq(3)').attr("contenteditable", true); // not paid
    $parent.find('td:eq(4)').attr("contenteditable", true); // price
    $parent.find('td:eq(6)').attr("contenteditable", true); // way of pay
    $parent.find('td:eq(8)').attr("contenteditable", true); // add coup
    $parent.find('td:eq(9)').attr("contenteditable", true); // use coup
    return false;
  }
  else if (editable == 'true'){
    $parent.find('td:eq(1)').attr("contenteditable", false); // num of prod
    $parent.find('td:eq(2)').attr("contenteditable", false); // discount
    $parent.find('td:eq(3)').attr("contenteditable", false); // not paid
    $parent.find('td:eq(4)').attr("contenteditable", false); // price
    $parent.find('td:eq(6)').attr("contenteditable", false); // way of pay
    $parent.find('td:eq(8)').attr("contenteditable", false); // add coup
    $parent.find('td:eq(9)').attr("contenteditable", false); // use coup
    var _num        = $parent.find('td:eq(1)').text();
    var _discount   = $parent.find('td:eq(2)').text();
    var _notpaid    = $parent.find('td:eq(3)').text();
    var _price      = $parent.find('td:eq(4)').text();
    var _option     = $parent.find('td:eq(6)').text();
    var _addcoup    = $parent.find('td:eq(8)').text();
    var _usecoup    = $parent.find('td:eq(9)').text();
    var _id         = $parent.attr('name');

    if (Number.isInteger(parseInt(_num)) == false || Number.isInteger(parseInt(_discount)) == false || Number.isInteger(parseInt(_notpaid)) == false ||
      Number.isInteger(parseInt(_price)) == false || Number.isInteger(parseInt(_addcoup)) == false || Number.isInteger(parseInt(_usecoup)) == false) {
      alert('값을 정확히 입력해주세요.');
    }

    else {
      $.ajax({
        url: '/system/editusagelist',
        method: 'post',
        data: {
          num: _num,
          discount: _discount,
          notpaid: _notpaid,
          price: _price,
          option: _option,
          addcoup: _addcoup,
          usecoup: _usecoup,
          id: _id
        }
      }).done(function(results) {
        if (results == '0') {
          alert('변경 완료');
          clearUsageList();
          refreshUsageList();
        }
      });
    }
  }
}

function deleteUsageList($target) {
  var c = confirm('정말로 삭제하시겠습니까?');
  if (c == true) {
    var $parent = $target.parent().parent('tr');
    var id = $parent.attr('name');
    $.ajax({
      url: '/system/deleteusagelist',
      method: 'post',
      data: {
        id: id
      }
    }).done(function(results) {
      if (results == '0') {
        alert('삭제 완료');
        clearUsageList();
        refreshUsageList();
      }
    });
  }
}
