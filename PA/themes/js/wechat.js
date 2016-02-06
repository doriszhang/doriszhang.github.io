
var Doris = Doris || {};

Doris.Wechat = {

    init: function (options) {

        window.shareData = {
            "imgUrl": "http://doriszhang.github.io/logo.jpg",
            "timeLineLink": "http://doriszhang.github.io/PA/index.html",
            "tTitle": "Game - Doris",
            "tContent": "Doris training"
        };

        if (options.imgUrl) { window.shareData.imgUrl = options.imgUrl; }
        if (options.timeLineLink) { window.shareData.timeLineLink = options.timeLineLink; }
        if (options.tTitle) { window.shareData.tTitle = options.tTitle; }
        if (options.tContent) { window.shareData.tContent = options.tContent; }

        var shareFriend = function () {
            WeixinJSBridge.invoke('sendAppMessage', {
                "img_url": window.shareData.imgUrl,
                "link": window.shareData.timeLineLink,
                "desc": window.shareData.tContent,
                "title": window.shareData.tTitle
            }, function (res) { });
        };

        var shareTimeline = function () {
            WeixinJSBridge.invoke('shareTimeline', {
                "img_url": window.shareData.imgUrl,
                "img_width": "200",
                "img_height": "200",
                "link": window.shareData.timeLineLink,
                "desc": window.shareData.tContent,
                "title": window.shareData.tTitle
            }, function (res) { });
        };

        //var shareWeibo = function () {
        //    WeixinJSBridge.invoke('shareWeibo', {
        //        "content": options.description,
        //        "url": options.title,
        //    }, function (res) { });
        //};

        //document.addEventListener('click', function () { console.log(window.shareData);});

        document.addEventListener('WeixinJSBridgeReady', function onBridgeReady() {
            WeixinJSBridge.on('menu:share:appmessage', function (argv) {
                shareFriend();
            });
            WeixinJSBridge.on('menu:share:timeline', function (argv) {
                shareTimeline();
            });
            //WeixinJSBridge.on('menu:share:weibo', function (argv) {
            //    shareWeibo();
            //});
        }, false);

    }

};