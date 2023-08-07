(function() {
            'use strict'
            var batchFlag = 0;
            var detailEvent = function (event) {
                var listJSUrls = ["https://lintone.net/storage/build/241/231/pdf/js/lintone-pdf-build.js"];
                var listCssUrls = ["https://lintone.net/storage/build/241/231/pdf/css/lintone-pdf-build.css"];
                insertLink(listCssUrls)
                insertSrc(listJSUrls);
                return event;
            };
            var indexEvent = function (event) {
                var listJSUrls = [] ;
                var listCssUrls = ["https://lintone.net/storage/build/241/231/pdf/css/lintone-pdf-build.css"];
                insertLink(listCssUrls)
                insertSrc(listJSUrls);
                return event;
            };
            function insertLink(listUrls) {
              var l, styl;
              listUrls.forEach(url => {
                styl = document.createElement('link');
                styl.rel = 'stylesheet';
                styl.type = 'text/css';
                styl.href = url;
                l = document.getElementsByTagName('link')[0];
                l.parentNode.insertBefore(styl, l);
              });
            };
            function insertSrc(listUrls) {
              var  src, s;
              listUrls.forEach(url => {
                  src = document.createElement('script');
                  src.type = 'text/javascript';
                  src.async = true;
                  src.src = url;
                  s = document.getElementsByTagName('script')[0];
                  s.parentNode.insertBefore(src,s);
              });
            };
            kintone.events.on('app.record.detail.show', detailEvent);
            kintone.events.on('mobile.app.record.detail.show', detailEvent);
            if (batchFlag) {
                kintone.events.on('app.record.index.show', indexEvent);
                kintone.events.on('mobile.app.record.index.show', indexEvent);
            }
        })();