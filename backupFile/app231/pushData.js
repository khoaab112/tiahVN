(function () {
    'use strict';
    var appId = 232;
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
    kintone.events.on([
        'app.record.create.submit.success',
        'app.record.edit.submit.success',
        'app.record.index.delete.submit',
        'app.record.detail.delete.submit'
    ], async function (event) {
        var record = event.record;
        var oldData = await fetch_fast(appId, '発注管理_レコード番号 = "' + record.$id.value + '"').then(function (records) {
            return records;
        });
        var table = record.発注商品一覧.value;
        if (['app.record.index.delete.submit', 'app.record.detail.delete.submit'].includes(event.type)) {
            await kintone.api(kintone.api.url('/k/v1/records.json', true), 'DELETE', { app: appId, ids: oldData.map(i => i.$id.value) });
            return event;
        }
        var tableOld = oldData.map(i => i.発注管理_TableID.value);
        var tableNew = table.map(i => i.id);
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
        console.log(bodyPut);
        var idDel = [];
        table.forEach(element => {
            let item = {
                '発注日': {
                    'value': record.発注日.value
                },
                '納期': {
                    'value': record.納期.value
                },
                '納品日': {
                    'value': record.納品日.value
                },
                '受注No_PCA': {
                    'value': record.受注No_PCA.value
                },
                '受注No_mimosa': {
                    'value': record.受注No_mimosa.value
                },
                '見積No': {
                    'value': record.見積No.value
                },
                '受注No2': {
                    'value': record.受注No2.value
                },
                '注文No': {
                    'value': record.注文No.value
                },
                '発注先コード': {
                    'value': record.発注先コード.value
                },
                '発注先名': {
                    'value': record.発注先名.value
                },
                '伝票No': {
                    'value': record.伝票No.value
                },
                '注文No2': {
                    'value': record.注文No2.value
                },
                '伝票No2': {
                    'value': record.伝票No2.value
                },
                '住所1': {
                    'value': record.住所1.value
                },
                '住所2': {
                    'value': record.住所2.value
                },
                '会社TEL': {
                    'value': record.会社TEL.value
                },
                '会社FAX': {
                    'value': record.会社FAX.value
                },
                '得意先コード': {
                    'value': record.得意先コード.value
                },
                '得意先名': {
                    'value': record.得意先名.value
                },
                '郵便番号': {
                    'value': record.郵便番号.value
                },
                '住所1_0': {
                    'value': record.住所1_0.value
                },
                '住所2_0': {
                    'value': record.住所2_0.value
                },
                '会社TEL_0': {
                    'value': record.会社TEL_0.value
                },
                '会社FAX_0': {
                    'value': record.会社FAX_0.value
                },
                '税率': {
                    'value': record.税率.value
                }, 
                '自社担当者': {
                    'value': record.自社担当者.value[0].name
                },
                '税抜合計': {
                    'value': record.税抜合計.value
                },
                '外税T_消費税額合計': {
                    'value': record.外税T_消費税額合計.value
                },
                '内税': {
                    'value': record.内税.value
                },
                '税込合計': {
                    'value': record.税込合計.value
                },
                '商品コード_JANコード': {
                    'value': element.value.商品コード_JANコード.value
                },
                '商品名': {
                    'value': element.value.商品名.value
                },
                '商品区分': {
                    'value': element.value.商品区分.value
                },
                '倉庫コード': {
                    'value': element.value.倉庫コード.value
                }, 
                '倉庫エリアコード': {
                    'value': element.value.倉庫エリアコード.value
                },
                '入数': {
                    'value': element.value.入数.value
                },
                '箱数': {
                    'value': element.value.箱数.value
                },
                '数量': {
                    'value': element.value.数量.value
                },
                '単位': {
                    'value': element.value.単位.value
                },
                '単価_0': {
                    'value': element.value.単価.value
                },
                '金額': {
                    'value': element.value.金額.value
                },
                '入荷日': {
                    'value': element.value.入荷日.value
                },
                '入荷済数': {
                    'value': element.value.入荷済数.value
                },
                '入庫日': {
                    'value': element.value.入庫日.value
                },
                '入庫済数': {
                    'value': element.value.入庫済数.value
                },
                '備考': {
                    'value': element.value.備考.value
                },
                '発注管理_レコード番号': {
                    'value': record.$id.value
                },
                '発注管理_TableID': {
                    'value': parseInt(element.id)
                },
            };
            if (!tableOld.includes(element.id)) {
                bodyPost.records.push(item);
            } else {
                var findId = oldData.find(i => i.発注管理_TableID.value == element.id).$id.value;
                let itemPut = {
                    id: findId,
                    record: item
                };
                bodyPut.records.push(itemPut);
            }
        });
        idDel = oldData.filter(i => !tableNew.includes(i.発注管理_TableID.value)).map(i => i.$id.value);
        bodyDel.ids = idDel;
        if (bodyPost.records.length > 0) {
            var respPost = await kintone.api(kintone.api.url('/k/v1/records.json', true), 'POST', bodyPost);
        }
        if (bodyPut.records.length > 0) {
            var respPut = await kintone.api(kintone.api.url('/k/v1/records.json', true), 'PUT', bodyPut);
        }
        if (bodyDel.ids.length > 0) {
            var respDel = await kintone.api(kintone.api.url('/k/v1/records.json', true), 'DELETE', bodyDel);
        }
        return event;
    });
})();