// (function() {
//   'use strict';
//   kintone.events.on([
//     'app.record.create.submit',
//     'app.record.edit.submit'
//   ], async function(event) {
//     var record = event.record;
//     if (record.商品コード_JANコード.value == '' || record.商品コード_JANコード.value == undefined) return event;
//     var params = {
//       app: 59,
//       query: `商品コード = "${record.商品コード_JANコード.value}"`
//     };
//     let respon = await kintone.api('/k/v1/records', 'GET', params).then(function(resp) {
//       return resp;
//     });
//     if(respon.records.length > 0 && record.金額.value != '' && record.金額.value != undefined) {
//       if(respon.records[0].税区分.value == 0) {
//         record.消費税額.value = 0;
//       }
//       if(respon.records[0].税区分.value == 1) {
//         record.消費税額.value = record.金額.value * 10 / 100;
//       }
//       if(respon.records[0].税区分.value == 2) {
//         record.消費税額.value = record.金額.value * 8 / 100;
//       }
//     }
//     return event;
//   });
// })();
