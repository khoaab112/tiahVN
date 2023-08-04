(function () {
    'use strict';
    kintone.events.on('app.record.detail.show', async function (event) {
        var showResult = document.getElementById('user-js-show-json');
        showResult.innerText = 'show';


        var btnLogin = document.getElementById('btn-login');
        var buttonGetData = document.getElementById('btn-get-data');
        var buttonGetsData = document.getElementById('btn-gets-data');
        var buttonTest = document.getElementById('btn-test');
        var buttonCookie = document.getElementById('btn-cookie');
        var buttonClear = document.getElementById('btn-clear');

        var url = 'https://mimosa-stg.dialog-wms.com/jwt/v2/login';
        var pathLogin = '/jwt/v2/login';

        btnLogin.onclick = async function () {
            var body = {
                'name': 'globalb',
                'password': 's8LQmvyM',
            }
            
            console.log("activate");
            // var result = await fetchData();
            var result = await callAPIMimosa(pathLogin,'POST','',body);

            await setStorage(result);
            console.log(result);
        };
        buttonCookie.onclick = async function () {
            getStorage();
        };
        buttonClear.onclick = async function () {

            clearStorage();
        };

        buttonTest.onclick = async function () {

            var token = await getStorage();
            if (!token) {
                clearStorage();
                await setStorage(await fetchData());
                token = await getStorage();
                console.log(82, token);

            }
            // token.
            console.log(22, token);
            var timeToken = token.created_at;
            var timeExpiry = token.expires_in;
            await compareTime(timeToken, timeExpiry) ? fetchData : '';

        };
        buttonGetData.onclick = async function () {
            var storage = await getStorage();
            if (!storage) {
                clearStorage();
                await setStorage(await fetchData());
                storage = await getStorage();
            }
            var timeToken = token.created_at;
            var timeExpiry = token.expires_in;
            
        };

    });












    async function callAPIMimosa(path,method,header ,body) {
        var domain = 'https://mimosa-stg.dialog-wms.com'+path;
        var header = {
            'Content-Type': 'application/json',
            ...header||{},
        };
        var body = JSON.stringify(body||{});

        return kintone.proxy(domain, method, header, body)
            .then(function (response) { // [b, status, h]
                var responseBody = JSON.parse(response[0]);
                return responseBody;
            })
            .catch(function (error) {
                console.log(error);
                return error;
            });
    };
//demo
    // function fetchData() {
    //     var url = 'https://mimosa-stg.dialog-wms.com/jwt/v2/login';
    //     var header = {
    //         'Content-Type': 'application/json',
    //     };
    //     var body = JSON.stringify({
    //         'name': 'globalb',
    //         'password': 's8LQmvyM',
    //     });
    //     return kintone.proxy(url, "POST", header, body)
    //         .then(function (response) { // [b, status, h]
    //             var responseBody = JSON.parse(response[0]);
    //             console.log(22, responseBody);
    //             return responseBody;
    //         })
    //         .catch(function (error) {
    //             console.log(error);
    //             return error;
    //         });
    // };
    function getStorage() {
        // Lấy giá trị cookie
        const localStorageMimosa = JSON.parse(localStorage.getItem("localStorageMimosa"));
        console.log(localStorageMimosa);
        return localStorageMimosa;
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
        console.log(localStorageMimosa);
        localStorage.setItem("localStorageMimosa", JSON.stringify(localStorageMimosa));
    }
    function clearStorage() {
        // window.localStorage.clear();
        window.localStorage.removeItem('localStorageMimosa')
    }
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
    }
    //startTime = '2021-01-12 11:35:33'
    //timeBySecond = '2222'
    function compareTime(startTime, TimeBySeconds) {
        startTime = new Date(startTime);
        var timeEnd = new Date(startTime.getTime() + TimeBySeconds * 1000);
        var timeNow = new Date();
        return Math.abs(timeEnd - timeNow) <= 0 ? false : true;
    }
})();
