/*
  Now memArr, payArr can used globally
*/
var memArr;
var payArr;
$(document).ready(function() {

  $('#choose-payment').on('change', $(this), function(event) {
    /* if change first erae the cash value */
    var val = $(this).prop('selectedIndex');
    if(val === 1) {
      $("#choose-cash").attr("disabled", false);
      $("#choose-cash").val('0');
      var t = $("#choose-payment option:selected").val();
      $("#payment-content").val(t + " 등록");
    }
    else if(val !== 0) {
      $("#choose-cash").attr("disabled", true);
      $("#choose-cash").val(payArr[val-1].price);
      var t = $("#choose-payment option:selected").val();
      $("#payment-content").val(t + " 등록");
    }
  })
  /*
    Buggy : set again disabled = true and placeholder again when window is reopened
  */
  /*
    When trying to submit the form, just validate the input value, and check emptyness.
  */

  $("#payment-submit").click(function(event) {
    event.preventDefault();
    submitPaymentForm();
  });
});

function initPayment(membername, alias, milage) {
  $('#payment-name').val(membername);
  $('#payment-alias').val(alias);
  $('#payment-coupmoney').val(milage);
  $('#choose-discount').val('0');
  $('#payment-usecoup').val('0');
  $('#payment-addcoup').val('0');
  //- When clicked, should get data from database.
  $.ajax({
    url: '/recharge',
    method: 'post'
  }).done(function(results) {
    payArr = results.paymentObj;
    console.log(payArr);


    $('#choose-payment').append("<option>선택해주세요.</option>");
    for (var i = 0; i < payArr.length; i++) {
      var paymentname;
      if(payArr[i].type === "daily") {
        paymentname = payArr[i].name + ' - 하루 단위';
      }
      else if (payArr[i].type === "monthly") {
        paymentname = payArr[i].name + ' - 월 단위';
      }
      else if (payArr[i].type === "halfmonthly") {
        paymentname = payArr[i].name + ' - 보름 단위';
      }
      else {
        paymentname = payArr[i].name;
      }

      $('#choose-payment').append("<option>"+paymentname+"</option>");
    }

    //-$('#recharge-form').css("display", "block");
  });
}

function submitPaymentForm() {
  var memberId    = $("#payment-alias").val();
  var paymentIdx  = $("#choose-payment").prop('selectedIndex');
  var cash        = $("#choose-cash").val();
  var discount    = $('#choose-discount').val();
  var useCoup     = $('#payment-usecoup').val();
  var addCoup     = $('#payment-addcoup').val();
  var option      = $('#payment-option option:selected').text();
  var content     = $('#payment-content').val();
  var memo        = $('#payment-memo').val();
  var membername  = $('#payment-name').val();


  if (discount == "") {
    discount=0;
  }
  if (paymentIdx === 0) {
    alert("요금제를 선택해주세요.");
    event.preventDefault();
  }
  else if (cash === '') {
    alert("금액을 입력해주세요.");
    event.preventDefault();
  }
  else if (Number.isInteger(parseInt(cash))==false || Number.isInteger(parseInt(discount))==false || Number.isInteger(parseInt(addCoup))==false ||
    Number.isInteger(parseInt(useCoup))==false ) {
    alert('값을 정확히 입력해주세요.');
  }
  else {
    $.ajax({
      url: '/charge',
      method: 'post',
      data: {
        minPerDay   :  payArr[paymentIdx-1].timePerDay,
        member      :  memberId,
        paymentId   :  payArr[paymentIdx-1].id,
        type        :  payArr[paymentIdx-1].type,
        price       :  $('#choose-cash').val(),
        paymentName :  payArr[paymentIdx-1].name,
        discount    :  discount,
        addCoup     :  addCoup,
        useCoup     :  useCoup,
        option      :  option,
        content     :  content,
        memo        :  memo,
        membername  :  membername
      }
    }).done(function(result) {
      if (result == "err0") {
        alert('성공적으로 등록되었습니다.');
      }
      else if (result == "err1") {
        alert('다른 요금제를 사용중입니다. 환불 절차를 먼저 거쳐주세요.');
      }
      else if(result =="err2") {
        alert('존재하지 않는 ID입니다.');
      }
      // clean up
      clearPaymentModal();
    });
  }
}

function clearPaymentModal() {
  $("#choose-member").val("");
  $("#choose-payment").prop('selectedIndex', 0);
  $("#choose-cash").val("");
  $('#choose-discount').val("0");
  $('#payment-usecoup').val("0");
  $('#payment-addcoup').val("0");
  $('#payment-option').prop('selectedIndex', 0);
  $('#payment-content').val("");
  $('#payment-memo').val("");
}
