    // Hàm để lấy một lô bản ghi
    function fetchBatchRecords() {
        return new Promise(function(resolve, reject) {
            var batchSize = 500; // Kích thước mỗi lô (số bản ghi trong mỗi lần yêu cầu)
            var offset = 0; // Bắt đầu từ bản ghi đầu tiên
            var allRecords = [];

            function fetchRecords() {
                var bodyQuery = {
                    'app': '5259',
                    'query': '受注No_PCA in ("")',
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