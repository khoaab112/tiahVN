(function() {
    'use strict';
    kintone.events.on('app.record.index.show', async function(event) {
        const data = event.records;
        const btnGetStocks = document.getElementById('btn-get-stock');
        //get data stocks 
        btnGetStocks.onclick = async function() {
            const token = await getVerificationCode();
            const data = await getAllStock(token);
            console.log(data);

        };
    });


})();
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
    return Math.abs(timeEnd - timeNow) <= 0 ? false : true;
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
// nếu còn hạn  thì trả về token hiện tại
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
    if (!compareTime(timeToken, timeExpiry)) {
        clearStorage();
        await setStorage(await getTokenMimosa());
        token = await getStorage();
    }
    return token;
}