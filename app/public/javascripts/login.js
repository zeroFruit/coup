$(document).ready(function() {
  $('#changeInfo').click(function() {
    $('#chg-info-modal').css('display', 'block');
  });
  $('#chg-userinfo-submit').click(function() {
    chgAdminInfo();
  });
});

function chgAdminInfo() {
  var $username = $('#chg-username');
  var $password = $('#chg-password');
  var username = $username.val();
  var password = $password.val();

  if (username == "" || password == "") {
    alert('값을 정확히 입력해주세요.');
  }
  else {
    var c = confirm('변경하시겠습니까?');
    if (c) {
      $.ajax({
        url: '/system/chgadmininfo',
        method: 'post',
        data: {
          username: username,
          password: password
        }
      }).done(function(results) {
        if (results == '0') {
          alert('변경하였습니다.');
          clearChgInfoModal();
        }
      });
    }
  }
}
function clearChgInfoModal() {
  $('#chg-username').val('');
  $('#chg-password').val('');
}
