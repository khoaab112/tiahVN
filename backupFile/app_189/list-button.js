(function () {
  'use strict';
  kintone.events.on('app.record.index.show', function (event) {
    if (document.getElementById('get_button_1') !== null) {
      return;
    }
    
    if (document.getElementById('btn-task-84') !== null) {
      return;
    }
    
    /*Button 日付チェック　*/
    var myButton6 = document.createElement('button');
    myButton6.id = 'get_button_6';
    myButton6.className = 'gaia-ui-actionmenu-save';
    myButton6.innerHTML = '日付チェック';
    myButton6.onclick = async function () {
      document.querySelector('#get_button_6').disabled = true;
      await checkDate();
      document.querySelector('#get_button_6').disabled = false;
    }
    kintone.app.getHeaderMenuSpaceElement().appendChild(myButton6);
    
    var buttonTask84 = document.createElement('button');
    buttonTask84.id = 'btn-task-84';
    buttonTask84.className = 'gaia-ui-actionmenu-save';
    buttonTask84.innerHTML = '受注Noセット';
     kintone.app.getHeaderMenuSpaceElement().appendChild(buttonTask84);
     
    if (document.getElementById('btn-task-85') !== null) {
      return;
    }
    
    /*Button '在庫チェック */
    var myButton1 = document.createElement('button');
    myButton1.id = 'btn-get-stock';
    myButton1.className = 'gaia-ui-actionmenu-save';
    myButton1.innerHTML = '在庫チェック';
    myButton1.onclick = async function () {
      document.querySelector('#btn-get-stock').disabled = true;
      alert('在庫チェック');
      document.querySelector('#btn-get-stock').disabled = false;
    }
    kintone.app.getHeaderMenuSpaceElement().appendChild(myButton1);
    /*Button Push data to app 発注管理*/
    var buttonTo231 = document.createElement('button');
    buttonTo231.id = 'push_button_231';
    buttonTo231.className = 'gaia-ui-actionmenu-save';
    buttonTo231.innerHTML = '発注管理連携';
    kintone.app.getHeaderMenuSpaceElement().appendChild(buttonTo231);
     /*Button Push data to app 受注伝票*/   
    var buttonTo308 = document.createElement('button');
    buttonTo308.id = 'push_button_308';
    buttonTo308.className = 'gaia-ui-actionmenu-save';
    buttonTo308.innerHTML = '受注伝票連携';
    kintone.app.getHeaderMenuSpaceElement().appendChild(buttonTo308);


    var myButton3 = document.createElement('button');
    myButton3.id = 'get_button_3';
    myButton3.className = 'gaia-ui-actionmenu-save';
    myButton3.innerHTML = 'セット品確認';
    myButton3.onclick = async function () {
      document.querySelector('#get_button_3').disabled = true;
      alert('セット品確認');
      document.querySelector('#get_button_3').disabled = false;
    }
    // kintone.app.getHeaderMenuSpaceElement().appendChild(myButton3);

    var myButton4 = document.createElement('button');
    myButton4.id = 'create_出荷指示書';
    myButton4.className = 'gaia-ui-actionmenu-save';
    myButton4.innerHTML = '出荷指示';
    // myButton4.onclick = async function () {
    //   document.querySelector('#create_出荷指示書').disabled = true;
    //   alert('出荷指示');
    //   document.querySelector('#create_出荷指示書').disabled = false;
    // }

    kintone.app.getHeaderMenuSpaceElement().appendChild(myButton4);


    /* Test GET data PCA*/
      var ButtonGetPCA = document.createElement('button');
      ButtonGetPCA.id = 'button_get_data_pca';
      ButtonGetPCA.className = 'gaia-ui-actionmenu-save';
      ButtonGetPCA.innerHTML = 'Test Get data PCA';
      kintone.app.getHeaderMenuSpaceElement().appendChild(ButtonGetPCA);
    /* end Test GET data PCA*/
    
    var buttonTask85 = document.createElement('button');
    buttonTask85.id = 'btn-task-85';
    buttonTask85.className = 'gaia-ui-actionmenu-save';
    buttonTask85.innerHTML = '受注Noクリア';
    kintone.app.getHeaderMenuSpaceElement().appendChild(buttonTask85);
    
    return event;
  });
})();
