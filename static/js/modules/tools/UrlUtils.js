define([], function (){
    // 传入url，返回参数字典。如果url缺省，则按当前url算
    function getUrlParams(url){
        url = url ? url : window.location.href;
        var queryString = '';
        if (-1 == url.indexOf('?')) {
            queryString = '';
        } else {
            queryString = url.split('?')[1];
        }
        return getParamDict(queryString);
    }

    // 传入参数字符串，返回参数字典
    function getParamDict(queryString){
        var dict = {};
        var s = queryString.split('&');
        for (var i = 0; i < s.length; i += 1) {
            var t = s[i].split('=');
            dict[decodeURIComponent(t[0])] = decodeURIComponent(t[1]);
        }
        return dict;
    }

    // 传入一个字典，生成参数字符串
    function renderQueryString(dict){
        var queryArray = [];
        for (var k in dict) {
            queryArray.push(encodeURIComponent(k) + '=' + encodeURIComponent(dict[k]));
        }
        return queryArray.join('&');
    }

    return {
        getUrlParams     : getUrlParams,
        getParamDict     : getParamDict,
        renderQueryString: renderQueryString
    };
});