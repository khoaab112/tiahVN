async function postRecordsInBatches(records) {
    const batchSize = 100; // Kích thước mỗi lô (số bản ghi trong mỗi lần yêu cầu)
    const totalRecords = records.length;
    let offset = 0;

    while (offset < totalRecords) {
        const batchRecords = records.slice(offset, offset + batchSize);

        const bodyPut = {
            'app': '5259',
            'records': batchRecords // array 
        };

        await kintone.api(kintone.api.url('/k/v1/records', true), 'POST', bodyPut);

        offset += batchSize;
    }
}

// Sử dụng hàm putRecordsInBatches để gửi nhiều bản ghi
await postRecordsInBatches(records);