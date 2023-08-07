(function() {
    'use strict';
    kintone.events.on('app.record.index.show', function(event) {
        if (document.getElementById('button_get_data_pca') !== null) {
            return;
        }

        if (document.getElementById('button_input_kns') !== null) {
            return;
        }
        /* Test GET data PCA*/
        var ButtonGetPCA = document.createElement('button');
        ButtonGetPCA.id = 'button_get_data_pca';
        ButtonGetPCA.className = 'gaia-ui-actionmenu-save';
        ButtonGetPCA.innerHTML = 'Test Get data PCA';
        kintone.app.getHeaderMenuSpaceElement().appendChild(ButtonGetPCA);
        /* end Test GET data PCA*/

        /* Test del data PCA*/
        var ButtonDelPCA = document.createElement('button');
        ButtonDelPCA.id = 'button_del_data_pca';
        ButtonDelPCA.className = 'gaia-ui-actionmenu-save';
        ButtonDelPCA.innerHTML = 'Test Delete data PCA';
        kintone.app.getHeaderMenuSpaceElement().appendChild(ButtonDelPCA);
        /* end Test GET data PCA*/

        var buttonTask85 = document.createElement('button');
        buttonTask85.id = 'button_input_kns';
        buttonTask85.className = 'gaia-ui-actionmenu-save';
        buttonTask85.innerHTML = '完成伝票連携';
        kintone.app.getHeaderMenuSpaceElement().appendChild(buttonTask85);

        if (document.getElementById('button_app_発注管理') !== null) {
            return;
        }
        var buttonPustApp発注管理 = document.createElement('button');
        buttonPustApp発注管理.id = 'button_app_発注管理';
        buttonPustApp発注管理.className = 'gaia-ui-actionmenu-save';
        buttonPustApp発注管理.innerHTML = '発注連携,';
        kintone.app.getHeaderMenuSpaceElement().appendChild(buttonPustApp発注管理);
        return event;
    });
})();