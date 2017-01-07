$(document).ready(function() {
  /*
    When the user clicks anywhere outside of the modal, close it
  */
  window.onclick = function(event) {
    var product_list          = document.getElementById('product-list');
    var add_new_group_modal   = document.getElementById('add-new-group-modal');
    var add_new_product_modal = document.getElementById('add-new-product-modal');
    var modify_group_modal    = document.getElementById('modify-group-modal');
    var modify_product_modal  = document.getElementById('modify-product-modal');

    if (event.target == product_list) {
      product_list.style.display = "none";
      eraseOldProdList();
    }



    if (event.target == add_new_group_modal) {
      add_new_group_modal.style.display = "none";
      eraseOldProdList();
      renderProdModalList();
    }

    if (event.target == add_new_product_modal) {
      eraseOldGroupOption('product-group-select'); // erase old select options
      add_new_product_modal.style.display = "none";
      eraseOldProdList();
      renderProdModalList();
    }



    if (event.target == modify_group_modal) {
      modify_group_modal.style.display = "none";
      eraseOldProdList();
      renderProdModalList();
    }

    if (event.target == modify_product_modal) {
      eraseOldGroupOption('modify-product-group-select'); // erase old select option
      modify_product_modal.style.display = "none";
      eraseOldProdList();
      renderProdModalList();
    }
  }
});
