(function () {
  'use strict';
  kintone.events.on('app.record.index.show', function (event) {
    if (document.getElementById('button_input_hac') !== null) {
      return;
    }
    
    /* handle inputJUC*/
      var ButtonInputHAC = document.createElement('button');
      ButtonInputHAC.id = 'button_input_hac';
      ButtonInputHAC.className = 'gaia-ui-actionmenu-save';
      ButtonInputHAC.innerHTML = '発注伝票連携';
      kintone.app.getHeaderMenuSpaceElement().appendChild(ButtonInputHAC);
    /* end handle inputJUC*/
    
    /* Test GET data PCA*/
      var ButtonGetPCA = document.createElement('button');
      ButtonGetPCA.id = 'button_get_data_pca';
      ButtonGetPCA.className = 'gaia-ui-actionmenu-save';
      ButtonGetPCA.innerHTML = 'Test Get data PCA';
      kintone.app.getHeaderMenuSpaceElement().appendChild(ButtonGetPCA);
    /* end Test GET data PCA*/
    return event;
  });
})();
