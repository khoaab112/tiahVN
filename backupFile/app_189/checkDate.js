  var customProductId = 64;
  var purchaseId = 239;
  var productMasterId = 59;
  
  function chunkArrayInGroups(arr, size) {
    var newArr=[];

    for (var i=0; i < arr.length; i+= size){
    newArr.push(arr.slice(i,i+size));
    }
    return newArr;

  }
    
  function fetch_fast(app_id, opt_query, opt_last_record_id, opt_records) {
    var records = opt_records || [];
    var query = opt_query || '';
    var id = app_id || kintone.app.getId();
    var query = opt_last_record_id ? '$id > ' + opt_last_record_id : '';
    if (opt_query) {
      if (query) query += ' and ';
      query += opt_query;
    }
    query += ' order by $id asc limit 500';
    var params = {
      app: id,
      query: query
    };
    return kintone.api('/k/v1/records', 'GET', params).then(function(resp) {
      records = records.concat(resp.records);
      if (resp.records.length === 500) {
        return fetch_fast(app_id, opt_query, resp.records[resp.records.length - 1].$id.value, records);
      }
      return records;
    });
  }
  async function checkDate() {
    try {
      var allData = await fetch_fast(kintone.app.getId()).then(function (records) {
        return records;
      });
      var allDataCustom = await fetch_fast(customProductId).then(function (records) {
        return records;
      });
      var allDataPuschase = await fetch_fast(purchaseId).then(function (records) {
        return records;
      });
      var allDataProduct = await fetch_fast(productMasterId).then(function (records) {
        return records;
      });
      var arrUpdate = [];
      allData.forEach(element => {
        let recordTmp = [];
        
        // 1
        if(!element.受注日.value) recordTmp['受注日'] = {value: element.取込日.value};
        
        // 2
        if(!element.納期.value) recordTmp['納期'] = {value: moment(element.取込日.value).add(1, "days").format("YYYY-MM-DD")};
        
        // 3
        if(!element.納品日.value) recordTmp['納品日'] = {value: moment(element.取込日.value).add(1, "days").format("YYYY-MM-DD")};
        
        let day = recordTmp['受注日'] ? recordTmp['受注日'].value : element.受注日.value;
        if (element.先方商品コード.value) {
          let findCustom = allDataCustom.find(i => {
            return i.先方商品コード.value == element.先方商品コード.value && i.得意先コード.value == element.得意先コード.value;
          }); 
          if(findCustom) {
            // 4
            recordTmp['商品コード_JANコード'] = {value: findCustom.商品コード.value};
          }
        }
        let 商品コード_JANコード = recordTmp['商品コード_JANコード'] ? recordTmp['商品コード_JANコード'].value : element.商品コード_JANコード.value;
        let findCustom2 = allDataCustom.find(i => {
          return i.得意先コード.value == element.得意先コード.value && i.支店コード.value == element.支店コード.value && i.商品コード.value == 商品コード_JANコード;
        }); 

        if(findCustom2) {
          // 5
          recordTmp['商品区分'] = {value: findCustom2.商品区分.value};
          // 6
          recordTmp['倉庫エリアマスタレコード番号'] = {value: findCustom2.倉庫エリアマスタレコード番号.value};
          // 8
          recordTmp['発注点'] = {value: findCustom2.発注点.value};
          // 10
          recordTmp['単価'] = {value: findCustom2.納入価格.value}
          recordTmp['セット品区分'] = {value: findCustom2.セット品区分.value}
          if(day >= findCustom2['納入価格設定期間１_From'].value && day <= findCustom2[`納入価格設定期間１_to`].value) {
            recordTmp['単価'] = {value: findCustom2['納入価格１'].value}
          }
          if(day >= findCustom2['納入価格設定期間２_From'].value && day <= findCustom2[`納入価格設定期間２_to`].value) {
            recordTmp['単価'] = {value: findCustom2['納入価格２'].value}
          }
          if(day >= findCustom2['納入価格設定期間３_From'].value && day <= findCustom2[`納入価格設定期間３_to`].value) {
            recordTmp['単価'] = {value: findCustom2['納入価格３'].value}
          }
          if(day >= findCustom2['納入価格設定期間４_From'].value && day <= findCustom2[`納入価格設定期間４_to`].value) {
            recordTmp['単価'] = {value: findCustom2['納入価格４'].value}
          }
          if(day >= findCustom2['納入価格設定期間５_From'].value && day <= findCustom2[`納入価格設定期間５_to`].value) {
            recordTmp['単価'] = {value: findCustom2['納入価格５'].value}
          }
          // 11
          recordTmp['倉庫エリアマスタレコード番号'] = {value: findCustom2['倉庫エリアマスタレコード番号'].value}
        }
        // 7
        if(element.受注数.value == '' || element.受注数.value == undefined) {
          recordTmp['受注数'] = {value: element.発注単位.value * element.発注数.value};
        }
        // 12
        if(element.金額.value == 0) {
          let 単価 = recordTmp['単価'] ? Number(recordTmp['単価'].value) : element.単価.value;
          let 受注数 = recordTmp['受注数'] ? Number(recordTmp['受注数'].value) : element.受注数.value;
          recordTmp['金額'] = {value: 単価 * 受注数};
        }
        // 9
        let findPuschase = allDataPuschase.find(i => {
          // return i.得意先コード.value == element.得意先コード.value && i.商品コード.value == 商品コード_JANコード;
          return i.商品コード.value == 商品コード_JANコード;
        });
        let findProduct = allDataProduct.find(i => {
          return i.商品コード.value == 商品コード_JANコード;
        });
        if(findProduct) recordTmp['原単価'] = {value: findProduct.仕入単価.value};
        if(findPuschase) {
          if(day >= findPuschase.期間奉仕開始日.value && day <= findPuschase.期間奉仕終了日.value && day >= findPuschase.数量奉仕開始日.value && day <= findPuschase.数量奉仕終了日.value) {
            recordTmp['原単価'] = {value: findPuschase.仕入価格.value};
          }
          if(day >= findPuschase.期間奉仕開始日.value && day <= findPuschase.期間奉仕終了日.value && (day < findPuschase.数量奉仕開始日.value || day > findPuschase.数量奉仕終了日.value)) {
            recordTmp['原単価'] = {value: findPuschase.期間奉仕仕入価格.value};
          }
          // if((day < findPuschase.期間奉仕開始日.value || day > findPuschase.期間奉仕終了日.value) && day >= findPuschase.数量奉仕開始日.value && day <= findPuschase.数量奉仕終了日.value) {
          //   recordTmp['原単価'] = {value: findPuschase.数量奉仕仕入価格.value};
          // }
        }
        
        // 13
        if(findProduct) {
          recordTmp['税区分'] = {value: findProduct.税区分.value};
          // let 金額 = recordTmp['金額'] ? Number(recordTmp['金額'].value) : element.金額.value
          // if(findProduct.税区分.value == 0) {
          //   recordTmp['消費税額'] = {value: 0};
          // }
          // if(findProduct.税区分.value == 1) {
          //   recordTmp['消費税額'] = {value: 金額 * 10 / 100};
          // }
          // if(findProduct.税区分.value == 2) {
          //   recordTmp['消費税額'] = {value: 金額 * 8 / 100};
          // }
        }
        
        if (Object.keys(recordTmp).length > 0) {
          arrUpdate.push({
            id: element.$id.value,
            record: { ...recordTmp },
          });
        }
      });
  
      await chunkArrayInGroups(arrUpdate, 100).reduce(async (promise, arr) => {
        await promise;
        var body = {
          'app': kintone.app.getId(),
          'records': arr
        };
        const resp = await kintone.api('/k/v1/records', 'PUT', body);
        console.log(resp);
      }, Promise.resolve());
      alert('日付チェックが完了しました。');
      location.reload();
    } catch (error) {
      alert('エラーが発生されます。');
    }
  }