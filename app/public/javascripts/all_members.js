$(document).ready(function() {
  $('#all-members-table').tablesorter(); // initialize table sorter
  /*
    All member list button clicked
  */
  $('a#all-members').click(function(event) {
    refreshAllMemberTable();
  });
});
function clearAllMemberTable() {
  var $tbody = document.getElementById('all-members-table-body');
  while ($tbody.firstChild) {
    $tbody.removeChild($tbody.firstChild);
  }
}
function refreshAllMemberTable() {
  $.ajax({
    url: '/system/all-members',
    method: 'post',
  }).done(function(results) {
    var json = JSON.parse(results);
    var memberList = json.memberList;
    var pnameList  = json.pnameList;

    for (var i = 0; i < pnameList.length; i++) {
      var o = memberList[i];
      var sex;
      if (o.sex === 0) sex = "남";
      else             sex = "여";

      $('#all-members-table-body').append(
        '<tr name="member-'+i+'">'+
        ' <td data-title="ID">'+ o.alias +'</td>' +
        ' <td data-title="membername">'+ o.membername +'</td>' +
        ' <td data-title="payment">'+ pnameList[i]  +'</td>' +
        ' <td data-title="leftDay">'+ o.leftDay +'</td>' +
        ' <td data-title="seat">'+ o.seatnum+'</td>' +
        ' <td data-title="sex">'+ sex +'</td>' +
        ' <td data-title="prepare">' + o.prepare +'</td>' +
        ' <td data-title="milage">' + o.milage +'</td>' +
        ' <td data-title="memo">' + o.memo +'</td>' +
        ' <td data-title="modify" style="text-align:center">' +
        '   <i class="fa fa-pencil-square-o modify-member fa-2x" aria-hidden="true" style="cursor:pointer" title="회원정보변경"></i> &nbsp;' +
        '   <i class="fa fa-trash-o delete-member fa-2x" aria-hidden="true" style="cursor:pointer" title="회원삭제"></i> &nbsp;' +
        '   <i class="fa fa-list-alt list-member-usage fa-2x" aria-hidden="true" style="cursor:pointer" title="이용내역"></i> &nbsp;' +
        '   <i class="fa fa-money sell-product fa-2x" aria-hidden="true" style="cursor:pointer" title="상품판매"></i> &nbsp;' +
        '   <i class="fa fa-star new-payment fa-2x" aria-hidden="true" style="cursor:pointer" title="요금제등록"></i> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' +
        '   <i class="fa fa-plus add-coup fa-2x" aria-hidden="true" style="cursor:pointer" title="코업머니충전"></i> &nbsp;' +
        '   <i class="fa fa-minus use-coup fa-2x" aria-hidden="true" style="cursor:pointer" title="코업머니사용"></i> &nbsp;&nbsp;' +
        '   <i class="fa fa-reply payback fa-2x" aria-hidden="true" style="cursor:pointer" title="요금제환불"></i> &nbsp;&nbsp;' +
        ' </td>' +
        '</tr>'
      );
      /*
        all member MODIFY click event handler
      */
      $('tr[name="member-'+i+'"] td i.modify-member').on('click', function(event) {
        var $parent = $(this).parent().parent('tr');
        var id = $parent.find('td:eq(0)').text();
        var editable = $parent.find('td:eq(1)').attr("contenteditable");
        if (editable === undefined || editable == 'false') {
          alert("내용을 변경한 뒤 다시한번 클릭해주세요. \n\n <수정가능목록> \n  1. 이름\n  2. 잔여 일\n  3. 성별\n  4. 준비시험\n  5. 메모");
          $parent.find('td:eq(1)').attr("contenteditable", true); // membername
          //$parent.find('td:eq(2)').attr("contenteditable", true);
          $parent.find('td:eq(3)').attr("contenteditable", true); // left day
          //$parent.find('td:eq(4)').attr("contenteditable", true);
          $parent.find('td:eq(5)').attr("contenteditable", true);
          $parent.find('td:eq(6)').attr("contenteditable", true);
          $parent.find('td:eq(8)').attr("contenteditable", true);
          return false;
        }
        else if (editable == 'true'){

          $parent.find('td:eq(1)').attr("contenteditable", false);
          //$parent.find('td:eq(2)').attr("contenteditable", false);
          $parent.find('td:eq(3)').attr("contenteditable", false);
          //$parent.find('td:eq(4)').attr("contenteditable", false);
          $parent.find('td:eq(5)').attr("contenteditable", false);
          $parent.find('td:eq(6)').attr("contenteditable", false);
          $parent.find('td:eq(8)').attr("contenteditable", false);

          /* should pack modified data and ajax */
          var membername  = $parent.find('td:eq(1)').text();
          //var payment     = $parent.find('td:eq(2)').text();
          var leftDay     = $parent.find('td:eq(3)').text();
          var sex         = $parent.find('td:eq(5)').text();
          var prepare     = $parent.find('td:eq(6)').text();
          var memo        = $parent.find('td:eq(8)').text();

          $.ajax({
            url: '/system/modify-member-info',
            method: 'post',
            data: {
              id: id,
              membername: membername,
              leftDay: leftDay,
              //payment: payment,
              sex: sex,
              prepare: prepare,
              memo: memo
            }
          }).done(function(result) {
            alert('변경되었습니다.');
          });
        }
      });
      /*
        all member DELETE click event handler
      */
      $('tr[name="member-'+i+'"] td i.delete-member').on('click', function(event) {
        var r = confirm("삭제하시겠습니까?");
        if (r == true) {
          var $parent = $(this).parent().parent('tr');
          var id = $parent.find('td:eq(0)').text();

          $.ajax({
            url: '/system/delete-member-info',
            method: 'post',
            data: {id: id}
          }).done(function(result) {
            alert('삭제되었습니다.');
          });
        }
      });

      /*
        all member SELL PRODUCT click event handler
      */
      $('tr[name="member-'+i+'"] td i.sell-product').on('click', function(event) {
        var $parent = $(this).parent().parent('tr');
        var alias   = $parent.find('td[data-title="ID"]').text();
        var name    = $parent.find('td[data-title="membername"]').text();
        var milage  = $parent.find('td[data-title="milage"]').text();
        /* 1. get the product list */
        sellProduct(cart, alias, name, milage); // in accountRelated.js cart is defined
      });

      /*
        all member LIST USAGE click event handler
      */
      $('tr[name="member-'+i+'"] td i.list-member-usage').on('click', function(event) {
        var $parent = $(this).parent().parent('tr');
        var alias   = $parent.find('td[data-title="ID"]').text();
        var name    = $parent.find('td[data-title="membername"]').text();
        showUsageList(name, alias);
        $('#member-usage-list-modal').css("display", "block");
      });

      /* NEW PAYMENT click event handler */
      $('tr[name="member-'+i+'"] td i.new-payment').on('click', function(event) {
        var $parent = $(this).parent().parent('tr');
        var alias   = $parent.find('td[data-title="ID"]').text();
        var name    = $parent.find('td[data-title="membername"]').text();
        var milage  = $parent.find('td[data-title="milage"]').text();
        initPayment(name, alias, milage);
        $('#new-payment-modal').css("display", "block");
      });

      /* ADD COUP click event handler */
      $('tr[name="member-'+i+'"] td i.add-coup').on('click', function(event) {
        var $parent = $(this).parent().parent('tr');
        var alias   = $parent.find('td[data-title="ID"]').text();
        var name    = $parent.find('td[data-title="membername"]').text();
        var milage  = $parent.find('td[data-title="milage"]').text();
        initAddMilage(name, alias, milage);
        $('#charge-milage-modal').css("display", "block");
      });

      /* USE COUP click event handler */
      $('tr[name="member-'+i+'"] td i.use-coup').on('click', function(event) {
        var $parent = $(this).parent().parent('tr');
        var alias   = $parent.find('td[data-title="ID"]').text();
        var name    = $parent.find('td[data-title="membername"]').text();
        var milage  = $parent.find('td[data-title="milage"]').text();
        initUseMilage(name, alias, milage);
        $('#use-milage-modal').css("display", "block");
      });

      /* PAYBACK click event handler */
      $('tr[name="member-'+i+'"] td i.payback').on('click', function(event) {
        var $parent = $(this).parent().parent('tr');
        var alias   = $parent.find('td[data-title="ID"]').text();
        var name    = $parent.find('td[data-title="membername"]').text();
        var milage  = $parent.find('td[data-title="milage"]').text();
        var leftDay = $parent.find('td[data-title="leftDay"]').text();
        var payment = $parent.find('td[data-title="payment"]').text();
        initPayback(name, alias, milage, leftDay, payment);
        $('#payback-modal').css("display", "block");
      });
    }
    /*
      All members table sorter
    */
    $('#all-members-table').trigger('update');

    $('#all-members-list').css("display", "block");
  });
}
