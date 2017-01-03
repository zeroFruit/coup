//-
//- When the user clicks anywhere outside of the modal, close it
//-

window.onclick = function(event) {
  var register            = document.getElementById('register-form');
  var recharge            = document.getElementById('recharge-form');
  var active_members_list = document.getElementById('active-members-list');
  var all_members_list    = document.getElementById('all-members-list');
  var account_list        = document.getElementById('account-list');
  var use_milage          = document.getElementById('use-milage-modal');
  var charge_milage       = document.getElementById('charge-milage-modal');
  var reserve_studyroom   = document.getElementById('studyroom-reservation-modal');
  var payback             = document.getElementById('payback-modal');
  var holdoff             = document.getElementById('holdoff-modal');
  var history             = document.getElementById('history-modal');
  var chgInfoModal        = document.getElementById('chg-info-modal');


  if (event.target == chgInfoModal) {
    chgInfoModal.style.display = "none";
    clearChgInfoModal(); // defined in login.js
  }

  if (event.target == holdoff) {
    holdoff.style.display = "none";
    var holdoffId = document.getElementById("holdoff-name").value = "";
    var wrapper   = document.getElementById("holdoff-hidden-container");
    var container = document.getElementById("holdoff-result");

    wrapper.style.display = "none";
    while(container.firstChild) {
      container.removeChild(container.firstChild);
    }

    return false;
  }

  if (event.target == payback) {
    payback.style.display = "none";
    var paybackId = document.getElementById("payback-name").value = "";
    var container = document.getElementById("payback-result");
    var submitform= document.getElementById("payback-submitform");

    container.style.display = "none";
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
    submitform.style.display = "none";

    return false;
  }

  if (event.target == recharge) {
    recharge.style.display = "none";
    var paymentList = document.getElementById("choose-payment");
    var memberList  = document.getElementById("choose-member");
    var cash        = document.getElementById("choose-cash");

    while(paymentList.firstChild) {
      paymentList.removeChild(paymentList.firstChild);
    }
    memberList.value = "";
    cash.value = "";

    return false;
  }

  if (event.target == register) {
      register.style.display = "none";

      return false;
  }

  if(event.target == active_members_list) {
    active_members_list.style.display = "none";
    var tbody = document.getElementById("active-members-table-body");
    /* and also should erase their children */
    while(tbody.firstChild) {
      tbody.removeChild(tbody.firstChild);
    }

    return false;
  }

  if (event.target == all_members_list) {
    all_members_list.style.display = "none";
    var tbody = document.getElementById("all-members-table-body");

    while (tbody.firstChild) {
      tbody.removeChild(tbody.firstChild);
    }

    return false;
  }

  if (event.target == account_list) {
    account_list.style.display = "none";
    /*
      AND also erase old value
    */
    var tbody = document.getElementById("account-table-body");
    while (tbody.firstChild) {
      tbody.removeChild(tbody.firstChild);
    }

    return false;
  }

  if (event.target == use_milage) {
    use_milage.style.display = "none";
    document.getElementById("use-milage-name").value = "";
    document.getElementById("amount-use-milage").value = "";

    return false;
  }

  if (event.target == charge_milage) {
    charge_milage.style.display = "none";
    document.getElementById("charge-milage-name").value = "";
    document.getElementById("amount-charge-milage").value = "";

    return false;
  }

  if (event.target == reserve_studyroom) {
    var select_hours_container = document.getElementById('select-hours-container');
    reserve_studyroom.style.display = "none";
    /*
      also hide select hour form
    */
    select_hours_container.style.display = 'none';

    return false;
  }

  if(event.target == history) {
    history.style.display = "none";
    var history_table = document.getElementById('history-table-body');
    while(history_table.firstChild) {
      history_table.removeChild(history_table.firstChild);
    }
    return false;
  }
}// end of function
