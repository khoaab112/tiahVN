(function() {
    //92
    'use strict';
    kintone.events.on('app.record.index.show', function(event) {
        const data = event.records[0];
        const inventoryMimosa = document.getElementById('btn-inventory-mimosa');
        inventoryMimosa.onclick = async function() {
            //lấy kết quả khi GET các recoreds của app => 親品
            const resultGetRecords = await fetchBatchRecords();
            //mã sp codeProducts
            const codeProducts = [];
            for (let value of resultGetRecords) {
                // codeProducts.push(value.商品コード_JANコード.value);
                codeProducts.push(await extractCode(value.商品コード_JANコード.value));
            };
            //get token
            const token = await getVerificationCode();
            const getStockByMaterials = await getStockByMaterial(codeProducts, token);

            const resultTemp = {};
            getStockByMaterials.data.forEach(item => {

                const material_cd = item.stock.material_cd;
                const ursv_qty = item.stock.ursv_qty;

                if (!resultTemp[material_cd]) {
                    resultTemp[material_cd] = Number(ursv_qty);
                } else {
                    resultTemp[material_cd] += Number(ursv_qty);
                }
            });

            const resultMerge = Object.entries(resultTemp).map(([material_cd, inventory]) => {
                return {
                    'material_cd': material_cd,
                    'inventory': inventory
                };
            });
            const arrTempApp = {};
            resultGetRecords.forEach(item => {

                const material_cd = extractCode(item.商品コード_JANコード.value);
                const ursv_qty = item.受注数.value;

                if (!arrTempApp[material_cd]) {
                    arrTempApp[material_cd] = Number(ursv_qty);
                } else {
                    arrTempApp[material_cd] += Number(ursv_qty);
                }
            });

            const resultMergeApp = Object.entries(arrTempApp).map(([material_cd, inventory]) => {
                return {
                    'material_cd': material_cd,
                    'inventory': inventory
                };
            });
            // 2 mảng đẻ đem so sánh arrAPP = resultMergeApp // arrMimosa  = resultMerge
            var keepRunning = true;
            resultMergeApp.forEach(itemApp => {
                const matchingItem = resultMerge.find(itemMimosa => itemMimosa.material_cd === itemApp.material_cd);
                if (!matchingItem) {
                    keepRunning = false
                    return;
                }
                if (matchingItem.inventory > itemApp.inventory) {
                    keepRunning = false
                    return event;
                }
            });
            if (!keepRunning) return event;
            // thỏa mãn hết thì đầy sang app 193
            //map với data vào app 
            var records = [];
            for (let value of resultGetRecords) {
                let record = {
                    "商品コード": {
                        "type": "SINGLE_LINE_TEXT",
                        "value": value.先方商品コード.value
                    },
                    "単位": {
                        "type": "SINGLE_LINE_TEXT",
                        "value": value.単位.value
                    },
                    "単価": {
                        "type": "NUMBER",
                        "value": value.単価.value
                    },
                    "倉庫コード": {
                        "type": "SINGLE_LINE_TEXT",
                        "value": value.自社倉庫コード.value
                    },
                    "商品区分": {
                        "type": "CHECK_BOX",
                        "value": value.商品区分.value[0] ? [value.商品区分.value[0]] : []
                    },
                    "ID_PCA": {
                        "type": "NUMBER",
                        "value": value.ID_PCA.value
                    }
                };
                records.push(record);
            };

            const resultPostApp183 = await postRecordsInBatches(records);
            if (resultPostApp183) {
                alert("POST SUCCESS");
            }
        }
        return event;
    });


    // đầu và là một mảng và token 
    async function getStockByMaterial(material_cd, token) {
        const material = material_cd;
        const limit = 5000;
        const offset = 0;
        const method = 'GET';
        var lengthMaterial = material.length
        var path = '/jwt/v2/stock/find?';
        material.forEach((value, index) => {
            path += "material_cd[]=" + value
            if (index < (lengthMaterial - 1)) {
                path += "&";
            }
        });
        var headers = {
            'Authorization': 'Bearer ' + token.token,
            'X-UNITID': token.units.id,
            'Content-Type': 'application/json',
        };
        var domain = 'https://mimosa-stg.dialog-wms.com' + path + '&limit=' + limit + '&offset=' + offset;
        var body = '';

        return kintone.proxy(domain, method, headers, body)
            .then(function(response) { // [b, status, h]
                var responseBody = JSON.parse(response[0]);
                return responseBody;
            })
            .catch(function(error) {
                console.log(error);
                return error;
            });
    };


    // Hàm để lấy một lô bản ghi
    function fetchBatchRecords() {
        return new Promise(function(resolve, reject) {
            var batchSize = 500;
            var offset = 0;
            var allRecords = [];

            function fetchRecords() {
                var bodyQuery = {
                    'app': '189',
                    'query': '親品_子品チェック in ("親品")',
                    'totalCount': true,
                    'offset': offset,
                    'limit': batchSize
                };
                kintone.api(kintone.api.url('/k/v1/records', true), 'GET', bodyQuery, function(response) {
                    var records = response.records;
                    allRecords = allRecords.concat(records);

                    var totalCount = response.totalCount;
                    offset += batchSize;

                    if (offset < totalCount) {
                        fetchRecords();
                    } else {
                        resolve(allRecords);
                    }
                }, function(error) {
                    reject(error);
                });
            }

            fetchRecords();
        });
    }

    // start token
    async function getTokenMimosa() {
        var body = JSON.stringify({
            'name': 'globalb',
            'password': 's8LQmvyM',
        });
        var pathLogin = 'https://mimosa-stg.dialog-wms.com/jwt/v2/login';
        var header = {
            'Content-Type': 'application/json',
        };

        try {
            const response = await kintone.proxy(pathLogin, "POST", header, body);
            var responseBody = JSON.parse(response[0]);
            return responseBody;
        } catch (error) {
            console.log(error);
            return error;
        }
    };

    async function setStorage(data) {
        var localStorageMimosa = {
            'token_type': data.data.token_type,
            'token': data.data.token,
            'units': {
                'id': data.data.units[0].id,
                'nm': data.data.units[0].nm,
            },
            'expires_in': data.data.expires_in,
            'created_at': await formatDateTime(),
        };
        localStorage.setItem("localStorageMimosa", JSON.stringify(localStorageMimosa));
    };

    function formatDateTime() {
        var currentDate = new Date();
        var year = currentDate.getFullYear();
        var month = String(currentDate.getMonth() + 1).padStart(2, '0');
        var day = String(currentDate.getDate()).padStart(2, '0');
        var hours = String(currentDate.getHours()).padStart(2, '0');
        var minutes = String(currentDate.getMinutes()).padStart(2, '0');
        var seconds = String(currentDate.getSeconds()).padStart(2, '0');

        var formattedDateTime = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
        return formattedDateTime;
    };

    function compareTime(startTime, TimeBySeconds) {
        startTime = new Date(startTime);
        var timeEnd = new Date(startTime.getTime() + TimeBySeconds * 1000);
        var timeNow = new Date();
        return (timeEnd - timeNow) <= 0 ? false : true;
    };

    function clearStorage() {
        window.localStorage.removeItem('localStorageMimosa')
    };

    function getStorage() {
        const localStorageMimosa = JSON.parse(localStorage.getItem("localStorageMimosa"));
        return localStorageMimosa;
    };

    async function getVerificationCode() {

        var token = await getStorage();
        if (!token) {
            clearStorage();
            await setStorage(await getTokenMimosa());
            token = await getStorage();
        }
        var timeToken = token.created_at;
        var timeExpiry = token.expires_in;
        if (!compareTime(timeToken, timeExpiry)) {
            clearStorage();
            await setStorage(await getTokenMimosa());
            token = await getStorage();
        }
        return token;
    };
    //end token

    async function postRecordsInBatches(records) {
        const batchSize = 100;
        const totalRecords = records.length;
        let offset = 0;

        while (offset < totalRecords) {
            const batchRecords = records.slice(offset, offset + batchSize);

            const bodyPut = {
                'app': '183',
                'records': batchRecords // array 
            };

            await kintone.api(kintone.api.url('/k/v1/records', true), 'POST', bodyPut);

            offset += batchSize;
        }
    };
    // cố tạo mã sp giống để so sánh
    function extractCode(input) {
        const match = input.match(/[A-Za-z].*/);
        if (match) {
            // Trả về phần số còn lại sau khi đã loại bỏ phần chữ cái
            return match[0];
        }
        return input;
    }
})();