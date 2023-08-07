(function() {
    'use strict';
    kintone.events.on('app.record.index.show', function(event) {

        const create出荷指示書 = document.getElementById('create_出荷指示書');
        create出荷指示書.onclick = async function() {
            // lấy hết bản ghi của app thỏa mãn điều kiện
            const qualifiedRecords = await fetchBatchRecords();
            console.log(qualifiedRecords.length);
            // map data 
            var body = [];
            var material = [];
            var totolMaterial = [];
            if (qualifiedRecords) {
                console.log(qualifiedRecords);
                for (let value of qualifiedRecords) {
                    console.log(value);

                    var bodyChild = {
                        "shipment": {
                            "re_no": value.受注No_mimosa.value || '1231',
                            "ctg_code": Number(value.出荷種別.value) || 10,
                            "carrier_timezone": "UTC+09:00",
                            "dlv_nt_cmt": value.受注No_PCA.value,
                            "re_dttm": value.受注日.value,
                            "sch_shp_dt": value.納品日.value,
                            "carrier": "ヤマト運輸",
                            "dlv_nt_no": value.受注No2.value,
                            "needs_dlv_nt_att": 1,
                            "needs_dlv_nt_prc": 0,
                            "dlv_nt_code": 10,
                            "crr_fee_code": 10,
                            "crr_fee_wto_cns": 0,
                            "crr_fee_cns": 0,
                            "cmm_hdr_crr_wto_cns": 0,
                            "cmm_hdr_crr_cns": 0,
                            "chg_wto_cns": 0,
                            "chg_cns": 0,
                            "shr_code": 10,
                            "unit_report_pattern_code": 1,
                            "limited_use_at": value.納品日.value,
                            "add_pnt": 0,
                            "use_pnt": 0,
                            "sum_pnt": 0,
                            "pay_by_cpn": 0,
                            "pay_by_pnt": 0,
                            "reg_srv_nxt_sh_dt": value.納品日.value,
                            "needs_receipt": 0,
                            "needs_wrap": 0,
                            "wrp_ctg_unit_code_id": 99,
                            "wrp_fee": 0,
                            "needs_ppr": 0,
                            "ppr_ctg_unit_code": 99,
                        },
                        "client": {
                            "is_company": 1,
                            "rnk_element_code": 10,
                            "is_dlv_nt_required": 1,
                            "contact": {
                                "zip": "204-0000",
                                "country": '111',
                                "country_cd": "JP",
                            }
                        },
                        "delivery": {
                            "dep_nm": value.部門名.value || '204-0000',
                            "contact": {
                                "zip": value.郵便番号.value || "204-0000",
                                "country": '111',
                                "country_cd": "JP",
                            }
                        },
                        "deliveryNote": {
                            "is_company": 0,
                            "contact": {
                                "zip": "204-0000",
                                "country": '111',
                                "country_cd": "JP",
                            }
                        },
                        "shipmentDetails": [{
                            "re_dtl_no": value.受注明細番号_mimosa.value,
                            "sch_qty": value.受注数.value,
                            "material_cd": value.商品コード_JANコード.value, //
                            "lot_no": value.得意先コード.value,
                            "needs_dlv_nt": 1,
                            "needs_pck_lst": 1,
                            "qty_in_pck": 1,
                            "material_cd_for_dlv_nt": value.先方商品コード.value,
                            "material_nm_for_dlv_nt": value.品名.value
                        }],
                        "shipmentSmallLots": [{
                            "tmp_code": 10,
                        }]
                    };
                    body.push(bodyChild);
                    material.push('C0002');
                    // material.push(value.商品コード_JANコード.value);
                    // totolMaterial.push(value.受注数.value);
                    totolMaterial.push({
                        // 'name': value.商品コード_JANコード.value,
                        'name': 'C0002',
                        'quantity': value.受注数.value
                    });
                    // material.push('C0002');
                };
                // body.push(bodyChild);
                const token = await getVerificationCode();
                const path = '/jwt/v2/shipment/batchCreate';
                //  get stock by material_cd 
                const getMaterial = await getStockByMaterial(material, token);
                if (getMaterial.total <= 0) {
                    return;
                }
                //mặc định đang trả về một bản ghi
                //pading
                //số lượng trong kho 
                const results = (getMaterial.data).map(value => ({
                    name: value.stock.material_cd,
                    inventory: value.stock.ursv_qty
                }));
                // lấy số lượng trong kho so sánh với data thực tại , xem cái nào thỏa màn điều kiện
                // results vs totolMaterial
                const arrNamesQualified = [];
                for (let value of results) {
                    let result = totolMaterial.find(item => item.name === value.name);
                    if (result.quantity < value.inventory)
                        arrNamesQualified.push(result.name)
                }
                // kết quả , tên nhưng mã sản phẩm thỏa mãn điều kiện : arrNamesQualified =[];
                // nếu có giá trị , so sánh rồi xóa những phần tử không phù hợp của body rồi đầy vào
                if (arrNamesQualified) {
                    body.forEach((valueBody, index) => {
                        const isExist = arrNamesQualified.indexOf(valueBody.shipmentDetails.material_cd);
                        if (isExist < 0) {
                            body.splice(index, 1);
                        }
                    });
                    //đẩy vào
                    await postShipments(token, path, body);
                }
            }
        }


    });
})();
//get stock by material_cd 
async function getStockByMaterial(material_cd, token) {
    const material = material_cd;
    const limit = 5000;
    const offset = 0;
    const method = 'GET';
    var lengthMaterial = material.length
    var path = '/jwt/v2/stock/find?';
    material.forEach((value, index) => {
        console.log(index, value);
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



// // const responseGet = await callAPIMimosa(path, "GET", headers, '', 5000, 0);
// return responseGet;
// }


//get all stock
async function getAllStock(token) {
    let allRecords = [];
    let limit = 1000;
    let offset = 0;
    const path = '/jwt/v2/stock/find'
    var header = {
        'Authorization': 'Bearer ' + token.token,
        'X-UNITID': token.units.id,
    };
    let body = '';
    while (true) {
        try {
            const records = await callAPIMimosa(path, 'GET', header, body, limit, offset);
            if (records.data.length === 0) {
                // Nếu không còn bản ghi nào trả về, thoát vòng lặp
                break;
            }

            allRecords = allRecords.concat(records);
            offset += limit;
        } catch (error) {
            console.error('Lỗi khi lấy dữ liệu từ API:', error.message);
            break;
        }
    }

    return allRecords;
}
//post nhiều
async function postShipments(token, path, body) {
    Array.isArray(body)
        // const path = '/jwt/v2/shipment/batchCreate';
    const domain = 'https://mimosa-stg.dialog-wms.com' + path;
    var headers = {
        'Authorization': 'Bearer ' + token.token,
        'Content-Type': 'application/json',
        'X-UNITID': token.units.id,
    };
    // var bodyPost = JSON.parse(body);
    var bodyPost = JSON.stringify(body);
    try {
        const response = await kintone.proxy(domain, "POST", headers, bodyPost);
        var responseBody = JSON.parse(response[0]);
        return responseBody;
    } catch (error) {
        console.log(error);
        return error;
    }

}

// hàm lấy token
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
        console.log(22, responseBody);
        return responseBody;
    } catch (error) {
        console.log(error);
        return error;
    }
};

//hàm dùng chung
async function callAPIMimosa(path, method, header, body, limit, offset) {
    var domain = 'https://mimosa-stg.dialog-wms.com' + path + '?limit=' + limit + '&offset=' + offset;
    var header = {
        'Content-Type': 'application/json',
        ...header || {},
    };
    var body = JSON.stringify(body || {});

    return kintone.proxy(domain, method, header, body)
        .then(function(response) { // [b, status, h]
            var responseBody = JSON.parse(response[0]);
            return responseBody;
        })
        .catch(function(error) {
            console.log(error);
            return error;
        });
};
// parameter data = kết quả trả về của thằng login
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
//so sánh time => token hết hạn
//startTime = '2021-01-12 11:35:33'
//timeBySecond = '2222'
function compareTime(startTime, TimeBySeconds) {
    startTime = new Date(startTime);
    var timeEnd = new Date(startTime.getTime() + TimeBySeconds * 1000);
    var timeNow = new Date();
    // console.log(44, Math.abs(timeEnd - timeNow));
    return (timeEnd - timeNow) <= 0 ? false : true;
};

function clearStorage() {
    // window.localStorage.clear();
    window.localStorage.removeItem('localStorageMimosa')
};

function getStorage() {
    // Lấy giá trị cookie
    const localStorageMimosa = JSON.parse(localStorage.getItem("localStorageMimosa"));
    return localStorageMimosa;
};

//hàm check token đã được lưu
// nếu chưa có thì gọi lại và lưu vào storage
//nếu có rồi thì kiểm tra thời hạn còn sủ dụng của nó 
// nếu còn hạn  thì trả về token hiện tạia
// nếu hết hạn thì lấy lại token và trả lại token vừa lấy
async function getVerificationCode() {

    var token = await getStorage();
    if (!token) {
        clearStorage();
        await setStorage(await getTokenMimosa());
        token = await getStorage();
    }
    var timeToken = token.created_at;
    var timeExpiry = token.expires_in;
    console.log(compareTime(timeToken, timeExpiry));
    if (!compareTime(timeToken, timeExpiry)) {
        clearStorage();
        await setStorage(await getTokenMimosa());
        token = await getStorage();
    }
    return token;
};

// Hàm để lấy một lô bản ghi
function fetchBatchRecords() {
    return new Promise(function(resolve, reject) {
        var batchSize = 500; // Kích thước mỗi lô (số bản ghi trong mỗi lần yêu cầu)
        var offset = 0; // Bắt đầu từ bản ghi đầu tiên
        var allRecords = [];

        function fetchRecords() {
            var bodyQuery = {
                'app': '189',
                'query': '処理ステータス in ("在庫チェック済", "セット品確認済")',
                'totalCount': true,
                'offset': offset,
                'limit': batchSize
            };
            kintone.api(kintone.api.url('/k/v1/records', true), 'GET', bodyQuery, function(response) {
                var records = response.records;
                allRecords = allRecords.concat(records); // Kết hợp bản ghi vào mảng tổng

                var totalCount = response.totalCount;
                offset += batchSize; // Cập nhật vị trí bắt đầu cho lần yêu cầu tiếp theo

                if (offset < totalCount) {
                    // Tiếp tục lấy các lô bản ghi cho đến khi đạt đủ số lượng bản ghi
                    fetchRecords();
                } else {
                    console.log('Tất cả các bản ghi đã được lấy:', allRecords);
                    resolve(allRecords);
                }
            }, function(error) {
                reject(error);
            });
        }

        fetchRecords();
    });
}