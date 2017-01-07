
function clearSalesWin() {
  $('#sales-total').val('');
  $('#sales-discount').val('');
  $('#sales-notpaid').val('');
  $('#sales-usecoup').val('');
  $('#sales-addcoup').val('');
  $('#sales-final').val('');
  $('#sales-option option:eq(0)').prop('selected', true);
  $('#sales-payday-datetimepicker').val('');
  $('#sales-memo').val('');
}
function clearShoppingList() {
  var $shoppinglist_tbody = document.getElementById("selected-product-table-body");
  /* and also should erase their children */
  while($shoppinglist_tbody.firstChild) {
    $shoppinglist_tbody.removeChild($shoppinglist_tbody.firstChild);
  }
}

function clearShoppingList2() {
  var $productlist_tbody  = document.getElementById("product-table-body");
  var $shoppinglist_tbody = document.getElementById("selected-product-table-body");
  /* and also should erase their children */
  while($shoppinglist_tbody.firstChild) {
    $shoppinglist_tbody.removeChild($shoppinglist_tbody.firstChild);
  }
  while($productlist_tbody.firstChild) {
    $productlist_tbody.removeChild($productlist_tbody.firstChild);
  }
}
/*
  define ShoppingCart Class
*/
const Cart = function() {
  this.total = 0;
  this.numOfProd = 0;
  this.Bundles = {};

  /*
    addProd
  */
  this.addProd = function(prod) {
    var pname = prod.name;
    var pprice = prod.price;
    var h = this.Bundles.hasOwnProperty(pname);
    if (!h) { // if product is not defined in bundels
      this.Bundles[pname] = {};
      this.Bundles[pname].name = pname;
      this.Bundles[pname].num = 1;
      this.Bundles[pname].price = pprice;
      this.Bundles[pname].notpaid = 0;
      this.Bundles[pname].discount = 0;

    }
    else {
      this.Bundles[pname].num++;
    }
    this.total += pprice;
    this.numOfProd++;
  };

  /*
    removeProd
  */
  this.removeProd = function(prod) {
    this.total -= prod.price;
    this.numOfProd--;
  }
};
const cart = new Cart(); /* global */

$(document).ready(function() {

  /*
    determine selling list button clicked
  */
  $('a#determine-shoppinglist').click(function() {
    var $tbody  = $('#selected-product-table-body');
    var $trs    = $('#selected-product-table-body tr');
    var tprice = 0, tdiscount = 0, tnotpaid = 0;

    $trs.each(function() {
      var num       = parseInt($(this).find('td[data-title="num"]').text());
      var price     = parseInt($(this).find('td[data-title="price"]').text());
      var discount  = parseInt($(this).find('td[data-title="discount"]').text());
      var notpaid   = parseInt($(this).find('td[data-title="notpaid"]').text());
      /*before add to total, check first whether each value is NUMBER */
      if (!Number.isInteger(discount) || !Number.isInteger(discount)) {
        alert('금액을 정확히 입력해주세요.');
        return false;
      }
      else {
        tprice    += num * price;
        tdiscount += discount;
        tnotpaid  += notpaid;
      }
    });
    var f = tprice - tdiscount - tnotpaid;
    $('#sales-total').val(tprice);
    $('#sales-discount').val(tdiscount);
    $('#sales-notpaid').val(tnotpaid);
    $('#sales-final').val(f); /* this final cash can be change later by using coup money */
    $('#sales-usecoup').val(0);
    $('#sales-addcoup').val(0);

    alert('선택완료하였습니다.');
  });

  /*
    final selling button clicked
  */
  $('#register-selling').click(function() {
    if ($('#sales-total').val() == "") {
      alert('선택완료를 먼저 해주세요.');
    }
    else {
      var usecoup, addcoup, finalCash, option, paiddate, memo, membername, alias;
      usecoup     = parseInt($('#sales-usecoup').val());
      addcoup     = parseInt($('#sales-addcoup').val());
      option      = $('#sales-option option:selected').text();
      paidDate    = $('#sales-payday-datetimepicker input').val();
      memo        = $('#sales-memo').val();
      membername  = $('#sales-name').val();
      alias       = $('#sales-alias').val();
      var cartObj = JSON.stringify(cart.Bundles);
      $.ajax({
        url: '/system/sales',
        method: 'post',
        data: {
          basket: cartObj,
          usecoup: usecoup,
          addcoup: addcoup,
          option: option,
          paidDate: paidDate,
          memo: memo,
          membername: membername,
          alias: alias
        }
      }).done(function(results) {
        if (results == '0') {
          alert('판매 완료하였습니다.');
          clearShoppingList();
          clearSalesWin();
        }
        else {
          alert('판매 실패하였습니다.');
        }
      });
    }
  });

});

function sellProduct(cart, alias, name, milage) {
  $.ajax({
    url: '/system/productlist',
    method: 'post'
  }).done(function(results) {
    /* render member name, milage */
    $('#sales-name').val(name);
    $('#sales-coupmoney').val(milage);
    $('#sales-alias').val(alias); /* this is hidden input, need when ajax */

    var productList = results.productList;
    for (var i = 0; i < productList.length; i++) {
      var p = productList[i];
      $('#product-table-body').append(
        '<tr name="'+p.product_name+'">'+
        ' <td data-title="name">'+ p.product_name +'</td>' +
        ' <td data-title="group">'+ p.product_group +'</td>' +
        ' <td data-title="price">'+ p.product_price +'</td>' +
        ' <td data-title="memo">'+ p.product_memo +'</td>' +
        ' <td date-title="modify" style="text-align:center">' +
        '   <i class="fa fa-plus add-product" aria-hidden="true" style="cursor:pointer;" title="상품추가"></i> &nbsp;' +
        '   <i class="fa fa-minus remove-product" aria-hidden="true" style="cursor:pointer;" title="상품삭제"></i> &nbsp;' +
        ' </td>' +
        '</tr>'
      );

      /* ADD PRODUCT event listener*/
      $('tr[name="'+p.product_name+'"] td i.add-product').on('click', function(event) {
        var $this = $(this);
        var prod = makeProduct($this);
        ShoppingList(0, prod, cart);
      });
      /* REMOVE PRODUCT event listener*/
      $('tr[name="'+p.product_name+'"] td i.remove-product').on('click', function(event) {
        var $this = $(this);
        var prod = makeProduct($this);
        ShoppingList(1, prod, cart);
      });
    }

    $('#sell-product-modal').css("display", "block");
  });
}
function makeProduct(itself) {
  var $parent = itself.parent().parent('tr');
  var pname   = $parent.find('td[data-title="name"]').text();
  var pprice  = $parent.find('td[data-title="price"]').text();
  var prod = {};
  prod.name = pname;
  prod.price = pprice;
  return prod;
}
/*
  Shopping Cart Script
*/
function ShoppingList(func, prod, cart) {
  var $tbody  = $('#selected-product-table-body');
  var $trs    = $('#selected-product-table-body tr');
  /*
    add
  */
  if (func === 0) {
    /*
      if there's no <tr> then just append
    */
    if ($trs.length == 0) {
      appendShoppingList($tbody, prod);
      cart.addProd(prod); /* add to Cart */
      $('tr[name="'+prod.name+'"] td i.edit-shoppinglist').on('click', function(event) { /* add EDIT event listener */
        var $this = $(this);
        editShoppingList($this);
      });
    }
    else {
      /*
        if there are, then check redundancy and add
      */
      var $target = isProductExist($trs, prod);
      /* if there's no same product */
      if ($target == null) {
        appendShoppingList($tbody, prod);
        $('tr[name="'+prod.name+'"] td i.edit-shoppinglist').on('click', function(event) { /* add EDIT event listener */
          var $this = $(this);
          editShoppingList($this);
        });
      }
      else {
        var num = $target.find('td[data-title="num"]').text();
        var inum = parseInt(num);
        inum++;
        $target.find('td[data-title="num"]').text(inum.toString());
      }
      /* add to Cart */
      cart.addProd(prod);
    }
  }
  /*
    remove
  */
  else if(func === 1) {
    var $target = isProductExist($trs, prod);
    if ($target != null) { /* if $target is null, do nothing. but if not null, then reduce number of product */
      var num = $target.find('td[data-title="num"]').text();
      var inum = parseInt(num);
      inum--;
      $target.find('td[data-title="num"]').text(inum.toString());

      if (inum == 0) { /* if num == 0, then remove tr */
        $target.remove();
      }
    }

  }
}
function appendShoppingList($tbody, prod) {
  $tbody.append(
    '<tr name="'+prod.name+'">'+
    ' <td data-title="name">'+ prod.name +'</td>' +
    ' <td data-title="num">'+ 1 +'</td>' +
    ' <td data-title="price">'+ prod.price +'</td>' +
    ' <td data-title="discount">'+ 0 +'</td>' +
    ' <td data-title="notpaid">'+ 0 +'</td>' +
    ' <td date-title="modify" style="text-align:center">' +
    '   <i class="fa fa-pencil-square-o fa-2x edit-shoppinglist" aria-hidden="true" style="cursor:pointer;" title="수정"></i> &nbsp;' +
    ' </td>' +
    '</tr>'
  );
}
function isProductExist($trs, prod) {
  var $target = null;
  $trs.each(function() {
    var name = $(this).find('td[data-title="name"]').text();
    if (name == prod.name) {
      $target = $(this);
      return false;
    }
  });

  return $target;
}

function editShoppingList($target) {
  var $parent = $target.parent().parent('tr');
  var editable = $parent.find('td:eq(3)').attr("contenteditable");
  if (editable === undefined || editable == 'false') {
    alert("내용을 변경한 뒤 다시한번 더 클릭해주세요. \n\n <수정가능목록> \n  1. 할인\n  2. 미납\n");
    $parent.find('td:eq(3)').attr("contenteditable", true); // discount
    $parent.find('td:eq(4)').attr("contenteditable", true); // not paid
    return false;
  }
  else if (editable == 'true'){
    $parent.find('td:eq(3)').attr("contenteditable", false);
    $parent.find('td:eq(4)').attr("contenteditable", false);
    var _discount = $parent.find('td:eq(3)').text();
    var _notpaid  = $parent.find('td:eq(4)').text();
    /*
      change Cart bundle data
    */
    var name = $parent.find('td:eq(0)').text();
    cart.Bundles[name].discount = parseInt(_discount);
    cart.Bundles[name].notpaid  = parseInt(_notpaid);
    alert('변경 완료');
  }
}
