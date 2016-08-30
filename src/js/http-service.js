'use strict';

// Http service for making jsonp calls

var httpSvc = (function () {
    var callbackStack = [];

    var httpInterceptors = [];

    window.jsonCallback = function (response) {
        httpInterceptors.forEach(function(interceptor){
            interceptor.responseCb.call();     
        });

        var fn = callbackStack.pop();
        if (typeof fn === 'function') {
            fn.call(undefined, response);
        }
    };

    function sendJsonP(url, callback) {
        httpInterceptors.forEach(function(interceptor){
            interceptor.requestCb.call();
        });

        callbackStack.push(callback);

        var script = document.createElement('script');
        script.src = url + '&callback=jsonCallback';
        document.body.appendChild(script);

        script.onload = function () {
            this.remove();
        };
    }

    function addInterceptor(cb){
        httpInterceptors.push(cb);
    }

    function removeInterceptor(cb){
        var index = httpInterceptors.indexOf(cb);
        if(index !== -1){
            httpInterceptors.splice(index);
        }
    }

    return {
        sendCorsReq: sendJsonP,
        registerInterceptor: addInterceptor,
        unregisterInterceptor: removeInterceptor
    };
})();
