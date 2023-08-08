(function () {
  'use strict';
  var appId = 308;
  var appId2 = 231;
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
    return kintone.api('/k/v1/records', 'GET', params).then(function (resp) {
      records = records.concat(resp.records);
      if (resp.records.length === 500) {
        return fetch_fast(app_id, opt_query, resp.records[resp.records.length - 1].$id.value, records);
      }
      return records;
    });
  }
  function covertCode(item, quantity) {
    if (item.length < quantity) {
      const leadingZeros = '0'.repeat(quantity - item.length);
      return leadingZeros + item;
    }
    return item;
  }
  function combineValues(arr, key1Name, key2Name, tableName) {
    const combinedArr = [];
    const mergedValues = {};

    arr.forEach(obj => {
      const key1Value = obj[key1Name].value;
      const key2Value = obj[key2Name].value;

      const combinedKey = `${key1Value}|${key2Value}`;

      if (mergedValues[combinedKey]) {
        mergedValues[combinedKey][tableName].value.push(obj[tableName].value[0]);
      } else {
        const mergedObj = { ...obj };
        delete mergedObj[key1Name];
        delete mergedObj[key2Name];
        mergedObj[tableName] = { value: obj[tableName].value };

        mergedValues[combinedKey] = {
          [key1Name]: { value: key1Value },
          [key2Name]: { value: key2Value },
          ...mergedObj
        };
        combinedArr.push(mergedValues[combinedKey]);
      }
    });

    return combinedArr;
  }
  function mergeArray(array) {
    var mergedArray = [];
    var idMap = {};

    array.forEach((obj) => {
      var id = obj.id;

      if (!idMap[id]) {
        idMap[id] = obj;
      } else {
        idMap[id].record.受注明細.value.push(...obj.record.受注明細.value);
      }
    });
    for (var id in idMap) {
      mergedArray.push(idMap[id]);
    }

    return mergedArray;
  }
  function mergeArray2(array) {
    var mergedArray2 = [];
    var idMap2 = {};

    array.forEach((obj) => {
      var id = obj.id;

      if (!idMap2[id]) {
        idMap2[id] = obj;
      } else {
        idMap2[id].record.発注商品一覧.value.push(...obj.record.発注商品一覧.value);
      }
    });
    for (var id in idMap2) {
      mergedArray2.push(idMap2[id]);
    }

    return mergedArray2;
  }
  kintone.events.on('app.record.index.show', async function (event) {
    // var myButton308 = document.createElement('button');
    // myButton308.id = 'push_button_308';
    // myButton308.className = 'gaia-ui-actionmenu-save';
    // myButton308.innerHTML = 'push data to 308';
    var myButton308 = document.getElementById('push_button_308');
    myButton308.onclick = async function () {
      document.querySelector('#push_button_308').disabled = true;
      var records = event.records;
      var resp = await fetch_fast(appId).then(function (records) {
        return records;
      });
      var bodyPost = {
        app: appId,
        records: []
      };
      var bodyPut = {
        app: appId,
        records: []
      };
      var bodyDel = {
        app: appId,
        ids: []
      };
      var bodyPostHold = [];
      var bodyPutHold = [];
      var delHold = [];
      var flag = true;
      records.forEach(element => {
        // var code = element.得意先コード.value;
        var date = element.納品日.value;
        var PCA = element.受注No_PCA.value;
        var 商品コード_JANコード = covertCode(element.商品コード_JANコード.value, 13);
        var 有効在庫数 = element.有効在庫数.value != undefined ? Number(element.有効在庫数.value) : 0;
        var 受注数 = element.受注数.value != undefined ? Number(element.受注数.value) : 0;
        if (受注数 < 有効在庫数) {
          var item = {
            '作成者１': {
              'value': element.作成者１.value
            },
            '取込日': {
              'value': element.取込日.value
            },
            '受注日': {
              'value': element.受注日.value
            },
            '納期': {
              'value': element.納期.value
            },
            '納品日': {
              'value': element.納品日.value
            },
            '受注No_PCA': {
              'value': element.受注No_PCA.value
            },
            '受注No_mimosa': {
              'value': element.受注No_mimosa.value
            },
            // '見積No': {
            //   'value': element.見積No.value
            // },
            '受注No2': {
              'value': element.受注No2.value
            },
            // '得意先コード': {
            //   'value': element.得意先コード.value
            // },
            '得意先名': {
              'value': element.得意先名.value
            },
            '郵便番号': {
              'value': element.郵便番号.value
            },
            '住所1': {
              'value': element.住所1.value
            },
            '住所2': {
              'value': element.住所2.value
            },
            '会社TEL': {
              'value': element.会社TEL.value
            },
            '会社FAX': {
              'value': element.会社FAX.value
            },
            '部門コード': {
              'value': element.部門コード.value
            },
            '部門名': {
              'value': element.部門名.value
            },
            // '支店コード': {
            //   'value': element.支店コード.value
            // },
            '支店名': {
              'value': element.支店名.value
            },
            // '発注点': {
            //   'value': element.発注点.value
            // },
            '受注明細': {
              'value': [{
                'value': {
                  '受注No_mimosa': {
                    'type': 'SINGLE_LINE_TEXT',
                    'value': element.受注明細番号_mimosa.value
                  },
                  // '商品コード_JANコード': {
                  //   'type': 'SINGLE_LINE_TEXT',
                  //   'value': 商品コード_JANコード
                  // },
                  '商品区分': {
                    'type': 'CHECK_BOX',
                    'value': element.商品区分.value
                  },
                  '先方商品コード': {
                    'type': 'SINGLE_LINE_TEXT',
                    'value': element.先方商品コード.value
                  },
                  '商品名': {
                    'type': 'SINGLE_LINE_TEXT',
                    'value': ''
                  },
                  // '倉庫エリアマスタレコード番号': {
                  //   'type': 'SINGLE_LINE_TEXT',
                  //   'value': element.倉庫エリアマスタレコード番号.value
                  // },
                  // '自社倉庫コード': {
                  //   'type': 'SINGLE_LINE_TEXT',
                  //   'value': element.自社倉庫コード.value
                  // },
                  '倉庫エリアコード': {
                    'type': 'SINGLE_LINE_TEXT',
                    'value': element.倉庫エリアコード.value
                  },
                  '入数': {
                    'type': 'NUMBER',
                    'value': element.入数.value
                  },
                  '箱数': {
                    'type': 'CALC',
                    'value': element.箱数.value
                  },
                  '発注単位': {
                    'type': 'SINGLE_LINE_TEXT',
                    'value': element.発注単位.value
                  },
                  '発注数': {
                    'type': 'NUMBER',
                    'value': element.発注数.value
                  },
                  '発注点': {
                    'type': 'NUMBER',
                    'value': element.発注点.value
                  },
                  '受注数': {
                    'type': 'NUMBER',
                    'value': element.受注数.value
                  },
                  '単位': {
                    'type': 'SINGLE_LINE_TEXT',
                    'value': element.単位.value
                  },
                  '単価': {
                    'type': 'NUMBER',
                    'value': element.単価.value
                  },
                  '原単価': {
                    'type': 'NUMBER',
                    'value': element.原単価.value
                  },
                  '原価金額': {
                    'type': 'CALC',
                    'value': element.原価金額.value
                  },
                  '金額': {
                    'type': 'NUMBER',
                    'value': element.金額.value
                  },
                  '利益率': {
                    'type': 'CALC',
                    'value': element.利益率.value
                  },
                  '標準価格': {
                    'type': 'NUMBER',
                    'value': element.標準価格.value
                  },
                  '税率': {
                    'type': 'NUMBER',
                    'value': element.税率.value
                  },
                  '粗利益': {
                    'type': 'CALC',
                    'value': element.粗利益.value
                  },
                  '消費税額': {
                    'type': 'NUMBER',
                    'value': element.消費税額.value
                  },
                  '備考': {
                    'type': 'SINGLE_LINE_TEXT',
                    'value': ''
                  },
                  '受注データ処理_ID': {
                    'type': 'SINGLE_LINE_TEXT',
                    'value': element.$id.value
                  },
                }
              }]
            },
            '納入先名称_直送先コード': {
              'value': element.納入先名称_直送先コード.value
            },
            '納入先名称': {
              'value': element.納入先名称.value
            },
            '発単': {
              'value': element.発単.value
            },
            '受バラ': {
              'value': element.受バラ.value
            },
            '有効在庫数': {
              'value': element.有効在庫数.value
            },
            '引当済': {
              'value': element.引当済.value
            },
            // '未入荷': {
            //   'value': element.未入荷.value
            // },
            // '未入庫': {
            //   'value': element.未入庫.value
            // },
            '出荷済数量': {
              'value': element.出荷済数量.value
            },
            '処理ステータス': {
              'value': element.処理ステータス.value
            },
            '廃番ステータス': {
              'value': element.廃番ステータス.value
            },
            'セット品チェック': {
              'value': element.セット品チェック.value
            },
            '親品_子品チェック': {
              'value': element.親品_子品チェック.value
            },
          }
          // if (PCA == '') {
          //   flag = false;
          // }
          if (element.商品コード_JANコード.value != '') {
            item.受注明細.value[0].value.商品コード_JANコード = { 'type': 'SINGLE_LINE_TEXT', 'value': 商品コード_JANコード };
          }
          if (element.得意先コード.value != '') {
            item.得意先コード = { 'value': element.得意先コード.value };
          }
          if (element.支店コード.value == '') {
            item.支店コード = { 'value': element.支店コード.value };
          }
          if (element.倉庫エリアマスタレコード番号.value == '') {
            item.受注明細.value[0].value.倉庫エリアマスタレコード番号 = { 'type': 'SINGLE_LINE_TEXT', 'value': element.倉庫エリアマスタレコード番号.value };
          }
          var respond = resp.filter(e => e.受注No_PCA.value == PCA);
          if (respond.length == 0) {
            if (PCA != '') {
              bodyPostHold.push(item);
            }
          } else {
            var itemPut = {
              'id': respond[0].$id.value,
              'record': item
            }
            bodyPutHold.push(itemPut);
          }
        }
      });
      if (!flag) {
        alert('エラーが発生されました。\nご確認お願い致します。');
        return false;
      }
      resp.forEach(element => {
        var tab = element.受注明細.value;
        if (tab.length > 0) {
          delHold.push(tab.map(e => e.value.受注データ処理_ID.value));
        }
      })
      var delHold2 = delHold.flat(1);
      const result = delHold2.filter(valueA => {
        return !records.some(itemB => itemB.$id.value.toString() === valueA);
      });
      var newIds = [];

      for (var i = 0; i < resp.length; i++) {
        var tableValue = resp[i]["受注明細"]["value"];

        for (var j = 0; j < tableValue.length; j++) {
          var 受注データ処理_ID = tableValue[j]["value"]["受注データ処理_ID"]["value"];

          if (result.includes(受注データ処理_ID)) {
            newIds.push(resp[i]["$id"]["value"]);
            break;
          }
        }
      }
      if (newIds.length > 0) {
        bodyDel.ids = newIds;
      }
      console.log(bodyPutHold);
      var bodyFilter = combineValues(bodyPostHold, '受注No_PCA', '納品日', '受注明細');//'得意先コード',
      var bodyFilter2 = mergeArray(bodyPutHold);
      bodyPost.records = bodyFilter;// bodyPostHold;
      bodyPut.records = bodyFilter2;//bodyPutHold;
      if (bodyPost.records.length > 0) {
        console.log('action addd');
        console.log(bodyPost);
        var respPost = await kintone.api(kintone.api.url('/k/v1/records.json', true), 'POST', bodyPost);
        console.log(respPost);
      }
      if (bodyPut.records.length > 0) {
        console.log('action edit');
        console.log(bodyPut);
        var respPut = await kintone.api(kintone.api.url('/k/v1/records.json', true), 'PUT', bodyPut);
        console.log(respPut);
      }
      // if (bodyDel.ids.length > 0) {
      //   console.log('action del');
      //   console.log(bodyDel);
      //   var respDel = await kintone.api(kintone.api.url('/k/v1/records.json', true), 'DELETE', bodyDel);
      //   console.log(respDel);
      // }
      document.querySelector('#push_button_308').disabled = false;
      alert('受注伝票にデーター集計が完了しました。');
    }
    // var myButton231 = document.createElement('button');
    // myButton231.id = 'push_button_231';
    // myButton231.className = 'gaia-ui-actionmenu-save';
    // myButton231.innerHTML = 'push data to 231';
    var myButton231 = document.getElementById('push_button_231');
    myButton231.onclick = async function () {
      document.querySelector('#push_button_231').disabled = true;
      var records = event.records;
      var resp = await fetch_fast(appId2).then(function (records) {
        return records;
      });
      var bodyPost = {
        app: appId2,
        records: []
      };
      var bodyPut = {
        app: appId2,
        records: []
      };
      var bodyDel = {
        app: appId2,
        ids: []
      };
      var bodyPostHold = [];
      var bodyPutHold = [];
      var delHold = [];
      var flag = true;
      records.forEach(element => {
        var 得意先コード = element.得意先コード.value;
        var 商品コード_JANコード = covertCode(element.商品コード_JANコード.value, 13);
        var 有効在庫数 = element.有効在庫数.value != undefined ? Number(element.有効在庫数.value) : 0;
        var 出荷済数量 = element.出荷済数量.value != undefined ? Number(element.出荷済数量.value) : 0;
        var 受注数 = element.受注数.value != undefined ? Number(element.受注数.value) : 0;
        if (受注数 > 有効在庫数) {
          var item = {
            // '発注日': {
            //   'value': element.作成者１.value
            // },
            '納期': {
              'value': element.納期.value
            },
            '納品日': {
              'value': element.納品日.value
            },
            '受注No_PCA': {
              'value': element.受注No_PCA.value
            },
            '受注No_mimosa': {
              'value': element.受注No_mimosa.value
            },
            // '見積No': {
            //   'value': element.見積No.value
            // },
            '受注No2': {
              'value': element.受注No2.value
            },
            // '注文No': {
            //   'value': element.作成者１.value
            // },
            // '発注先コード': {
            //   'value': element.作成者１.value
            // },
            // '発注先名': {
            //   'value': element.作成者１.value
            // },
            // '伝票No': {
            //   'value': element.作成者１.value
            // },
            // '注文No2': {
            //   'value': element.作成者１.value
            // },
            // '伝票No2': {
            //   'value': element.作成者１.value
            // },
            '住所1': {
              'value': element.住所1.value
            },
            '住所2': {
              'value': element.住所2.value
            },
            '会社TEL': {
              'value': element.会社TEL.value
            },
            '会社FAX': {
              'value': element.会社FAX.value
            },
            // '得意先コード': {
            //   'value': 得意先コード
            // },
            '得意先名': {
              'value': element.得意先名.value
            },
            '郵便番号': {
              'value': element.郵便番号.value
            },
            // '住所1_0': {
            //   'value': element.作成者１.value
            // },
            // '住所2_0': {
            //   'value': element.作成者１.value
            // },
            // '会社TEL_0': {
            //   'value': element.作成者１.value
            // },
            // '会社FAX_0': {
            //   'value': element.作成者１.value
            // },
            // '自社担当者': {
            //   'value': element.作成者１.value
            // },
            '発注商品一覧': {
              'value': [{
                'value': {
                  'No': {
                    'type': 'NUMBER',
                    'value': ''
                  },
                  // '商品コード_JANコード': {
                  //   'type': 'SINGLE_LINE_TEXT',
                  //   'value': 商品コード_JANコード
                  // },
                  // '商品名': {
                  //   'type': 'SINGLE_LINE_TEXT',
                  //   'value': element.商品コード_JANコード.value
                  // },
                  '商品区分': {
                    'type': 'CHECK_BOX',
                    'value': element.商品区分.value
                  },
                  // '倉庫コード': {
                  //   'type': 'SINGLE_LINE_TEXT',
                  //   'value': element.商品コード_JANコード.value
                  // },
                  '倉庫エリアコード': {
                    'type': 'SINGLE_LINE_TEXT',
                    'value': element.倉庫エリアコード.value
                  },
                  '入数': {
                    'type': 'NUMBER',
                    'value': element.入数.value
                  },
                  '箱数': {
                    'type': 'NUMBER',
                    'value': element.箱数.value
                  },
                  // '数量': {
                  //   'type': 'NUMBER',
                  //   'value': element.商品コード_JANコード.value
                  // },
                  '単位': {
                    'type': 'SINGLE_LINE_TEXT',
                    'value': element.単位.value
                  },
                  '単価': {
                    'type': 'NUMBER',
                    'value': element.単価.value
                  },
                  '金額': {
                    'type': 'CALC',
                    'value': element.金額.value
                  },
                  // '入荷日': {
                  //   'type': 'DATE',
                  //   'value': element.入荷日.value
                  // },
                  // '入荷済数': {
                  //   'type': 'NUMBER',
                  //   'value': element.入荷済数.value
                  // },
                  // '入庫日': {
                  //   'type': 'DATE',
                  //   'value': element.入庫日.value
                  // },
                  // '入庫済数': {
                  //   'type': 'NUMBER',
                  //   'value': element.入庫済数.value
                  // },
                  // '備考': {
                  //   'type': 'SINGLE_LINE_TEXT',
                  //   'value': element.商品コード_JANコード.value
                  // },
                  '受注データ処理_ID': {
                    'type': 'SINGLE_LINE_TEXT',
                    'value': element.$id.value
                  },
                }
              }]
            },
            '税率': {
              'value': element.税率.value
            },
            // '税抜合計': {
            //   'value': element.作成者１.value
            // },
            // '外税T_消費税額合計': {
            //   'value': element.作成者１.value
            // },
            // '内税': {
            //   'value': element.作成者１.value
            // },
            // '税込合計': {
            //   'value': element.作成者１.value
            // },
          }
          // if (出荷済数量 > 有効在庫数) {
          //   item.push({
          //     '発注商品一覧': {
          //       'value': [{
          //         'value': {
          //           'No': {
          //             'type': 'NUMBER',
          //             'value': ''
          //           },
          //           '商品コード_JANコード': {
          //             'type': 'SINGLE_LINE_TEXT',
          //             'value': 商品コード_JANコード
          //           },
          //           // '商品名': {
          //           //   'type': 'SINGLE_LINE_TEXT',
          //           //   'value': element.商品コード_JANコード.value
          //           // },
          //           '商品区分': {
          //             'type': 'CHECK_BOX',
          //             'value': element.商品区分.value
          //           },
          //           // '倉庫コード': {
          //           //   'type': 'SINGLE_LINE_TEXT',
          //           //   'value': element.商品コード_JANコード.value
          //           // },
          //           '倉庫エリアコード': {
          //             'type': 'SINGLE_LINE_TEXT',
          //             'value': element.倉庫エリアコード.value
          //           },
          //           '入数': {
          //             'type': 'NUMBER',
          //             'value': element.入数.value
          //           },
          //           '箱数': {
          //             'type': 'NUMBER',
          //             'value': element.箱数.value
          //           },
          //           // '数量': {
          //           //   'type': 'NUMBER',
          //           //   'value': element.商品コード_JANコード.value
          //           // },
          //           '単位': {
          //             'type': 'SINGLE_LINE_TEXT',
          //             'value': element.単位.value
          //           },
          //           '単価': {
          //             'type': 'NUMBER',
          //             'value': element.単価.value
          //           },
          //           '金額': {
          //             'type': 'CALC',
          //             'value': element.金額.value
          //           },
          //           // '入荷日': {
          //           //   'type': 'DATE',
          //           //   'value': element.入荷日.value
          //           // },
          //           // '入荷済数': {
          //           //   'type': 'NUMBER',
          //           //   'value': element.入荷済数.value
          //           // },
          //           // '入庫日': {
          //           //   'type': 'DATE',
          //           //   'value': element.入庫日.value
          //           // },
          //           // '入庫済数': {
          //           //   'type': 'NUMBER',
          //           //   'value': element.入庫済数.value
          //           // },
          //           // '備考': {
          //           //   'type': 'SINGLE_LINE_TEXT',
          //           //   'value': element.商品コード_JANコード.value
          //           // },
          //         '受注データ処理_ID': {
          //           'type': 'SINGLE_LINE_TEXT',
          //           'value': element.$id.value
          //         },
          //         }
          //       }]
          //     }
          //   })
          // }
          // if (element.受注No_PCA.value == '') {
          //   flag = false;
          // }
          if (element.商品コード_JANコード.value != '') {
            item.発注商品一覧.value[0].value.商品コード_JANコード = { 'type': 'SINGLE_LINE_TEXT', 'value': 商品コード_JANコード }
          }
          if (element.得意先コード.value != '') {
            item.得意先コード = { 'value': 得意先コード }
          }
          var respond = resp.filter(e => e.受注No_PCA.value == element.受注No_PCA.value);
          if (respond.length == 0) {
            if (element.受注No_PCA.value != '') {
              bodyPostHold.push(item);
            }
          } else {
            var itemPut = {
              'id': respond[0].$id.value,
              'record': item
            }
            bodyPutHold.push(itemPut);
          }
        }
      })
      if (!flag) {
        alert('エラーが発生されました。\nご確認お願い致します。');
        return false;
      }
      resp.forEach(element => {
        var tab = element.発注商品一覧.value;
        if (tab.length > 0) {
          delHold.push(tab.map(e => e.value.受注データ処理_ID.value));
        }
      })
      var delHold2 = delHold.flat(1);
      const result = delHold2.filter(valueA => {
        return !records.some(itemB => itemB.$id.value.toString() === valueA);
      });
      var newIds = [];

      for (var i = 0; i < resp.length; i++) {
        var tableValue = resp[i]["発注商品一覧"]["value"];

        for (var j = 0; j < tableValue.length; j++) {
          var 受注データ処理_ID = tableValue[j]["value"]["受注データ処理_ID"]["value"];

          if (result.includes(受注データ処理_ID)) {
            newIds.push(resp[i]["$id"]["value"]);
            break;
          }
        }
      }
      if (newIds.length > 0) {
        bodyDel.ids = newIds;
      }
      console.log(bodyPutHold);
      var bodyFilter = combineValues(bodyPostHold, '受注No_PCA', '納品日', '発注商品一覧');//'得意先コード',
      var bodyFilter2 = mergeArray2(bodyPutHold);
      bodyPost.records = bodyFilter;// bodyPostHold;
      bodyPut.records = bodyFilter2;//bodyPutHold;
      // bodyPost.records = bodyPostHold;
      // bodyPut.records = bodyPutHold;
      if (bodyPost.records.length > 0) {
        console.log('action addd');
        console.log(bodyPost);
        var respPost = await kintone.api(kintone.api.url('/k/v1/records.json', true), 'POST', bodyPost);
        console.log(respPost);
      }
      if (bodyPut.records.length > 0) {
        console.log('action edit');
        console.log(bodyPut);
        var respPut = await kintone.api(kintone.api.url('/k/v1/records.json', true), 'PUT', bodyPut);
        console.log(respPut);
      }
      // if (bodyDel.ids.length > 0) {
      //   console.log('action del');
      //   console.log(bodyDel);
      //   var respDel = await kintone.api(kintone.api.url('/k/v1/records.json', true), 'DELETE', bodyDel);
      //   console.log(respDel);
      // }
      document.querySelector('#push_button_231').disabled = false;
      alert('発注管理にデーター集計が完了しました。');
    }
    return event;
  });
})();
