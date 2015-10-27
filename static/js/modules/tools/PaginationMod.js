define(["UrlUtils"], function(UrlUtils){
    var settings = {
        pageDiv: '.paginationContainer'
    };

    var getQueryStringPaged = function(page){
        // 生成页码链接中的href
        var params = UrlUtils.getUrlParams();
        params['page'] = page;
        return '?' + UrlUtils.renderQueryString(params);
    };
    var renderItem = function(page, display, onclickFuncName) {
        if (onclickFuncName) {
            // ajax页码，调用你定义的onclickFuncName(page)
            return '<li><a href="javascript:" onclick="' + onclickFuncName + '(' + page + ', this)">' + display + '</a></li>';
        } else {
            // 非ajax页码，直接用href
            return '<li><a href="' + getQueryStringPaged(page) + '">' + display + '</a></li>';
        }
    };
    var renderPagination = function(page, per_page, total, onclickFuncName){
        // page: 当前页码
        // per_page: 每页条目数
        // total: 总条目数。
        // onclickFuncName: 可选。点击页码时调用的函数名称。

        var pages = Math.ceil(total / per_page);
        var i;
        var html = '<ul class="pagination">';
        if (page != 0 && pages != 0) {
            if (page > 1) {
                // 上一页
                html += renderItem(page - 1, '&laquo;', onclickFuncName);
            } else {
                html += '<li class=disabled><span>&laquo;</span></li>';
            }
            if (page < pages) {
                // 下一页
                html += renderItem(page + 1, '&raquo;', onclickFuncName);
            } else {
                html += '<li class=disabled><span>&raquo;</span></li>';
            }
            // 最前的几页
            for (i = 1; i <= 3; i++) {
                if (i < page - 5)
                    html += renderItem(i, i, onclickFuncName);
            }
            // 省略号
            if (page >= 10)
                html += '<li><span class=ellipsis>…</span></li>';
            // 前几页
            for (i = page - 5; i < page; i++) {
                if (i > 0)
                    html += renderItem(i, i, onclickFuncName);
            }
            // 当前页
            html += '<li class="active"><a href="#">' + page + '<span class="sr-only">(current)</span></a></li>';
            // 后几页
            for (i = page + 1; i <= page + 5 && i <= pages; i++) {
                if (i < pages - 2)
                    html += renderItem(i, i, onclickFuncName);
            }
            // 省略号
            if (pages - page >= 9)
                html += '<li><span class=ellipsis>…</span></li>';
            // 最后的几页
            for (i = pages - 2; i <= pages; i++) {
                if (i > page)
                    html += renderItem(i, i, onclickFuncName);
            }
        }
        html += '<li><span>' + (total == undefined ? '未知' : total) + '条记录，共' + pages + '页</span></li>';
        html += '</ul>';

        $(settings.pageDiv).html(html);
    };
    return {
        settings        : settings,
        renderPagination: renderPagination
    };
});
