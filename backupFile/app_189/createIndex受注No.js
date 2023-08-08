(function () {
  'use strict';
  var latID = 0;

  function getLastOrderNo() {
    return new Promise(function (resolve, reject) {
      var bodyQuerylastNo = {
        'app': 189,
        'query': 'order by 受注No_PCA desc limit 1'
      };

      kintone.api(kintone.api.url('/k/v1/records', true), 'GET', bodyQuerylastNo, function (resp) {
        if (resp.records[0].受注No_PCA.value.length > 0) {
          latID = resp.records[0].$id.value;
          resolve(Number(resp.records[0].受注No_PCA.value) + 1);
        } else {
          resolve(1);
        }
      }, function (error) {
        reject(error);
      });
    });
  }

  async function processRecords(records) {
    // Tạo mảng chứa các giá trị duy nhất của trường '得意先コード'
    const uniqueValues = [...new Set(records.map(item => item["得意先コード"]["value"]))];
    // Sắp xếp dữ liệu theo '得意先コード' và '納品日'
    records.sort(function (a, b) {
      var codeA = a.得意先コード.value;
      var codeB = b.得意先コード.value;
      var dateA = a.納品日.value;
      var dateB = b.納品日.value;

      if (codeA === codeB) {
        if (!dateA) return -1
        if (!dateB) return 1
        else
          return dateA.localeCompare(dateB);
      } else {
        return codeA.localeCompare(codeB);
      }
    });
    // In mảng đã sắp xếp theo thời gian và mã code

    // Lọc dữ liệu để chỉ giữ lại các cặp giá trị duy nhất của '得意先コード' và '受注日'
    var filteredData = [];
    var uniquePairs = {};
    for (var i = 0; i < records.length; i++) {
      var item = records[i];
      if (!item['納品日'].value) continue;
      if (!item['得意先コード'].value) continue;
      var 得意先コード = item['得意先コード'].value;
      var 納品日 = item['納品日'].value;
      var key = 得意先コード + '|' + 納品日;
      if (!uniquePairs[key]) {
        uniquePairs[key] = true;
        filteredData.push(item);
      }
    }
    // In kết quả các cặp mã code và thời gian

    var index = await getLastOrderNo();
    var indexFilteredData = 0;
    var first = true;
    var warings = [];
    for (let value of records) {
      // không đánh index cho những cột không có ngày giao hàng
      if (!value.納品日.value) {
        warings.push(value.得意先コード.value);
        continue;
      };
      if (!value.得意先コード.value) {
        continue
      };
      if (value.受注No_PCA.value) continue;
      if (first) {
        value.受注No_PCA.value = index;
        first = false;
        continue;
      }
      if (filteredData[indexFilteredData].得意先コード.value === value.得意先コード.value && filteredData[indexFilteredData].納品日.value === value.納品日.value) {
        value.受注No_PCA.value = index;
      } else if (filteredData[indexFilteredData].得意先コード.value === value.得意先コード.value && filteredData[indexFilteredData].納品日.value !== value.納品日.value) {
        value.受注No_PCA.value = ++index;
        indexFilteredData++;
      } else if (filteredData[indexFilteredData].得意先コード.value !== value.得意先コード.value) {
        value.受注No_PCA.value = ++index;
        indexFilteredData++;
      } else {
        console.error('error');
      }
    }

    var arrPut = [];
    for (let value of records) {
      let id = value.$id.value;
      arrPut.push({
        'id': id,
        'record': {
          '受注No_PCA': {
            'value': value.受注No_PCA.value
          }
        }
      });
    }
    if (warings.length > 0) {
      alert("納品日がないレコードが存在していります。ご確認お願い致します。");
    }
    // Sử dụng hàm putRecordsInBatches để gửi nhiều bản ghi
    await putRecordsInBatches(arrPut);

  }

  // Hàm để lấy một lô bản ghi
  function fetchBatchRecords() {
    return new Promise(function (resolve, reject) {
      var batchSize = 500; // Kích thước mỗi lô (số bản ghi trong mỗi lần yêu cầu)
      var offset = 0; // Bắt đầu từ bản ghi đầu tiên
      var allRecords = [];

      function fetchRecords() {
        var bodyQuery = {
          'app': '189',
          'query': '受注No_PCA in ("")',
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
  // hàm cập nhật các lô bản ghi 
  async function putRecordsInBatches(records) {
    const batchSize = 100;
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
  }

  kintone.events.on('app.record.index.show', function (event) {
    var buttonTask84 = document.getElementById('btn-task-84');
    buttonTask84.onclick = async function () {
      try {
        var allRecords = await fetchBatchRecords();
        await processRecords(allRecords);
        window.location.reload();
      } catch (error) {
        console.log(error);
      }
    };

    return event;
  });
})();
