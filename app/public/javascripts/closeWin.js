//-
//- When the user clicks anywhere outside of the modal, close it
//-

window.onclick = function(event) {
  var register            = document.getElementById('register-form');
  var active_members_list = document.getElementById('active-members-list');
  var all_members_list    = document.getElementById('all-members-list');
  var use_milage          = document.getElementById('use-milage-modal');
  var charge_milage       = document.getElementById('charge-milage-modal');
  var reserve_studyroom   = document.getElementById('studyroom-reservation-modal');
  var payback             = document.getElementById('payback-modal');
  var holdoff             = document.getElementById('holdoff-modal');
  var history             = document.getElementById('history-modal');

  var usage_list          = document.getElementById('member-usage-list-modal');
  var payment_modal       = document.getElementById('new-payment-modal');

  if(event.target == payment_modal) {
    payment_modal.style.display = "none";
    clearPaymentModal();
    clearAllMemberTable();
    refreshAllMemberTable();
    return false;
  }

  if (event.target == usage_list) {
    usage_list.style.display = "none";
    clearUsageList();
    return false;
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
    clearPaybackModal();
    clearAllMemberTable();
    refreshAllMemberTable();
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

  if (event.target == use_milage) {
    use_milage.style.display = "none";
    clearUseMilageWin();

    clearAllMemberTable();
    refreshAllMemberTable();
    return false;
  }

  if (event.target == charge_milage) {
    charge_milage.style.display = "none";
    clearChargeMilageWin();

    clearAllMemberTable();
    refreshAllMemberTable();
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

  var usage_list_modal         = document.getElementById('member-usage-list-modal');
  if(event.target == usage_list_modal) {
    usage_list_modal.style.display = "none";
    clearUsageList();
    clearAllMemberTable();
    refreshAllMemberTable();
    return false;
  }

  var sell_product_modal         = document.getElementById('sell-product-modal');
  if(event.target == sell_product_modal) {
    sell_product_modal.style.display = "none";
    clearShoppingList2();
    clearSalesWin();
    clearAllMemberTable();
    refreshAllMemberTable();
    return false;
  }

}// end of function
