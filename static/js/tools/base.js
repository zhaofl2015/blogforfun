(function(Wind) {
    var version = "0.0.3";

    var Tools = {};

    function extend(child, parent) {
        var key;
        for(key in parent){
            if(parent.hasOwnProperty(key)){
                child[key] = parent[key];
            }
        }
    }

    function include(child, parent) {
        var key;
        for(key in parent){
            if(parent.hasOwnProperty(key)){
                child.prototype[key] = parent[key];
            }
        }
    }

    function namespace() {
        var space = arguments[0];
        var str = "window.";
        space = space.split(".");
        for(var i = 0, len = space.length; i < len; i++){
            str += space[i];

            if(i == len - 1 && arguments.length == 2){
                eval("if(!" + str + "){ " + str + " = '" + arguments[1] + "';}");
            }else{
                eval("if(!" + str + "){ " + str + " = {};}");
            }

            str += ".";
        }
        return true;
    }

    function guid(format) {
        return format.toLowerCase().replace(/[xy]/g, function(c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        }).toUpperCase();
    }

    function backToTop(time) {
        $('html, body').animate({scrollTop: '0px'}, time || 0);
    }

    function replaceAll(target, str1, str2) {
        return target.replace(new RegExp(str1, "gm"), str2);
    }

    //显示loading图标
    function loadingStart(showmask) {
        if(showmask){
            var mask = $('.loadingmask');
            if(mask.length == 0){
                mask = $('<div class="loadingmask"></div>').appendTo(document.body);
            }
            mask.show();
        }
        var loadingicon = $('.loadingicon');
        if(loadingicon.length == 0){
            loadingicon = $('<img class="loadingicon" style="" src="/static/img/loading.gif" alt="正在加载" />').appendTo(document.body);
        }
        loadingicon.show();
    }

    //隐藏loading图标
    function loadingEnd(hidemask) {
        $('.loadingicon').hide();
        if(hidemask){
            $('.loadingmask').hide();
        }
    }

    /*通用消息提示弹窗
     **type为消息类型，'error'：错误，'success'：成功，'info'：普通消息，'warning'：警告
     */
    function msgTip(text, type, title) {
        type = type || 'error';
        title = title || null;
        if(typeof toastr !== 'undefined'){
            toastr[type](text, title, {
                positionClass: 'toast-middle-center',
                timeOut      : 2000
            })
        }
        else{
            alert(text);
        }
    }

    //通用ajax请求
    function ajax(conf) {
        var confObj = {
            url            : conf.url || '',
            type           : conf.type || 'POST',
            dataType       : conf.dataType || 'json',
            data           : conf.data,
            showLoading    : conf.showLoading===undefined ? true : conf.showLoading,  //是否显示loading图标
            showLoadingMask: conf.showLoadingMask===undefined ? true : conf.showLoadingMask,  //是否显示遮罩层
            success        : function(returnData) {
                if(returnData){
                    if(returnData.success){
                        conf.success && conf.success(returnData);
                    }else{
                        var errormsg = returnData.error || returnData.info || '操作失败，请重试！';
                        msgTip(errormsg);
                    }
                }
            },
            error          : function(xhr, textStatus) {
                if(textStatus != 'abort'){
                    if(conf.error){
                        conf.error();
                    }
                    else{
                        msgTip('发送请求失败，请重试！');    
                    }
                    
                }
            },
            complete       : function() {
                conf.complete && conf.complete();

                this.showLoading && loadingEnd(!!this.showLoadingMask);
                //如果页面js报错导致阻塞，隐藏loading
                if($('.loadingmask').css('display') == 'block'){
                    loadingEnd(true);
                }
            }
        }

        confObj.showLoading && loadingStart(!!confObj.showLoadingMask);
        $.ajax(confObj);
    }

    //对图上填空题进行处理，防止出现预览错误的问题
    function formatBlockImage(){
        $('div[id="img_parent"]').each(function(){
            var img = $(this).find('img');
            var copy = img.clone();
            img.css('visibility', 'hidden');
            copy.css({position: 'absolute', left: 0, top: 0});
            img.after(copy);
        });
    }

    //把填空题、选词填空题的空站位符解析为标号
    function parseBlock(selector){
        setTimeout(function(){
            $(selector).each(function(){
                var count = 0;
                var $this = $(this);
                var content = $this.html();
                var newCont = content.replace(/__\$\$__|\\fbox {}/g, function(str){
                    if(str == "__$$__"){
                        return '<span style="padding:0 20px;border-bottom:1px solid #000;white-space: nowrap;">空' + (++count) + '</span>';
                    }else{
                        return '\\fbox {空'+(++count)+'}';
                    }
                });
                $this.html(newCont);

                $this.find('img[latex]').each(function(index, element){
                    var latex = $(element).attr('latex');
                    $.ajax({
                        url     : 'https://tiku.17zuoye.net/latex/render?r=p&ds=140&m=y&s=' + encodeURIComponent(latex),
                        dataType: "jsonp",
                        jsonp   : "cb",
                        success: function(data){
                            $(element).attr('src', data.url);
                        }
                    });
                });
            });

            formatBlockImage();

        }, 100)
    }

    extend(Wind, {
        $tools: Tools
    });

    extend(Tools, {
        version     : version,
        include     : include,
        extend      : extend,
        namespace   : namespace,
        guid        : guid,
        backToTop   : backToTop,
        replaceAll  : replaceAll,
        loadingStart: loadingStart,
        loadingEnd  : loadingEnd,
        msgTip      : msgTip,
        ajax        : ajax,
        parseBlock  : parseBlock
    });
}(window));
