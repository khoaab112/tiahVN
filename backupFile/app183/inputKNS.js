(function () {
    'use strict';
    const appId = kintone.app.getId();
    const startId = 0; //id dau tien co du lieu(id co du lieu la 100 thi khai bao startID:99)
    const rootUri = "https://west01.pcawebapi.jp/v1/Kon20/";   // Web-API ルートURL
    const client_id = "a62570417b364e2084774433fc7d18d3";
    const client_secret = "OCX/C5Cf+7lbmIQOeaiGyJUZXz0Pq1+ik1UJ7v64NPw=";
    const dataAreaName = "P20V01C321KON0001";
    const serviceUserId = "19519058";
    const servicePassword = "8EVHKpZv";
    const systemUserId = "01";
    const systemPassword = "0000";
    const bumonCode = "";

    // const rootUri = "https://west01.pcawebapi.jp/v1/Kon20/";   // Web-API ルートURL
    // const client_id = "a62570417b364e2084774433fc7d18d3";
    // const client_secret = "OCX/C5Cf+7lbmIQOeaiGyJUZXz0Pq1+ik1UJ7v64NPw=";
    // const dataAreaName = "P20V01C800KON0001";
    // const serviceUserId = "10732564";
    // const servicePassword = "ZE5jbDYt";
    // const systemUserId = "user1";
    // const systemPassword = "marusys1055";

    var header = { "Content-Type": "application/x-www-form-urlencoded", "Accept": "application/json" };
    var data = {
        "grant_type": "password",
        "client_id": client_id,
        "client_secret": client_secret,
        "service_id": serviceUserId,
        "service_password": servicePassword,
        "username": systemUserId,
        "password": systemPassword
    };
    var loadingElement = document.createElement("div");
    loadingElement.innerText = "Loading...";
    kintone.events.on('app.record.index.show', function (event) {
        var headerMenuSpace = document.getElementsByClassName("kintone-app-headermenu-space")[0];
        headerMenuSpace.style.lineHeight = "60px";
        /* test get data PCA */
        var ButtonGetPCA = document.getElementById('button_get_data_pca');
        ButtonGetPCA.onclick = async function () {
            kintone.app.getHeaderMenuSpaceElement().appendChild(loadingElement);
            kintone.proxy(rootUri + "Auth/Token", "POST", header, createFormData(data))
                .then(function (args) { // [b, status, h]
                    if (args[1] != 200) {
                        console.log(args);
                        return kintone.Promise.reject(args);
                    }
                    var cert = JSON.parse(args[0]);
                    header["Authorization"] = "Bearer " + cert.access_token;
                    // 領域選択
                    return kintone.proxy(rootUri + "SelectDataArea", "POST", header, createFormData({ "DataArea": dataAreaName }))
                })
                .then(function (args) { // [b, status, h]
                    console.log(args);
                    if (args[1] != 200) {
                        console.log(args);
                        return kintone.Promise.reject(args);
                    }
                    //return fetch_data_pca_condition(header);
                    return fetch_data_pca(rootUri + "/Find/InputKNS",header);
                })
                .then(async function (args) { // [b, status, h]
                    console.log(args);
                    var dataGetPca = args;
                    console.log(dataGetPca);

                    loadingElement.style.display = "none";
                    //location.reload();
                })
                .catch(function (error) {
                    console.log(error);
                    alert("接続に失敗しました- kết nối thất bại");
                    console.log(error);
                    loadingElement.style.display = "none";
                });

        }
        /* end test get data PCA */

        /* test del data PCA */
        var ButtonDelPCA = document.getElementById('button_del_data_pca');
        ButtonDelPCA.onclick = async function () {
            kintone.app.getHeaderMenuSpaceElement().appendChild(loadingElement);
            kintone.proxy(rootUri + "Auth/Token", "POST", header, createFormData(data))
                .then(function (args) { // [b, status, h]
                    if (args[1] != 200) {
                        console.log(args);
                        return kintone.Promise.reject(args);
                    }
                    var cert = JSON.parse(args[0]);
                    header["Authorization"] = "Bearer " + cert.access_token;
                    // 領域選択
                    return kintone.proxy(rootUri + "SelectDataArea", "POST", header, createFormData({ "DataArea": dataAreaName }))
                })
                .then(function (args) { // [b, status, h]
                    console.log(args);
                    if (args[1] != 200) {
                        console.log(args);
                        return kintone.Promise.reject(args);
                    }
                    //return fetch_data_pca_condition(header);
                    return fetch_data_pca(rootUri + "/Find/InputKNS",header);
                })
                .then(async function (args) { // [b, status, h]
                    console.log(args);
                    var dataGetPca = args;
                    console.log(dataGetPca);
                    var body = {
                        "ArrayOfBEInputKNS": {
                            "BEInputKNS": dataGetPca

                        }
                    };
                    header["Content-Type"] = "application/json";
                    console.log('body');
                    console.log(body);
                    const resp = await kintone.proxy(rootUri + "Erase/InputKNS?Element=Array", "POST", header, JSON.stringify(body));
                    console.log(resp);
                    loadingElement.style.display = "none";
                    //location.reload();
                })
                .catch(function (error) {
                    console.log(error);
                    alert("接続に失敗しました- kết nối thất bại");
                    console.log(error);
                    loadingElement.style.display = "none";
                });

        }
        /* end test del data PCA */

        var ButtonInputKNS = document.getElementById('button_input_kns');
        ButtonInputKNS.onclick = async function () {
            kintone.app.getHeaderMenuSpaceElement().appendChild(loadingElement);

            kintone.proxy(rootUri + "Auth/Token", "POST", header, createFormData(data))
                .then(function (args) {
                    if (args[1] != 200) {
                        console.log(args);
                        return kintone.Promise.reject(args);
                    }
                    var cert = JSON.parse(args[0]);
                    header["Content-Type"] = "application/x-www-form-urlencoded";
                    header["Authorization"] = "Bearer " + cert.access_token;
                    return kintone.proxy(rootUri + "SelectDataArea", "POST", header, createFormData({ "DataArea": dataAreaName }))
                })
                .then(function (args) {
                    if (args[1] != 200) {
                        console.log(args);
                        return kintone.Promise.reject(args);
                    }
                    //return fetch_data_pca_condition(header);
                    return fetch_data_pca(rootUri + "/Find/InputKNS",header);
                    
                })
                .then(async function (args) {

                    var dataGetPca = args;
                    var dataKintone = await fetch_data_kintone(appId).then(function (records) {
                        return records;
                    });
                    console.log('data PCA');
                    console.log(dataGetPca);
                    console.log('data Kintone');
                    console.log(dataKintone);
                    header["Content-Type"] = "application/json";
                    var listPca = [];
                    if (dataGetPca.length != 0) {
                        console.log(dataGetPca);
                        listPca = dataGetPca.map(i => i.BEInputNYK.InputNYKH.Id);
                        // listPca = dataGetPca.map(i => i.BEInputNYK.InputNYKH.Id);
                    }
                    var listKintone = [];
                    if (dataKintone.length != 0) {
                        listKintone = dataKintone.map(i => i['ID_PCA'].value);
                    }
                    var arrCreate = [];
                    var arrUpdate = [];
                    console.log('listPca');
                    console.log(listPca);
                    console.log('listKintone');
                    console.log(listKintone);
                    for (const element of dataKintone) { 
                        console.log('test');
                        var objCreate = createInputKNS(element);
                        console.log(objCreate);
                        if (!listPca.includes(element['ID_PCA'].value)) {
                            if (element['注文No'].value) { 
                                var dataJson231 = await kintone.proxy(rootUri + "Find/InputHAC?ChumonNo=" + element['注文No'].value, "GET", header, {});
                                console.log('get data 231');
                                console.log(dataJson231);
                                var dataMap231 = JSON.parse(dataJson231[0]);
                                console.log(dataMap231);
                                if(dataMap231.ArrayOfBEInputHAC.BEInputHAC)
                                {
                                    if(dataMap231.ArrayOfBEInputHAC.BEInputHAC[0].InputHACDList.BEInputHACD)
                                    {
                                        var dataHACList = dataMap231.ArrayOfBEInputHAC.BEInputHAC[0].InputHACDList.BEInputHACD;
                                        var itemMap = dataHACList.find(item => item.SyohinCode = element['商品コード'].value);
                                        if(itemMap)
                                        {
                                            objCreate.BEInputNYK.InputNYKDList.BEInputNYKD[0].HachuHeaderId = itemMap.HeaderId;
                                            objCreate.BEInputNYK.InputNYKDList.BEInputNYKD[0].HachuSequence = itemMap.Sequence;
                                        }
                                    }
                                }
                                console.log('set add HeaderId and Sequence');
                            }
                            arrCreate.push(objCreate);
                        } else {
                            var dataMap = dataGetPca.find(item => item.BEInputNYK.InputNYKH.Id == element['ID_PCA'].value);
                            console.log('dataMap');
                            console.log(dataMap);
                            objCreate.BEInputNYK.InputNYKH.Id = dataMap.BEInputNYK.InputNYKH.Id;
                            objCreate.BEInputNYK.InputNYKH.Kosinbi = dataMap.BEInputNYK.InputNYKH.Kosinbi;
                            objCreate.BEInputNYK.InputNYKDList.BEInputNYKD[0].Sequence = dataMap.BEInputNYK.InputNYKDList.BEInputNYKD[0].Sequence;
                            var dataKNS = dataMap.InputKNSDList.BEInputKNSD;
                            objCreate.InputKNSDList.BEInputKNSD.forEach((item,index) => {
                                        var dataMapKNS = dataKNS.find(i => item.DenpyoNo == i.DenpyoNo)
                                        objCreate.InputKNSDList.BEInputKNSD[index].SyukaId = dataMapKNS.SyukaId;
                                        objCreate.InputKNSDList.BEInputKNSD[index].Kosinbi = dataMapKNS.Kosinbi;
                                    });
                            arrUpdate.push(objCreate);
                        }
                    }
                    console.log('array Add');
                    console.log(arrCreate);
                    console.log('array Edit');
                    console.log(arrUpdate);

                    if (arrCreate.length > 0) {
                        console.log('action Add');
                        await chunkArrayInGroups(arrCreate, 10).reduce(async (promise, arr) => {
                            await promise;
                            var body = {
                                "ArrayOfBEInputKNS": {
                                    "BEInputKNS": arr
                                }
                            };
                            console.log(body);
                            //console.log(JSON.stringify(body));
                            const resp = await kintone.proxy(rootUri + "Create/InputKNS?Element=Array", "POST", header, JSON.stringify(body));
                            console.log(resp);
                            if(resp[1] != 200)
                            {
                                console.log(resp);
                                return kintone.Promise.reject(resp);
                            }
                            /* update lai id PCA cho kintone */
                            if (JSON.parse(resp[0]).ArrayOfBEKonIntegrationResultOfBEInputKNS) {
                                var GroupKintone = body.ArrayOfBEInputKNS.BEInputKNS;
                                var bodyUpdateKintone = {
                                    'app': appId,
                                    'records': []
                                }
                                var resultPca = JSON.parse(resp[0]).ArrayOfBEKonIntegrationResultOfBEInputKNS.BEKonIntegrationResultOfBEInputKNS;
                                resultPca.forEach(function (item, index) {
                                    if (item.InnerStatus == "Success") {
                                        var objPush = {
                                            'id': GroupKintone[index].kintonId,
                                            'record': {
                                                'ID_PCA': {
                                                    'value': item.Target.BEInputNYK.InputNYKH.Id
                                                }
                                            }
                                        }
                                        bodyUpdateKintone['records'].push(objPush);
                                    }
                                });
                                const respUpdate = await kintone.api('/k/v1/records', 'PUT', bodyUpdateKintone);
                            }

                        }, Promise.resolve());
                    }
                    if (arrUpdate.length > 0) {
                        console.log('action edit');
                        await chunkArrayInGroups(arrUpdate, 10).reduce(async (promise, arr) => {
                            await promise;
                            var body = {
                                "ArrayOfBEInputKNS": {
                                    "BEInputKNS": arr
                                }
                            };
                            console.log(body);
                            const resp = await kintone.proxy(rootUri + "Modify/InputKNS?Element=Array", "POST", header, JSON.stringify(body));
                            console.log(resp);
                            if(resp[1] != 200)
                            {
                                console.log(resp);
                                return kintone.Promise.reject(resp);
                            }
                        }, Promise.resolve());
                    }

                    /* handle Delete*/
                    /*var delArr = [];
                    dataGetPca.filter(i => !listKintone.includes(i.InputKNSH.Id)).forEach(i => {
                        //console.log(i);
                        delArr.push({
                            "InputKNSH": {
                                "Id": i.InputKNSH.Id,
                                "Hachubi": i.InputKNSH.Hachubi,
                                "HachusakiCode": i.InputKNSH.HachusakiCode,
                                "Kosinbi": i.InputKNSH.Kosinbi
                            }
                        })
                    });
                    console.log('array del');
                    console.log(delArr);
                    if (delArr.length > 0) {
                        console.log('action del');
                        await chunkArrayInGroups(delArr, 10).reduce(async (promise, arr) => {
                            await promise;

                            var body = {
                                "ArrayOfBEInputKNS": {
                                    "BEInputKNS": arr
                                }
                            };
                            console.log(body);
                            //console.log(JSON.stringify(body));
                            const resp = await kintone.proxy(rootUri + "Erase/InputKNS?Element=Array", "POST", header, JSON.stringify(body));
                            if(resp[1] != 200)
                            {
                                console.log(resp);
                                return kintone.Promise.reject(resp);
                            }
                        }, Promise.resolve());

                    }
                    /* end handle Delete*/
                    loadingElement.style.display = "none";
                    //location.reload();
                })
                .then( function (args) {
                    alert('PCAに連携が完了しました');
                    location.reload();
                })
                .catch(function (args) {
                    loadingElement.style.display = "none";
                    console.log(args);
                    var error = JSON.parse(args[0]);
                    console.log(error);
                    if (error.BusinessValue) {
                        event.error = error.BusinessValue.ArrayOfBEKonIntegrationResultOfBEInputKNS.BEKonIntegrationResultOfBEInputKNS.find(i => i.InnerStatus == "Failure").ErrorMessage;
                    } else if (error.error) {
                        event.error = error.error;
                    } else if (error.Message) {
                        event.error = error.Message;
                    } else {
                        event.error = args[0];
                    }
                    alert('PCAに連携が完了しました。'+event.error);
                });

        }


        /** handle delete all */
        var optionMenuButton = document.getElementsByClassName('gaia-argoui-optionmenubutton');
        optionMenuButton[0].addEventListener('click', function() {
            var listMenuItems = document.getElementsByClassName('gaia-argoui-app-menu-option-listmenuitem');
            const menuItemsArray = [...listMenuItems];
            var bulkDelete = menuItemsArray.find( i => i.getAttribute('title') == 'Bulk Delete');
            console.log(bulkDelete);
            if(bulkDelete)
            {
                bulkDelete.addEventListener('click',function () {
                    var deleteAllButton = document.getElementsByClassName('gaia-argoui-dialog-buttons-remove');
                    deleteAllButton[0].onclick = async function () {
                        
                        kintone.proxy(rootUri + "Auth/Token", "POST", header, createFormData(data))
                            .then(function (args) { // [b, status, h]
                                if (args[1] != 200) {
                                    console.log(args);
                                    return kintone.Promise.reject(args);
                                }
                                var cert = JSON.parse(args[0]);
                                header["Authorization"] = "Bearer " + cert.access_token;
                                header["Content-Type"] = "application/x-www-form-urlencoded";
                                // 領域選択
                                return kintone.proxy(rootUri + "SelectDataArea", "POST", header, createFormData({ "DataArea": dataAreaName }))
                            })
                            .then(function (args) { // [b, status, h]
                                console.log(args);
                                if (args[1] != 200) {
                                    console.log(args);
                                    return kintone.Promise.reject(args);
                                }
                                //return fetch_data_pca_condition(header);
                                header["Content-Type"] = "application/json";
                                return fetch_data_pca(rootUri + "/Find/InputKNS",header);
                            })
                            .then(async function (args) { // [b, status, h]
                                console.log(args);
                                var dataGetPca = args;
                                console.log(dataGetPca);
                                if (dataGetPca.length > 0) {
                                    console.log('action del');
                                    await chunkArrayInGroups(dataGetPca, 10).reduce(async (promise, arr) => {
                                        await promise;
            
                                        var body = {
                                            "ArrayOfBEInputKNS": {
                                                "BEInputKNS": arr
                                            }
                                        };
                                        console.log(body);
                                        //console.log(JSON.stringify(body));
                                        header["Content-Type"] = "application/json";
                                        const resp = await kintone.proxy(rootUri + "Erase/InputKNS?Element=Array", "POST", header, JSON.stringify(body));
                                        if (resp[1] != 200) {
                                            return kintone.Promise.reject(resp);
                                        }
                                    }, Promise.resolve());
                                }
                                //location.reload();
                            })
                            .then(function (args) {
                                alert('PCAに連携が完了しました');
                                location.reload();
                            })
                            .catch(function (error) {
                                console.log(error);
                                alert("接続に失敗しました");
                                console.log(error);
                                loadingElement.style.display = "none";
                            });
            
                    }
                })
            }
        })
        /**end handle delete all */
    });
    // kintone.events.on(['app.record.create.show','app.record.edit.show'],function(event) {
    //     event.record.ID_PCA.disabled = true;
    //     return event;
    // })
    kintone.events.on(["app.record.create.submit", "app.record.edit.submit", "app.record.index.edit.submit"], function (event) {
        var record = event.record;
        var objCreate = createInputKNS(record);
            var entity = {
                "BEInputKNS": {
                    ...objCreate
                }
            }
            return kintone.proxy(rootUri + "Auth/Token", "POST", header, createFormData(data))
                .then(function (args) { 
                    if (args[1] != 200) {
                        return kintone.Promise.reject(args);
                    }
                    var cert = JSON.parse(args[0]);
                    header["Content-Type"] = "application/x-www-form-urlencoded";
                    header["Authorization"] = "Bearer " + cert.access_token;
                    return kintone.proxy(rootUri + "SelectDataArea", "POST", header, createFormData({"DataArea": dataAreaName }))
                })
                .then(async function (args) { 
                    if (args[1] != 200) {
                        return kintone.Promise.reject(args);
                    }
                    header["Content-Type"] = "application/json";
                    if (record['注文No'].value) { 
                        var dataJson231 = await kintone.proxy(rootUri + "Find/InputHAC?ChumonNo=" + record['注文No'].value, "GET", header, {});
                        console.log('get data 231');
                        console.log(dataJson231);
                        var dataMap231 = JSON.parse(dataJson231[0]);
                        console.log(dataMap231);
                        if(dataMap231.ArrayOfBEInputHAC.BEInputHAC)
                        {
                            if(dataMap231.ArrayOfBEInputHAC.BEInputHAC[0].InputHACDList.BEInputHACD)
                            {
                                var dataHACList = dataMap231.ArrayOfBEInputHAC.BEInputHAC[0].InputHACDList.BEInputHACD;
                                var itemMap = dataHACList.find(item => item.SyohinCode = record['商品コード'].value);
                                if(itemMap)
                                {
                                    
                                    entity.BEInputKNS.BEInputNYK.InputNYKDList.BEInputNYKD[0].HachuHeaderId = itemMap.HeaderId;
                                    entity.BEInputKNS.BEInputNYK.InputNYKDList.BEInputNYKD[0].HachuSequence = itemMap.Sequence;
                                }
                            }
                        }
                        console.log('set add HeaderId and Sequence');
                    }
                    var Id_PCA = record['ID_PCA'].value;

                    if (event.type == "app.record.create.submit" || !Id_PCA) {
                        console.log('test add 1 record');
                        console.log(entity);
                        return kintone.proxy(rootUri + "Create/InputKNS?Element=Single", "POST", header, JSON.stringify(entity))
                            .then(function(args) {
                                /* update lai id PCA cho kintone */
                                console.log('args');
                                console.log(JSON.parse(args[0]));
                                if (JSON.parse(args[0]).BEKonIntegrationResultOfBEInputKNS) {
                                    var resultPca = JSON.parse(args[0]).BEKonIntegrationResultOfBEInputKNS;
                                    record['ID_PCA'].value = resultPca.Target.BEInputNYK.InputNYKH.Id;
                                }
                                return kintone.Promise.resolve(args);
                            })
                            .catch(function(args) {
                                return kintone.Promise.reject(args);
                            })
                    }
                    else 
                    {
                        return kintone.proxy(rootUri + "Find/InputKNS?Id=" + Id_PCA, "GET", header, {})
                            .then(function (args) {
                                console.log('test');
                                console.log(args);

                                var json = JSON.parse(args[0]);
                                console.log('json');
                                console.log(json);
                                if(json.ArrayOfBEInputKNS.BEInputKNS)
                                {
                                    console.log('test edit 1 record');
                                    var dataGet = json.ArrayOfBEInputKNS.BEInputKNS[0];
                                    entity.BEInputKNS.BEInputNYK.InputNYKH.Id = dataGet.BEInputNYK.InputNYKH.Id;
                                    entity.BEInputKNS.BEInputNYK.InputNYKH.Kosinbi = dataGet.BEInputNYK.InputNYKH.Kosinbi;
                                    entity.BEInputKNS.BEInputNYK.InputNYKDList.BEInputNYKD[0].Sequence = dataGet.BEInputNYK.InputNYKDList.BEInputNYKD[0].Sequence;
                                    var dataKNS = dataGet.InputKNSDList.BEInputKNSD;
                                    entity.BEInputKNS.InputKNSDList.BEInputKNSD.forEach((item,index) => {
                                        var dataMapKNS = dataKNS.find(i => item.DenpyoNo == i.DenpyoNo)
                                        entity.BEInputKNS.InputKNSDList.BEInputKNSD[index].SyukaId = dataMapKNS.SyukaId;
                                        entity.BEInputKNS.InputKNSDList.BEInputKNSD[index].Kosinbi = dataMapKNS.Kosinbi;
                                    });
                                    console.log('dataPut');
                                    console.log(entity);
                                    return kintone.proxy(rootUri + "Modify/InputKNS?Element=Single", "POST", header, JSON.stringify(entity));
                                }
                                else
                                {
                                    console.log('test edit 1 record');
                                    console.log('dataPost');
                                    console.log(entity);
                                    return kintone.proxy(rootUri + "Create/InputKNS?Element=Single", "POST", header, JSON.stringify(entity))
                                    .then(function(args) {
                                        /* update lai id PCA cho kintone */
                                        console.log('args');
                                        console.log(args);
                                        if (JSON.parse(args[0]).BEKonIntegrationResultOfBEInputKNS) {
                                            var resultPca = JSON.parse(args[0]).BEKonIntegrationResultOfBEInputKNS;
                                            record['ID_PCA'].value = resultPca.Target.BEInputNYK.InputNYKH.Id;
                                        }
                                        return kintone.Promise.resolve(args);
                                    })
                                    .catch(function(args) {
                                        return kintone.Promise.reject(args);
                                    })
                                }
                            });
                    }
                })
                .then(function (args) { // [b, status, h]
                    console.log('ket qua');
                    console.log(args);
                    if (args[1] != 200) {
                        return kintone.Promise.reject(args);
                    }
                    alert('PCAに連携が完了しました。');
                    return event;
                })
                .catch(function (args) {
                    console.log('efg');
                    console.log(args);
                    var error = JSON.parse(args[0]);
                    if (error.BusinessValue) {
                        event.error = error.BusinessValue.BEKonIntegrationResultOfBEInputKNS.ErrorMessage;
                    } else if (error.error) {
                        event.error = error.error;
                    } else if (error.Message) {
                        event.error = error.Message;
                    } else {
                        event.error = arg[0];
                    }
                    console.log(event);
                    return event;
                });
            
    });

    kintone.events.on(['app.record.index.delete.submit','app.record.detail.delete.submit'], function (event) {

        var record = event.record; 
        //var entity = JSON.parse(JSON.stringify(inputSMS));
        return kintone.proxy(rootUri + "Auth/Token", "POST", header, createFormData(data))
        .then(function (args) { // [b, status, h]
            if (args[1] != 200) {
                return kintone.Promise.reject(args);
            }
            // 領域選択
            var cert = JSON.parse(args[0]);
            header["Authorization"] = "Bearer " + cert.access_token;
            data = { "DataArea": dataAreaName };
            return kintone.proxy(rootUri + "SelectDataArea", "POST", header, createFormData(data))
        })
        .then(function (args) { // [b, status, h]
            if (args[1] != 200) {
                return kintone.Promise.reject(args);
            }
            var Id_PCA = record['ID_PCA'].value;
            return kintone.proxy(rootUri + "Find/InputKNS?Id=" + Id_PCA, "GET", header, {});
        })
        .then(function(args){
            console.log(args);
            if (args[1] != 200) {
                return kintone.Promise.reject(args);
            }
            var json = JSON.parse(args[0]);
            console.log('json');
            console.log(json);
            if(Object.keys(json.ArrayOfBEInputKNS).length != 0)
            {
                var dataGet = json.ArrayOfBEInputKNS.BEInputKNS[0];
                console.log(dataGet);
                var entity = {
                    "BEInputKNS": {          
                        ...dataGet
                    }
                };
                console.log(entity);
                header["Content-Type"] = "application/json";
                return kintone.proxy(rootUri + "Erase/InputKNS?Element=Single", "POST", header, JSON.stringify(entity));
            }
            else
            {
                return kintone.Promise.resolve(['ok',200]);
            } 
        })
        .then(function (args) { // [b, status, h]
            console.log(args);
            if (args[1] != 200) {
                return kintone.Promise.reject(args);
            }
            alert('PCAに連携が完了しました。');
            return event;
        })
        .catch(function (args) {
            console.log(args);
            var error = JSON.parse(args[0]);
            if (error.BusinessValue) {
                event.error = error.BusinessValue.BEKonIntegrationResultOfBEInputKNS.ErrorMessage;
            } else if (error.error) {
                event.error = error.error;
            } else if (error.Message) {
                event.error = error.Message;
            } else {
                event.error = args[0];
            }
            return event;
        });
    })


    function createFormData(data) {
        var array = [];
        for (var key in data) {
            var val = data[key];
            if ($.isArray(val)) {
                for (var i = 0; i < val.length; i++) {
                    array.push(key + '[]=' + encodeURIComponent(val[i]));
                }
            } else {
                array.push(key + '=' + encodeURIComponent(val));
            }
        }
        return array.join('&');
    }

    function createInputKNS(record) {
        console.log(record);
        var input = {
            "BEInputNYK": {
                "InputNYKH": {

                },
            }
        }
        if(record.$id)
        {
            input['kintonId'] = record.$id.value;
        }
        if (record['仕入日'].value) {
            /*102*/input['BEInputNYK']['InputNYKH']['Shirebi'] = record['仕入日'].value.replaceAll('-','');
        }
        if (record['精算日'].value) {
            /*103*/input['BEInputNYK']['InputNYKH']['Seisanbi'] = record['精算日'].value.replaceAll('-','');
        }
        if (record['伝票No'].value) {
            /*104*/input['BEInputNYK']['InputNYKH']['DenpyoNo'] = record['伝票No'].value;
        }
        if (record['仕入先コード'].value) {
            /*105*/input['BEInputNYK']['InputNYKH']['ShiresakiCode'] = record['仕入先コード'].value;
        }
        if (record['注文No'].value) {   
            /*109*/input['BEInputNYK']['InputNYKH']['ChumonNo'] = record['注文No'].value;
        } 
        if (record['手配No'].value) {   
            /*110*/input['BEInputNYK']['InputNYKH']['TehaiNo'] = record['手配No'].value;
        }  
        if (record['伝票No2'].value) {   
            /*112*/input['BEInputNYK']['InputNYKH']['DenpyoNo2'] = record['伝票No2'].value;
        }
        input['BEInputNYK']["InputNYKDList"] = {
            "BEInputNYKD": function () {
                var items = [];
                var detail = {};
                if (record['商品コード'].value) {
                    detail['SyohinCode'] = record['商品コード'].value;
                }
                if (record['倉庫コード'].value) {
                    detail['SokoCode'] = record['倉庫コード'].value;
                }
                if (record['入荷数'].value) {
                    detail['Suryo'] = record['入荷数'].value;
                }
                if (record['単位'].value) {
                    detail['Tani'] = record['単位'].value;
                }
                if (record['単価'].value) {
                    detail['Tanka'] = record['単価'].value;
                }
                if (record['金額'].value) {
                    detail['Kingaku'] = record['金額'].value;
                }
                if (record['備考'].value) {
                    detail['Biko'] = record['備考'].value;
                }
                if (record['入荷指示'].value) {
                    detail['NyukaShiji'] = record['入荷指示'].value;
                }
                items.push(detail);
                return items;
            }()
        }
        input["InputKNSDList"] = {
            "BEInputKNSD": function () {
                var items = [];
                record['伝票一覧'].value.forEach(item => {
                    var detail = {};
                    if (item.value['伝票No_0'].value) {
                        detail['DenpyoNo'] = item.value['伝票No_0'].value;
                    }
                    if (item.value['商品コード_一覧'].value) {
                        detail['SyohinCode'] = item.value['商品コード_一覧'].value;
                        //detail['SyohinCode'] = record['商品コード'].value
                    }
                    if (item.value['倉庫コード_一覧'].value) {
                        detail['SokoCode'] = item.value['倉庫コード_一覧'].value;
                    }
                    if (item.value['入数'].value) {
                        detail['Irisu'] = item.value['入数'].value;
                    }
                    if (item.value['単位_0'].value) {
                        detail['Tani'] = item.value['単位_0'].value;
                    }
                    if (item.value['払出数量'].value) {
                        detail['Suryo'] = item.value['払出数量'].value;
                    }
                    items.push(detail);
                });
                return items;
            }()
        }
        //console.log('create data');
        console.log(input);
        var json = JSON.parse(JSON.stringify(input));
        // 数量の入力された明細がなければ null を返す
        //if (json.TaniKubunList.length == 0)
        //return null;
        return json;
    }

    function fetch_data_pca(opt_url, opt_header, opt_offset, opt_records) {
        var offset = opt_offset || 0;
        var header = opt_header || {};
        var records = opt_records || [];
        return kintone.proxy(opt_url + "?offset=" + offset, "GET", header, {})
            .then(function (args) { // [b, status, h]
                if(JSON.parse(args[0]).ArrayOfBEInputKNS.BEInputKNS)
                {
                    var smss = JSON.parse(args[0]).ArrayOfBEInputKNS.BEInputKNS;
                    records = records.concat(smss);
                    if (smss.length == 50) {
                        return fetch_data_pca(opt_url, header, offset + 50, records);
                    }
                }
                return records;
            })
            .catch(function (error) {
                console.log(error);
            });
    }

    function fetch_data_pca_condition(opt_header, opt_offset, opt_records) {

        var offset = opt_offset || startId;
        var header = opt_header || {};
        var records = opt_records || [];
        //return fetch_data_pca(rootUri + "Find/InputKNS", header)
        header["Content-Type"] = "application/json";
        var entity = {
            "BEInputKNSCondition": {
                "BEVersion": 400,
                "IdFrom": offset + 1,
                "IdTo": offset + 200
            }
        }
        console.log('fetch_data_pca_condition');
        return kintone.proxy(rootUri + "/FindByCondition/InputKNS?Limit=200", "POST", header, JSON.stringify(entity))
            .then(function (args) { // [b, status, h]
                console.log('fun get data PCA');
                console.log(args);
                if (args[1] == 400) {
                    records = records.concat(args[1]);
                    return fetch_data_pca_condition(header, offset + 200, records);
                }
                else {
                    if (JSON.parse(args[0]).ArrayOfBEInputKNS.BEInputKNS) {
                        var smss = JSON.parse(args[0]).ArrayOfBEInputKNS.BEInputKNS;
                        records = records.concat(smss);
                        if (smss.length > 0) {
                            return fetch_data_pca_condition(header, offset + 200, records);
                        }
                    }
                }
                return records;
            })
            .catch(function (error) {
                console.log('error get data pca');
                console.log(error);
            });
    }

    function fetch_data_kintone(app_id, opt_query, opt_last_record_id, opt_records) {
        var records = opt_records || [];
        var query = opt_query || '';
        var id = app_id || kintone.app.getId();
        var query = opt_last_record_id ? '$id > ' + opt_last_record_id : '';
        if (opt_query) {
            if (query) query += ' and ';
            query += opt_query;
        }
        //query += 'ID_PCA = ""';
        
        query += ' order by $id asc limit 500';
        var params = {
            app: id,
            query: query
        };
        return kintone.api('/k/v1/records', 'GET', params).then(function (resp) {
            records = records.concat(resp.records);
            if (resp.records.length === 500) {
                return fetch_data_kintone(app_id, opt_query, resp.records[resp.records.length - 1].$id.value, records);
            }
            return records;
        });
    }

    function chunkArrayInGroups(arr, size) {
        var newArr = [];
        for (var i = 0; i < arr.length; i += size) {
            newArr.push(arr.slice(i, i + size));
        }
        return newArr;
    }
})();