$(document).ready(function() {
  /*
    product modal
  */
  $('a#product-list').click(function(event) {
    /* before tablesorter, get list of product group and product list */
    renderProdModalList();
    $('#product-list').css("display", "block");
  });


  /* modify group button clicked */
  $('a#register-modify-product-group').click(function(event) {
    var oldname = $('#modify-hidden-product-group').val();
    var newname = $('#modify-product-group').val();

    $.ajax({
      url: '/system/modifyproductgroup',
      method: 'post',
      data: {
        oldname: oldname,
        newname: newname
      }
    }).done(function(results) {
      console.log(results);
      if (results == '0') {
        alert('성공적으로 변경되었습니다.');
        $('modify-product-group').val('');
      }
    });
  });


  /* modify product button clicked */
  $('a#register-modify-product').click(function(event) {
    var $name   = $('#modify-product-name');
    var $price  = $('#modify-product-price');
    var $memo   = $('#modify-product-memo')
    var $select = $('#modify-product-group-select');

    var mId     = $('#modify-hidden-product-id').val(); // get id from hidden
    var newName   = $name.val();
    var newPrice  = $price.val();
    var newMemo   = $memo.val();
    var group = $select.find('option:selected').val();

    $.ajax({
      url: '/system/modifyproduct',
      method: 'post',
      data: {
        mid: mId,
        name: newName,
        price: newPrice,
        memo: newMemo,
        group: group
      }
    }).done(function(results) {
      if (results == '0') {
        alert('성공적으로 수정되었습니다.');
      }
      else {
        alert('오류가 발생하였습니다.');
      }
      /* erase input data */
      $name.val('');
      $price.val('');
      $memo.val('');
      $('#modify-product-group-select option:eq(0)').attr('selected', 'selected');
      $
    });
  });
    /* inside ADD NEW GROUP window */
    $('a#new-group').click(function(event) {
      $('#add-new-group-modal').css("display", "block");
    });

      /* after click submit button, validate and submit to server */
      $('#register-new-product-group').click(function(event) {
        var $input = $('#new-product-group');
        var gn     = $input.val();
        if (gn === "") {
          alert('그룹명을 입력해주세요.');
        }
        else {
          var c = confirm("[ "+gn+" ] 그룹을 등록하시겠습니까?");
          if (c == true) {
            $.ajax({
              url: '/system/newproductgroup',
              method: 'post',
              data: {
                group: gn
              }
            }).done(function(results) {
              console.log(results);
              /* erase old input val*/
              $input.val("");
              if (results == "0") {
                alert('성공적으로 등록되었습니다.');
              }
              else {
                alert('등록에 실패했습니다.');
              }
            });
          }
        }
      });

    /* inside ADD NEW PRODUCT window */
    $('a#new-product').click(function(event) {
      /*
        before modal block, should get list of group
      */
      renderGroupOption('#product-group-select');
      $('#add-new-product-modal').css("display", "block");
    });

      /* after click submit button, validate and submit to server */
      $('#register-new-product').click(function(event) {
        var $select = $('#product-group-select');
        var $name   = $('#product-name');
        var $price  = $('#product-price');
        var $memo   = $('#product-memo');

        var group = $select.find('option:selected').val();

        if (group == "" || $name.val() == "" || $price.val() == "" || Number.isInteger(parseInt($price.val())) == false || parseInt($price) < 0) {
          alert('값을 정확히 입력해주세요.');
        }
        else {
          var content = "그룹명: "+group+"\n";
          content += "상품명: " + $name.val() +"\n";
          content += "가격: " + $price.val() +"\n";
          content += "설명: " + $memo.val() +"\n";

          var c = confirm(content);
          if (c == true) {
            $.ajax({
              url: '/system/product',
              method: 'post',
              data: {
                group: group,
                name: $name.val(),
                price: $price.val(),
                memo: $memo.val()
              }
            }).done(function(results) {
              if (results == '0') {
                alert('성공적으로 등록되었습니다.');
                /* clear input data */
                $name.val('');
                $price.val('');
                $memo.val('');
                $('#product-group-select option:eq(0)').attr('selected', 'selected');
              }
            });
          }
        }
      });
});
/*
  renderProdModalList
    get product group, product list from db then render on modal
*/
function renderProdModalList() {
  $.ajax({
    url: '/system/allproductList',
    method: 'post'
  }).done(function(results) {
    if (results.err == "0") {
      var pg = results.productGroupList;
      var p  = results.productList;

      /*
        then append PRODUCT GROUP
      */
      for (var i = 0; i < pg.length; i++) {
        var pge = pg[i];

        if (i == 0) { /* first element should not be erased */
          $('#productgroup-table-body').append(
            '<tr name="'+pge.id+'">'+
            ' <td data-title="name">'+ pge.name +'</td>' +
            ' <td data-title="modify" style="text-align:center">' +
            ' </td>' +
            '</tr>'
          );
        }
        if (i !== 0) {
          $('#productgroup-table-body').append(
            '<tr name="'+pge.id+'">'+
            ' <td data-title="name">'+ pge.name +'</td>' +
            ' <td data-title="modify" style="text-align:center">' +
            '   <i class="fa fa-pencil-square-o modify-group fa-2x" aria-hidden="true" style="cursor:pointer" title="그룹명 변경"></i> &nbsp;' +
            '   <i class="fa fa-trash-o delete-group fa-2x" aria-hidden="true" style="cursor:pointer" title="그룹삭제"></i> &nbsp;' +
            ' </td>' +
            '</tr>'
          );
        }

        /* add MODIFY event listener */
        $('tr[name="'+pge.id+'"] td i.modify-group').on('click', function(event) {
          /*
            if client trying to change group name, then product included in this group should be updated
          */
          var $parent = $(this).parent().parent('tr');
          var oldname = $parent.find('td[data-title="name"]').text();
          var id      = $parent.attr('name');
          $('#modify-product-group').val(oldname);
          $('#modify-hidden-product-group').val(oldname); // this is need to update product list
          $('#modify-hidden-product-group-id').val(id);
          $('#modify-group-modal').css('display', 'block');

        });

        /* add DELETE event listener */
        $('tr[name="'+pge.id+'"] td i.delete-group').on('click', function(event) {
          var $parent = $(this).parent().parent('tr');
          var name = $parent.find('td[data-title="name"]').text();
          var c = confirm('그룹 [ '+name+' ] 이 삭제됩니다.');
          if (c == true) {
            $.ajax({
              url: '/system/deleteproductgroup',
              method: 'post',
              data: {
                name: name
              }
            }).done(function(results) {
              if (results == "0") {
                alert('삭제되었습니다.');
                eraseOldProdList();
                renderProdModalList();
              }
            });
          }
        });
      }
      /*
        then append PRODUCT
      */
      for (var i = 0; i < p.length; i++) {
        var pe = p[i];
        $('#product-table-body').append(
          '<tr name="'+pe.id+'">'+
          ' <td data-title="name">'+  pe.product_name +'</td>' +
          ' <td data-title="group">'+ pe.product_group +'</td>' +
          ' <td data-title="price">'+ pe.product_price +'</td>' +
          ' <td data-title="memo">'+  pe.product_memo +'</td>' +
          ' <td data-title="modify" style="text-align:center">' +
          '   <i class="fa fa-pencil-square-o modify-product fa-2x" aria-hidden="true" style="cursor:pointer" title="상품정보변경"></i> &nbsp;' +
          '   <i class="fa fa-trash-o delete-product fa-2x" aria-hidden="true" style="cursor:pointer" title="상품삭제"></i> &nbsp;' +
          ' </td>' +
          '</tr>'
        );

        /* add MODIFY event listener */
        $('tr[name="'+pe.id+'"] td i.modify-product').on('click', function(event) {
          /*
            before open modal, render old things
          */
          renderGroupOption('#modify-product-group-select');
          var $parent  = $(this).parent().parent('tr');
          var oldname  = $parent.find('td[data-title="name"]').text();
          var oldgroup = $parent.find('td[data-title="group"]').text();
          var oldprice = $parent.find('td[data-title="price"]').text();
          var oldmemo  = $parent.find('td[data-title="memo"]').text();
          var id       = $parent.attr('name');

          $('#modify-product-name').val(oldname);
          $('#modify-product-price').val(oldprice);
          $('#modify-product-memo').val(oldmemo);
          $('#modify-hidden-product-id').val(id); /* save id to hidden */
          /* now block modal */
          $('#modify-product-modal').css('display', 'block');
        });

        /* add DELETE event listener */
        $('tr[name="'+pe.id+'"] td i.delete-product').on('click', function(event) {
          var $parent  = $(this).parent().parent('tr');
          var id = $parent.attr('name');
          var name = $(this).parent().parent().find('td[data-title="name"]').text();
          var c = confirm('정말로 '+ name +'을 삭제하시겠습니까?');
          if (c == true) {
            $.ajax({
              url: '/system/deleteproduct',
              method: 'post',
              data: {
                did: id
              }
            }).done(function(results) {
              if (results == '0') {
                alert('성공적으로 삭제하였습니다.');
                eraseOldProdList();
                renderProdModalList();
              }
              else {
                alert('오류가 발생했습니다.');
              }
            });
          }
        });
      }
    }
    /* table sort product-table*/
    $('#product-table').tablesorter();
    $('#productgroup-table').tablesorter();

  });
}

/*
  renderGroupOption
    render <option> elements when add/modify product

    $selectId   <select> tag id
*/
function renderGroupOption($selectId) {
  $.ajax({
    url: '/system/productgrouplist',
    method: 'post'
  }).done(function(results) {
    console.log(results);
    var gl = results.results;
    if (results.err == "0") {
      for (var i = 0; i < gl.length; i++) {
        var g = gl[i];
        $($selectId).append(
          '<option name="'+g.id+'" value="'+g.name+'"> '+g.name+' </option>'
        )
      }
    }

  });
}

/*
  eraseOldGroupOption
    erase old <option> elements when finishing job

    $selectId   <select> tag id
*/
function eraseOldGroupOption($selectId) {
  var $select = document.getElementById($selectId);
  while($select.firstChild) {
    $select.removeChild($select.firstChild);
  }
}
/*
  eraseOldProdList
    when close modal clear old list
*/
function eraseOldProdList() {
  var $group_tbody = document.getElementById('productgroup-table-body');
  var $prod_tbody  = document.getElementById('product-table-body');
  while ($group_tbody.firstChild) {
    $group_tbody.removeChild($group_tbody.firstChild);
  }
  while ($prod_tbody.firstChild) {
    $prod_tbody.removeChild($prod_tbody.firstChild);
  }
}
