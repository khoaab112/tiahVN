(function () {
    'use strict';
    kintone.events.on('app.record.index.show', function (event) {    
      var buttonTask85 =document.getElementById('btn-task-85');

      // var data = event.records
      function fetchBatchRecords() {
        return new Promise(function (resolve, reject) {
            var batchSize = 500; // Kích thước mỗi lô (số bản ghi trong mỗi lần yêu cầu)
            var offset = 0; // Bắt đầu từ bản ghi đầu tiên
            var allRecords = [];
  
            function fetchRecords() {
                var bodyQuery = {
                    'app': '189',
                    // 'query': '受注No_PCA in ("")',
                    'totalCount': true,
                    'offset': offset,
                    'limit': batchSize
                };
  
                kintone.api(kintone.api.url('/k/v1/records', true), 'GET', bodyQuery, function (response) {
                    var records = response.records;
                    allRecords = allRecords.concat(records); // Kết hợp bản ghi vào mảng tổng
  
                    var totalCount = response.totalCount;
                    offset += batchSize; // Cập nhật vị trí bắt đầu cho lần yêu cầu tiếp theo
  
                    if (offset < totalCount) {
                        // Tiếp tục lấy các lô bản ghi cho đến khi đạt đủ số lượng bản ghi
                        fetchRecords();
                    } else {
                        resolve(allRecords);
                    }
                }, function (error) {
                    reject(error);
                });
            }
  
            fetchRecords();
        });
    }
      buttonTask85.onclick =async function () {  
        var data = await fetchBatchRecords();  
        data.sort(function (a, b) {
          var codeA = a.得意先コード.value;
          var codeB = b.得意先コード.value;
          var dateA = a.納品日.value;
          var dateB = b.納品日.value;
  
          if (codeA === codeB) {
if(!dateA && !dateB) return 0;
            return dateA.localeCompare(dateB);
          } else {
            return codeA.localeCompare(codeB);
          }
        });
        var arrPut = [];
        for (let value of data) {
          value.受注No_PCA.value = '';
          let id = value.$id.value;
          arrPut.push(
            {
              'id': id,
              'record': {
                '受注No_PCA': {
                  'value': ''
                }
              }
            }
          );
        }
  
        await putRecordsInBatches(arrPut);
        return event;
        async function putRecordsInBatches(records) {
            const batchSize = 100; // Kích thước mỗi lô (số bản ghi trong mỗi lần yêu cầu)
            const totalRecords = records.length;
            let offset = 0;
          
            while (offset < totalRecords) {
                const batchRecords = records.slice(offset, offset + batchSize);
          
                const bodyPut = {
                    'app': '189',
                    'records': batchRecords
                };
          
                await kintone.api(kintone.api.url('/k/v1/records', true), 'PUT', bodyPut);
          
                offset += batchSize;
            }
            window.location.reload()
          }
      }
    });
   
  })();
  