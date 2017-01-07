$(document).ready(function() {
  $('#all-usage-datetimepicker-start').datetimepicker({
    defaultDate: moment().format('YYYY-MM-DD'),
    format: 'YYYY-MM-DD'
  });
  $('#all-usage-datetimepicker-start').data("DateTimePicker");

  $('#all-usage-datetimepicker-end').datetimepicker({
    defaultDate: moment().format('YYYY-MM-DD'),
    format: 'YYYY-MM-DD'
  });
  $('#all-usage-datetimepicker-end').data("DateTimePicker");

  $('#all-usage-datetimepicker-start').on('dp.change', function(e) {
    $('#all-usage-datetimepicker-end').data("DateTimePicker").minDate(e.date);
  });
  $('#all-usage-datetimepicker-end').on('dp.change', function(e) {
    $('#all-usage-datetimepicker-start').data("DateTimePicker").maxDate(e.date);
  });

  $('#refresh-userusagelist').click(function() {
    clearAccountTable();
    refreshUserUsageList();
  });
});

function refreshUserUsageList() {
  var startDate = $('#all-usage-datetimepicker-start input').val();
  var endDate = $('#all-usage-datetimepicker-end input').val();

  $.ajax({
    url: '/account/refreshlist',
    method: 'post',
    data: {
      startDate : startDate,
      endDate   : endDate
    }
  }).done(function(results) {

    appendAccountTable(results.results);
    refreshStaticTable();
  });
}

function appendAccountTable(results) {
  console.log(results);
  for (var i = 0; i < results.length; i++) {
    var o = results[i];
    var ts = (o.ts.toString()).split('T')[0];
    var pd;
    if (o.payday != null) {
      pd = (o.payDay.toString()).split('T')[0];
    }
    else {
      pd = "-";
    }
    $('#all-usage-table-body').append(
      '<tr name="'+o.id+'">'+
      ' <td data-title="name">'+ o.membername +'</td>' +
      ' <td data-title="alias">'+ o.alias +'</td>' +
      ' <td data-title="content">'+ o.content +'</td>' +
      ' <td data-title="num">'+ o.product_num +'</td>' +
      ' <td data-title="discount">'+ o.service  +'</td>' +
      ' <td data-title="notpaid">'+ o.notPaid +'</td>' +
      ' <td data-title="price">'+ o.price+'</td>' +
      ' <td data-title="ts">'+ ts +'</td>' +
      ' <td data-title="option">' + o.sales_option +'</td>' +
      ' <td data-title="payday">' + pd +'</td>' +
      ' <td data-title="addCoup">' + o.addCoup +'</td>' +
      ' <td data-title="useCoup">' + o.useCoup +'</td>' +
      ' <td data-title="modify">' +
      '   <i class="fa fa-pencil-square-o modify-usage-row fa-2x" aria-hidden="true" style="cursor:pointer" title="정보변경"></i> &nbsp;' +
      '   <i class="fa fa-trash-o delete-usage-row fa-2x" aria-hidden="true" style="cursor:pointer" title="삭제"></i> &nbsp;' +
      ' </td>' +
      '</tr>'
    );
    /*
      MODIFY ROW click event handler
    */
    $('tr[name="'+o.id+'"] td i.modify-usage-row').on('click', function(event) {
      var $this = $(this);
      modifyRow($this);
    });
    /*
      DELETE ROW click event handler
    */
    $('tr[name="'+o.id+'"] td i.delete-usage-row').on('click', function(event) {
      var $this = $(this);
      deleteRow($this);
    });
  }
}

function clearAccountTable() {
  var $tbody = document.getElementById('all-usage-table-body');
  while ($tbody.firstChild) {
    $tbody.removeChild($tbody.firstChild);
  }
}

function modifyRow($target) {
  var $parent = $target.parent().parent('tr');
  var id = $parent.attr('name');
  var editable = $parent.find('td:eq(3)').attr("contenteditable");
  if (editable === undefined || editable == 'false') {
    alert("내용을 변경한 뒤 다시한번 클릭해주세요. \n\n <수정가능목록> \n  1. 수량\n  2. 할인\n  3. 미납\n  4. 금액\n  5. 납부방법\n  6. 적립코업머니\n  7. 사용코업머니");
    $parent.find('td:eq(3)').attr("contenteditable", true);
    $parent.find('td:eq(4)').attr("contenteditable", true);
    $parent.find('td:eq(5)').attr("contenteditable", true);
    $parent.find('td:eq(6)').attr("contenteditable", true);
    $parent.find('td:eq(8)').attr("contenteditable", true);
    $parent.find('td:eq(10)').attr("contenteditable", true);
    $parent.find('td:eq(11)').attr("contenteditable", true);
    return false;
  }
  else if (editable == 'true'){
    $parent.find('td:eq(3)').attr("contenteditable", false);
    $parent.find('td:eq(4)').attr("contenteditable", false);
    $parent.find('td:eq(5)').attr("contenteditable", false);
    $parent.find('td:eq(6)').attr("contenteditable", false);
    $parent.find('td:eq(8)').attr("contenteditable", true);
    $parent.find('td:eq(10)').attr("contenteditable", false);
    $parent.find('td:eq(11)').attr("contenteditable", false);

    /* should pack modified data and ajax */
    var  num, discount, notpaid, price, option, addCoup, useCoup;
    num         = $parent.find('td:eq(3)').text();
    discount    = $parent.find('td:eq(4)').text();
    notpaid     = $parent.find('td:eq(5)').text();
    price       = $parent.find('td:eq(6)').text();
    option      = $parent.find('td:eq(8)').text();
    addCoup     = $parent.find('td:eq(10)').text();
    useCoup     = $parent.find('td:eq(11)').text();

    $.ajax({
      url: '/account/modifylist',
      method: 'post',
      data: {
        num     : num,
        discount: discount,
        notpaid : notpaid,
        option  : option,
        price   : price,
        addcoup : addCoup,
        usecoup : useCoup,
        id      : id
      }
    }).done(function(result) {
      alert('변경되었습니다.');
      clearAccountTable();
      refreshUserUsageList();
    });
  }
}

function deleteRow($target) {
  var $parent = $target.parent().parent('tr');
  var id = $parent.attr('name');
  var c = confirm('정말 삭제하시겠습니까?');
  if (c == true) {
    $.ajax({
      url: '/account/deletelist',
      method: 'post',
      data: {
        id: id
      }
    }).done(function(results) {
      alert('삭제되었습니다.');
      clearAccountTable();
      refreshUserUsageList();
    });
  }
}

function refreshStaticTable() {
  var contents = [];
  var options  = [];
  /* static per contents */
  $('#all-usage-table-body tr').each(function() {
    var content = $(this).find('td:eq(2)').text();
    var price   = parseInt($(this).find('td:eq(6)').text());
    var option  = $(this).find('td:eq(8)').text();

    /* collect per content */
    if (contents.length == 0) {
      var no = {};
      no.content = content;
      no.price = price;
      no.num = 1;
      contents.push(no);
    }
    else {
      var c = true;
      for (var i = 0; i < contents.length; i++) {
        if (content == contents[i].content) {
          contents[i].price += price;
          contents[i].num++;
          c = false;
          break;
        }
      }
      if (c) {
        var no = {};
        no.content = content;
        no.price = price;
        no.num = 1;
        contents.push(no);
      }
    }

    if (options.length == 0) {
      var no = {};
      no.option = option;
      no.price = price;
      no.num = 1;
      options.push(no);
    }
    else {
      /* collect per options */
      var c = true;
      for (var i = 0; i < options.length; i++) {
        if (option == options[i].option) {
          options[i].price += price;
          options[i].num++;
          c = false;
          break;
        }
      }
      if (c) {
        var no = {};
        no.option = option;
        no.price = price;
        no.num = 1;
        options.push(no);
      }
    }
  });
  clearStaticTable();
  appendStaticTable(contents, options);
}

function clearStaticTable() {
  var content_tbody = document.getElementById('all-usage-content-static-table-body');
  var option_tbody = document.getElementById('all-usage-option-static-table-body');
  while (content_tbody.firstChild) {
    content_tbody.removeChild(content_tbody.firstChild);
  }
  while(option_tbody.firstChild) {
    option_tbody.removeChild(option_tbody.firstChild);
  }
}

function appendStaticTable(contents, options) {
  for (var i = 0; i < contents.length; i++) {
    var c = contents[i];
    $('#all-usage-content-static-table-body').append(
      '<tr>'+
      ' <td data-title="content">'+ c.content +'</td>' +
      ' <td data-title="num">'+ c.num +'</td>' +
      ' <td data-title="price">'+ c.price +'</td>' +
      ' </td>' +
      '</tr>'
    );
  }
  for (var i = 0; i < options.length; i++) {
    var o = options[i];
    $('#all-usage-option-static-table-body').append(
      '<tr>'+
      ' <td data-title="content">'+ o.option +'</td>' +
      ' <td data-title="num">'+ o.num +'</td>' +
      ' <td data-title="price">'+ o.price +'</td>' +
      ' </td>' +
      '</tr>'
    );
  }
}
/*
  content finder
*/
function content_finder() {
  var input, filter, table, tr, td, i;
  input = document.getElementById("products-filter-withname");
  filter = input.value.toUpperCase();
  table = document.getElementById("all-usage-table-body");
  tr = table.getElementsByTagName("tr");

  for (var i = 0; i < tr.length; i++) {
    td = tr[i].getElementsByTagName("td")[2]; // filter with name
    if (td) {
      if(td.innerHTML.toUpperCase().indexOf(filter) > -1) {
        tr[i].style.display = "";
      }
      else {
        tr[i].style.display = "none";
      }
    }
  }
}

/*
  option finder
*/
function option_finder() {
  var input, filter, table, tr, td, i;
  input = document.getElementById("products-filter-withoption");
  filter = input.value.toUpperCase();
  table = document.getElementById("all-usage-table-body");
  tr = table.getElementsByTagName("tr");

  for (var i = 0; i < tr.length; i++) {
    td = tr[i].getElementsByTagName("td")[8]; // filter with name
    if (td) {
      if(td.innerHTML.toUpperCase().indexOf(filter) > -1) {
        tr[i].style.display = "";
      }
      else {
        tr[i].style.display = "none";
      }
    }
  }
}
