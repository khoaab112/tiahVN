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
                        return kintone.Promise.reject(args);
                    }
                    //return fetch_data_pca_condition(header);
                    return fetch_data_pca(rootUri + "/Find/InputHAC", header);
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

        var ButtonInputHAC = document.getElementById('button_input_hac');
        ButtonInputHAC.onclick = async function () {
            kintone.app.getHeaderMenuSpaceElement().appendChild(loadingElement);

            kintone.proxy(rootUri + "Auth/Token", "POST", header, createFormData(data))
                .then(function (args) {
                    if (args[1] != 200) {
                        return kintone.Promise.reject(args);
                    }
                    var cert = JSON.parse(args[0]);
                    header["Authorization"] = "Bearer " + cert.access_token;
                    header["Content-Type"] = "application/x-www-form-urlencoded";
                    return kintone.proxy(rootUri + "SelectDataArea", "POST", header, createFormData({ "DataArea": dataAreaName }))
                })
                .then(function (args) {
                    if (args[1] != 200) {
                        return kintone.Promise.reject(args);
                    }
                    //return fetch_data_pca_condition(header);
                    return fetch_data_pca(rootUri + "/Find/InputHAC", header);

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
                        listPca = dataGetPca.map(i => i.InputHACH.Id);
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
                    dataKintone.forEach(element => {
                        console.log('test');
                        var objCreate = createInputHAC(element);
                        console.log(objCreate);
                        if (!listPca.includes(element['ID_PCA'].value)) {
                            arrCreate.push(objCreate);
                        } else {
                            var dataMap = dataGetPca.find(item => item.InputHACH.Id == element['ID_PCA'].value).InputHACH;
                            console.log('dataMap');
                            console.log(dataMap);
                            objCreate.InputHACH.Id = dataMap.Id;
                            objCreate.InputHACH.Kosinbi = dataMap.Kosinbi;
                            if (!objCreate.InputHACH.Hachubi) {
                                objCreate.InputHACH.Hachubi = dataMap.Hachubi;
                            }
                            if (!objCreate.InputHACH.ChumonNo) {
                                objCreate.InputHACH.ChumonNo = dataMap.ChumonNo;
                            }
                            if (!objCreate.InputHACH.HachusakiCode) {
                                objCreate.InputHACH.HachusakiCode = dataMap.HachusakiCode;
                            }
                            arrUpdate.push(objCreate);
                        }
                    });
                    console.log('array Add');
                    console.log(arrCreate);
                    console.log('array Edit');
                    console.log(arrUpdate);

                    if (arrCreate.length > 0) {
                        console.log('action Add');
                        await chunkArrayInGroups(arrCreate, 10).reduce(async (promise, arr) => {
                            await promise;
                            var body = {
                                "ArrayOfBEInputHAC": {
                                    "BEInputHAC": arr
                                }
                            };
                            console.log(body);
                            //console.log(JSON.stringify(body));
                            const resp = await kintone.proxy(rootUri + "Create/InputHAC?Element=Array", "POST", header, JSON.stringify(body));
                            console.log(resp);
                            if (resp[1] != 200) {
                                return kintone.Promise.reject(resp);
                            }
                            /* update lai id PCA cho kintone */
                            if (JSON.parse(resp[0]).ArrayOfBEKonIntegrationResultOfBEInputHAC) {
                                var GroupKintone = body.ArrayOfBEInputHAC.BEInputHAC;
                                var bodyUpdateKintone = {
                                    'app': appId,
                                    'records': []
                                }
                                var resultPca = JSON.parse(resp[0]).ArrayOfBEKonIntegrationResultOfBEInputHAC.BEKonIntegrationResultOfBEInputHAC;
                                resultPca.forEach(function (item, index) {
                                    if (item.InnerStatus == "Success") {
                                        var objPush = {
                                            'id': GroupKintone[index].kintonId,
                                            'record': {
                                                'ID_PCA': {
                                                    'value': item.Target.InputHACH.Id
                                                },
                                                '注文No': {
                                                    'value': item.Target.InputHACH.ChumonNo
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
                                "ArrayOfBEInputHAC": {
                                    "BEInputHAC": arr
                                }
                            };
                            console.log(body);
                            const resp = await kintone.proxy(rootUri + "Modify/InputHAC?Element=Array", "POST", header, JSON.stringify(body));
                            console.log(resp);
                            if (resp[1] != 200) {
                                return kintone.Promise.reject(resp);
                            }
                        }, Promise.resolve());
                    }

                    /* handle Delete*/
                    /*var delArr = [];
                    dataGetPca.filter(i => !listKintone.includes(i.InputHACH.Id)).forEach(i => {
                        //console.log(i);
                        delArr.push({
                            "InputHACH": {
                                "Id": i.InputHACH.Id,
                                "Hachubi": i.InputHACH.Hachubi,
                                "HachusakiCode": i.InputHACH.HachusakiCode,
                                "Kosinbi": i.InputHACH.Kosinbi
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
                                "ArrayOfBEInputHAC": {
                                    "BEInputHAC": arr
                                }
                            };
                            console.log(body);
                            //console.log(JSON.stringify(body));
                            const resp = await kintone.proxy(rootUri + "Erase/InputHAC?Element=Array", "POST", header, JSON.stringify(body));
                            if (resp[1] != 200) {
                                return kintone.Promise.reject(resp);
                            }
                        }, Promise.resolve());

                    }
                    /* end handle Delete*/
                    loadingElement.style.display = "none";
                    //location.reload();
                })
                .then(function (args) {
                    alert('PCAに連携が完了しました');
                    location.reload();
                })
                .catch(function (args) {
                    loadingElement.style.display = "none";
                    console.log(args);
                    var error = JSON.parse(args[0]);
                    console.log(error);
                    if (error.BusinessValue) {
                        event.error = error.BusinessValue.ArrayOfBEKonIntegrationResultOfBEInputHAC.BEKonIntegrationResultOfBEInputHAC.find(i => i.InnerStatus == "Failure").ErrorMessage;
                    } else if (error.error) {
                        event.error = error.error;
                    } else if (error.Message) {
                        event.error = error.Message;
                    } else {
                        event.error = args[0];
                    }
                    alert('PCAに連携が完了しました。' + event.error);
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
                                return fetch_data_pca(rootUri + "/Find/InputHAC",header);
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
                                            "ArrayOfBEInputHAC": {
                                                "BEInputHAC": arr
                                            }
                                        };
                                        console.log(body);
                                        //console.log(JSON.stringify(body));
                                        header["Content-Type"] = "application/json";
                                        const resp = await kintone.proxy(rootUri + "Erase/InputHAC?Element=Array", "POST", header, JSON.stringify(body));
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

    kintone.events.on(["app.record.create.submit", "app.record.edit.submit", "app.record.index.edit.submit"], function (event) {
        var record = event.record;

        var objCreate = createInputHAC(record);
        var entity = {
            "BEInputHAC": {
                ...objCreate
            }
        }
        return kintone.proxy(rootUri + "Auth/Token", "POST", header, createFormData(data))
            .then(function (args) {
                if (args[1] != 200) {
                    return kintone.Promise.reject(args);
                }
                var cert = JSON.parse(args[0]);
                header["Authorization"] = "Bearer " + cert.access_token;
                header["Content-Type"] = "application/x-www-form-urlencoded";
                return kintone.proxy(rootUri + "SelectDataArea", "POST", header, createFormData({ "DataArea": dataAreaName }))
            })
            .then(function (args) {
                console.log(args);
                if (args[1] != 200) {
                    return kintone.Promise.reject(args);
                }
                header["Content-Type"] = "application/json";
                var Id_PCA = record['ID_PCA'].value;
                console.log(Id_PCA);
                console.log('abc');
                if (event.type == "app.record.create.submit" || !Id_PCA) {
                    console.log('test entity');
                    console.log(entity);
                    return kintone.proxy(rootUri + "Create/InputHAC", "POST", header, JSON.stringify(entity))
                        .then(function (args) {
                            /* update lai id PCA cho kintone */
                            console.log('args');
                            console.log(args);
                            if (JSON.parse(args[0]).BEKonIntegrationResultOfBEInputHAC) {
                                var resultPca = JSON.parse(args[0]).BEKonIntegrationResultOfBEInputHAC;
                                record['ID_PCA'].value = resultPca.Target.InputHACH.Id;
                                record['注文No'].value = resultPca.Target.InputHACH.ChumonNo;
                            }
                            return kintone.Promise.resolve(args);
                        })
                        .catch(function (args) {
                            return kintone.Promise.reject(args);
                        })
                }
                else {
                        return kintone.proxy(rootUri + "Find/InputHAC?Id=" + Id_PCA, "GET", header, {})
                        .then(function (args) {
                            console.log('test');
                            console.log(args);

                            var json = JSON.parse(args[0]);
                            console.log('json');
                            console.log(json);
                            if (json.ArrayOfBEInputHAC.BEInputHAC) {
                                var dataGet = json.ArrayOfBEInputHAC.BEInputHAC[0].InputHACH;
                                console.log('dataGet');
                                console.log(dataGet);
                                entity.BEInputHAC.InputHACH.Id = dataGet.Id;
                                entity.BEInputHAC.InputHACH.Kosinbi = dataGet.Kosinbi;

                                if (!entity.BEInputHAC.InputHACH.Hachubi) {
                                    entity.BEInputHAC.InputHACH.Hachubi = dataGet.Hachubi;
                                }
                                if (!entity.BEInputHAC.InputHACH.ChumonNo) {
                                    entity.BEInputHAC.InputHACH.ChumonNo = dataGet.ChumonNo;
                                }
                                if (!entity.BEInputHAC.InputHACH.HachusakiCode) {
                                    entity.BEInputHAC.InputHACH.HachusakiCode = dataGet.HachusakiCode;
                                }
                                console.log(entity);
                                return kintone.proxy(rootUri + "Modify/InputHAC", "POST", header, JSON.stringify(entity));
                            }
                            else {
                                console.log('aaaa');
                                return kintone.proxy(rootUri + "Create/InputHAC", "POST", header, JSON.stringify(entity))
                                    .then(function (args) {
                                        /* update lai id PCA cho kintone */
                                        console.log('args');
                                        console.log(args);
                                        if (JSON.parse(args[0]).BEKonIntegrationResultOfBEInputHAC) {
                                            var resultPca = JSON.parse(args[0]).BEKonIntegrationResultOfBEInputHAC;
                                            record['ID_PCA'].value = resultPca.Target.InputHACH.Id;
                                            record['注文No'].value = resultPca.Target.InputHACH.ChumonNo;
                                        }
                                        return kintone.Promise.resolve(args);
                                    })
                                    .catch(function (args) {
                                        return kintone.Promise.reject(args);
                                    })
                            }
                        })
                        .catch(function (args) {
                            return kintone.Promise.reject(args);
                        })
                }
            })
            .then(function (args) { // [b, status, h]
                console.log('args');
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
                var textError = 'PCAに連携できませんでした。ご確認お願い致します。';
                if (error.BusinessValue) {
                    event.error = textError + ' ' + error.BusinessValue.BEKonIntegrationResultOfBEInputHAC.ErrorMessage;
                } else if (error.error) {
                    event.error = textError + ' ' + error.error;
                } else if (error.Message) {
                    event.error = textError + ' ' + error.Message;
                } else {
                    event.error = arg[0];
                }
                console.log(event);
                return event;
            });

    });

    kintone.events.on(['app.record.index.delete.submit', 'app.record.detail.delete.submit'], function (event) {

        var record = event.record;
        var entity = {
            "BEInputHAC": {
                "InputHACH": {

                }
            }
        };
        //var entity = JSON.parse(JSON.stringify(inputSMS));
        return kintone.proxy(rootUri + "Auth/Token", "POST", header, createFormData(data))
            .then(function (args) { // [b, status, h]
                if (args[1] != 200) {
                    return kintone.Promise.reject(args);
                }
                // 領域選択
                var cert = JSON.parse(args[0]);
                header["Authorization"] = "Bearer " + cert.access_token;
                header["Content-Type"] = "application/x-www-form-urlencoded";
                return kintone.proxy(rootUri + "SelectDataArea", "POST", header, createFormData({ "DataArea": dataAreaName }))
            })
            .then(function (args) { // [b, status, h]
                if (args[1] != 200) {
                    return kintone.Promise.reject(args);
                }
                var Id_PCA = record['ID_PCA'].value;
                return kintone.proxy(rootUri + "Find/InputHAC?Id=" + Id_PCA, "GET", header, {});
            })
            .then(function (args) {
                console.log(args);
                if (args[1] != 200) {
                    return kintone.Promise.reject(args);
                }
                var json = JSON.parse(args[0]);
                console.log('json');
                console.log(json);
                if (Object.keys(json.ArrayOfBEInputHAC).length != 0) {
                    var dataGet = json.ArrayOfBEInputHAC.BEInputHAC[0].InputHACH;

                    entity.BEInputHAC.InputHACH.Kosinbi = dataGet.Kosinbi;
                    entity.BEInputHAC.InputHACH.Id = dataGet.Id;
                    entity.BEInputHAC.InputHACH.Hachubi = dataGet.Hachubi;
                    entity.BEInputHAC.InputHACH.HachusakiCode = dataGet.HachusakiCode;

                    header["Content-Type"] = "application/json";
                    return kintone.proxy(rootUri + "Erase/InputHAC", "POST", header, JSON.stringify(entity));
                }
                else {
                    return kintone.Promise.resolve(['ok', 200]);
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
                var textError = 'PCAに連携できませんでした。ご確認お願い致します。';
                if (error.BusinessValue) {
                    event.error = textError + ' ' + error.BusinessValue.BEKonIntegrationResultOfBEInputHAC.ErrorMessage;
                } else if (error.error) {
                    event.error = textError + ' ' + error.error;
                } else if (error.Message) {
                    event.error = textError + ' ' + error.Message;
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

    function createInputHAC(record) {
        var input = {
            "InputHACH": {
            },
        }
        console.log(record);
        if (record.$id) {
            input['kintonId'] = record.$id.value;
        }
        if (record['発注日'].value) {
            /*102*/input['InputHACH']['Hachubi'] = record['発注日'].value.replaceAll('-', '');
        }
        if (record['納期'].value) {
            /*103*/input['InputHACH']['Noki'] = record['納期'].value.replaceAll('-', '');
        }
        if (record['注文No'].value) {
            /*104*/input['InputHACH']['ChumonNo'] = record['注文No'].value;
        }
        if (record['発注先コード'].value) {
            /*105*/input['InputHACH']['HachusakiCode'] = record['発注先コード'].value; 
        }
        if (record['住所1'].value) {
            /*109*/input['InputHACH']['Jyusyo1'] = record['住所1'].value;
        }
        if (record['住所2'].value) {
            /*110*/input['InputHACH']['Jyusyo2'] = record['住所2'].value;
        }
        if (record['会社TEL'].value) {
            /*112*/input['InputHACH']['TelNo'] = record['会社TEL'].value;
        }
        if (record['会社FAX'].value) {
            /*113*/input['InputHACH']['FAXNo'] = record['会社FAX'].value;
        }

        if (record['住所1_0'].value) {
            /*130*/input['InputHACH']['ChokusosakiJyusyo1'] = record['住所1_0'].value;
        }
        if (record['住所2_0'].value) {
            /*131*/input['InputHACH']['ChokusosakiJyusyo2'] = record['住所2_0'].value;
        }
        if (record['郵便番号'].value) {
        /*139*/input['InputHACH']['ChokusosakiYubinBango'] = record['郵便番号'].value;
        }
        if (record['会社TEL_0'].value) {
        /*152*/input['InputHACH']['ChokusosakiTelNo'] = record['会社TEL_0'].value;
        }
        if (record['会社FAX_0'].value) {
            /*152*/input['InputHACH']['ChokusosakiFAXNo'] = record['会社FAX_0'].value;
        }
        if (record['注文No2'].value) {
            /*152*/input['InputHACH']['ChumonNo2'] = record['注文No2'].value;
        }
        /*152*/input['InputHACH']['TehaiNo'] = 1;
        console.log(input);
        input["InputHACDList"] = {
            "BEInputHACD": function () {
                var items = [];
                record['発注商品一覧'].value.forEach(item => {
                    var detail = {};
                    if (item.value['商品コード_JANコード'].value) {
                        detail['SyohinCode'] = item.value['商品コード_JANコード'].value;
                    }
                    if (item.value['商品名'].value) {
                        detail['SyohinMei'] = item.value['商品名'].value;
                    }
                    if (item.value['入数'].value) {
                        detail['Irisu'] = item.value['入数'].value;
                    }
                    if (item.value['箱数'].value) {
                        detail['Hakosu'] = item.value['箱数'].value;
                    }
                    if (item.value['数量'].value) {
                        detail['Suryo'] = item.value['数量'].value;
                    }
                    if (item.value['単位'].value) {
                        detail['Suryo'] = item.value['単位'].value;
                    }
                    if (item.value['単位'].value) {
                        detail['Tani'] = item.value['単位'].value;
                    }
                    if (item.value['単価'].value) {
                        detail['Tanka'] = item.value['単価'].value;
                    }
                    if (item.value['金額'].value) {
                        detail['Kingaku'] = item.value['金額'].value;
                    }
                    if (item.value['備考'].value) {
                        detail['Biko'] = item.value['備考'].value;
                    }
                    if (record['税率'].value) {
                        detail['ZeiRitsu'] = record['税率'].value;
                    }
                    if (record['受注No_PCA'].value) {
                        detail['HikiateJuchuNo'] = record['受注No_PCA'].value;
                    }
                    if (record['納期'].value) {
                        detail['Noki'] = record['納期'].value.replaceAll('-', '');
                    }
                    items.push(detail);
                });
                return items;
            }()
        }
        console.log('put data');
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
                if (JSON.parse(args[0]).ArrayOfBEInputHAC.BEInputHAC) {
                    var smss = JSON.parse(args[0]).ArrayOfBEInputHAC.BEInputHAC;
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
        //return fetch_data_pca(rootUri + "Find/InputHAC", header)
        header["Content-Type"] = "application/json";
        var entity = {
            "BEInputHACCondition": {
                "BEVersion": 400,
                "IdFrom": offset + 1,
                "IdTo": offset + 200
            }
        }
        console.log('fetch_data_pca_condition');
        return kintone.proxy(rootUri + "/FindByCondition/InputHAC?Limit=200", "POST", header, JSON.stringify(entity))
            .then(function (args) { // [b, status, h]
                console.log('fun get data PCA');
                console.log(args);
                if (args[1] == 400) {
                    records = records.concat(args[1]);
                    return fetch_data_pca_condition(header, offset + 200, records);
                }
                else {
                    if (JSON.parse(args[0]).ArrayOfBEInputHAC.BEInputHAC) {
                        var smss = JSON.parse(args[0]).ArrayOfBEInputHAC.BEInputHAC;
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

