// (function () {
//     'use strict';
//     var appId = 59;
//     function fetch_fast(app_id, opt_query, opt_last_record_id, opt_records) {
//         var records = opt_records || [];
//         var query = opt_query || '';
//         var id = app_id || kintone.app.getId();
//         var query = opt_last_record_id ? '$id > ' + opt_last_record_id : '';
//         if (opt_query) {
//             if (query) query += ' and ';
//             query += opt_query;
//         }
//         query += ' order by $id asc limit 500';
//         var params = {
//             app: id,
//             query: query
//         };
//         return kintone.api('/k/v1/records', 'GET', params).then(function (resp) {
//             records = records.concat(resp.records);
//             console.log(records);
//             var record = kintone.app.record.get();
//             if (records[0].使用区分.value == 0) {
//                 record.record.廃番ステータス.value = 0;
//             } else if (records[0].使用区分.value == 1) {
//                 record.record.廃番ステータス.value = 1;
//             } 
//             // else {}
//             kintone.app.record.set(record);
//             return records;
//         });
//     }
//     kintone.events.on(['app.record.create.change.品名', 'app.record.edit.change.品名'], function (event) {
//         console.log(event.record);
//         if (event.record.商品コード_JANコード.value != '' && event.record.商品コード_JANコード.value != undefined) {
//             fetch_fast(appId, '商品コード = "' + event.record.商品コード_JANコード.value + '"');
//         } 
//         // else {
//         //     event.record.商品コード_JANコード.value = '';
//         // }
//         return event;
//     });
// })();
