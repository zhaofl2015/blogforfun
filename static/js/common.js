/**
 * Created by chong.liu on 2015/6/9.
 */

function commonAjax(url, requestData, callback, method) {
    // requestData: 字符串或字典
    var dialogWaiting=$('<div class="dialogWaiting">请稍候……</div>').appendTo('body');
    var options = {
        url: url,
        dataType: 'json',
        method: method ? method : 'post',
        data: requestData,
        success: function (data) {
            dialogWaiting.remove();
            if (data['error']) {
                alert(data['error']);
            } else if (callback) {
                callback(data);
            }
        },
        error: function () {
            dialogWaiting.remove();
            alert('服务器错误！可能没有成功……');
        }
    };
    $.ajax(options);
}

function makeRandomId() {
    return Math.random().toString(36).replace('.', '');
}

// URL工具集
// 使用方法：直接调用return中暴露出来的一个函数即可
// 如var myDict = UrlUtils.getUrlParams(url);
var UrlUtils = (function(){
    // 传入url，返回参数字典。如果url缺省，则按当前url算
    function getUrlParams(url) {
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
        getUrlParams:getUrlParams,
        getParamDict:getParamDict,
        renderQueryString:renderQueryString
    }
})();

// 表单工具集
// 使用方法：直接调用return中暴露出来的一个函数即可
// 如var myDict = FormUtils.formToDict( $('#form_id') );
var FormUtils = (function(){
    // 给一个<select>生成所有<option>
    var renderSelectOptions = function(select, choices, emptyOption, selectedValue) {
        select.empty();
        if (emptyOption) {
            // 不做任何选择时的选项
            $('<option>', {value: emptyOption[0], text: emptyOption[1]}).appendTo(select);
        }
        for (var i=0; i < choices.length; i++) {
            // 所有选项
            if (select.find("option[value='" + choices[i][0] + "']").length == 0) {
                $('<option>', {value: choices[i][0], text: choices[i][1]}).appendTo(select);
            }
        }
        // 如果有已经选择的选项，则选上
        if (selectedValue) {
            select.val(selectedValue);
        }
        // 激活change事件
        select.change();
    };

    // 传入表单的jQuery对象，返回表单的参数字典
    var formToDict = function(form){
        var dict = {};
        var arr = form.serializeArray();
        for (var i=0; i < arr.length; i++) {
            if (arr[i].name.toLowerCase() != 'submit' && arr[i].value != undefined) {
                dict[arr[i].name] = arr[i].value;
            }
        }
        return dict;
    };

    return {
        renderSelectOptions: renderSelectOptions,
        formToDict: formToDict
    }
})();

// 纯前端生成分页HTML代码的模块。
// 使用方法：
// PaginationMod.renderPagination(page, per_page, total, onclickFuncName);
// 参数说明见renderPagination函数定义。
var PaginationMod = (function(){
    var settings = {
        pageDiv: $('.paginationContainer')
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
        settings.pageDiv.html(html);
    };
    return {
        settings: settings,
        renderPagination: renderPagination
    };
})();

/*
 * jsTree 可视化展示对象
 * 使用方式 new TreeView(option)
 *      option 配置项
 *          target          : 生成树锚点(必填)
 *          subject         : 学科信息(必填)
 *          data            : 用已有数据渲染树
 *          formatData      : 格式化data函数
 *          getChildrenUrl  : 请求方式展示时节点内容请求地址
 *          getAllUrl       : 请求全部数据
 *          showRoot        : 是否展示根节点(默认显示)[fasle or true]
 *          maxTags         : 是否限制maxTags数量(默认值0 为不限制)
 *          beforeAddTag    : addTag 函数 before 处理函数 (返回false不添加 or 返回true添加)
 *          afterAddTag     : addTag 函数 after 处理函数
 * return {jsTree实例}
 */
var TreeView = (function(){

    function TreeView(options){
        var self = this;

        if(!options.target){
            throw new Error("绑定对象不能为空!");
            return false;
        }

        if(!options.subject){
            throw new Error("学科信息不能为空!");
            return false;
        }

        self.settings = {
            target          : null,                                 // * 必填   绑定的锚点
            subject         : null,                                 // * 必填   学科信息
            data            : null,                                 //          如果data不为null，则用data提供的数据
            getChildrenUrl  : '',                                   //          如果data为空，用请求地址请求
            getAllUrl       : '',                                   //          时候全部请求
            showRoot        : false,                                //          是否显示根节点
            maxTags         : 0,                                    //          0 表示不限制
            beforeAddTag    : function(){ return true; },           //          addTag before hook funciton
            afterAddTag     : function(){ return true; },           //          addTag after hook function
            formatData      : function(data){ self.settings.data = data; }   //          格式化 data 数据
        };

        for(var attr in options){
            this.settings[attr] = options[attr];
        }
 
        self.treeDialog = null;   

        self.openTreeDialog = function() {
            // 打开选择对话框
            self.curTagsInput = $(this).parent().prev();
            self.buildTreeDialog();
            self.treeDialog.modal('show');
        };

        self.buildTreeDialog = function(){
            // 生成知识点选择对话框
            if(self.treeDialog){
                self.treeDialog.remove();
            }
            var id = makeRandomId();
            var treeDialogHTML =
                '<div id="' + id + '" class="modal fade" tabindex="-1">' +
                    '<div class="modal-dialog">' +
                        '<div class="modal-content">' +
                            '<div class="modal-header">' +
                                '<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>' +
                                '<h4 class="modal-title">请选择...</h4>' +
                            '</div>' +
                            '<div class="modal-body">' +
                                '<div class="treeSearch"><select placeholder="搜索"></select></div>' +
                                '<div class="tree_div"></div>' +
                            '</div>' +
                        '</div>' +
                    '</div>' +
                '</div>';
            self.treeDialog = $(treeDialogHTML).appendTo('body');

            var tree = self.treeDialog.find('.tree_div');
            tree.jstree({
                core    : {
                    check_callback  : true,
                    themes          : { stripes: true },
                    data            : self.settings.data || {
                        url     : self.settings.getChildrenUrl,
                        dataType: 'json',
                        data    : function(node){
                            return {
                                parent_id   : node.id,
                                subject_id  : self.settings.subject,
                                show_root   : self.settings.showRoot ? 1 : 0
                            };
                        }
                    }
                },
                plugins : [ "search" ]
            }).on('select_node.jstree', function(e, data){
                // 绑定树节点点击事件
                self.addTag(data.node.id, data.node.text, data.node.parents);
            });
            self.treeControl = tree.jstree(true);

            if(self.settings.getAllUrl){
                // 设置了getAllPointsUrl时，预先加载所有数据
                // 生成搜索框
                var treeSearchSelect = self.treeDialog.find('select');
                treeSearchSelect.selectize({
                    valueField  : 'id',
                    labelField  : 'text',
                    searchField : 'text',
                    sortField   : 'text',
                    options     : [],
                    create      : false,
                    onItemAdd   : function (value, $item) {
                        // 绑定搜索下拉框点击事件
                        self.addTag(value, $item.text());
                        self.selectizeControl.clear();
                    }
                });
                self.selectizeControl = treeSearchSelect[0].selectize;

                // 搜索框初始化
                var searchDataLoaded = false;
                treeSearchSelect.next().children().first().click(function(){
                    console.log(123);
                    var control = treeSearchSelect[0].selectize;
                    if(!searchDataLoaded){
                        searchDataLoaded = true;
                        self.treeDialog.find('input').prop({ placeholder: '请稍候...' });
                        var url = self.settings.getAllUrl;
                        commonAjax(url, null, function(data){
                            for(var i in data){
                                control.addOption({ id: data[i][0], text: data[i][1] });
                            }
                            self.treeDialog.find('input').prop({ placeholder: '搜索' });
                        });
                    }
                });
            }else{
                // 未设置getAllUrl时，直接搜树
                var searchBox = $('<input>', {
                    'class'     : 'form-control',
                    placeholder : '搜索',
                    keyup       : function(){
                        self.treeControl.search(this.value, true, true);
                    }
                });
                $('#' + id).find('.treeSearch').html(searchBox);
            }

            return self;
        };

        self.addTag = function(node_id, node_name, parents) {
            // 给当前标签框加一个标签
            self.addTagTo(self.curTagsInput, node_id, node_name, parents);
        };

        self.addTagTo = function(inputObj, node_id, node_name, parents){
            // 给指定标签框加一个标签
            if (!inputObj) {
                return;
            }

            var tag = { id: node_id, text: node_name };
            if(!self.settings.beforeAddTag(tag, parents, self.treeControl)){
                // hook 函数，检查是否可以加这个标签
                return;
            }
            if(self.settings.maxTags == 1){
                self.clearTagsOf(inputObj);
            }
            inputObj.tagsinput('add', tag);
            if(self.treeDialog){
                self.treeDialog.modal('hide');
            }
            
            // hook 函数，加标签后的操作
            self.settings.afterAddTag(tag, parents, self.treeControl);
        };

        self.getTags = function(){
            // 获取当前标签框的标签
            return self.getTagsOf(self.curTagsInput);
        };

        self.clearTags = function(){
            // 清除当前标签框
            self.clearTagsOf(self.curTagsInput);
        };

        self.bindInput = function(target){
            // 使一个input成为标签输入框并且点击打开选择对话框
            // 生成标签框
            target.tagsinput({
                trimValue   : true,
                itemValue   : 'id',
                itemText    : 'text',
                maxTags     : self.settings.maxTags
            });
            target.next().next('.bootstrap-tagsinput').remove();
            // 绑定标签框点击事件
            target.next().find('input').unbind('click').click(self.openTreeDialog);
        };

        self.bindInput(self.settings.target);

        self.settings.target.on("itemRemoved", self.settings.tagsChange);

        self.curTagsInput = self.settings.target.first();

        if(self.settings.data){
            //self.settings.formatData(self.settings.data);
            self.settings.formatData.call(self, self.settings.data);
        }
    }

    TreeView.prototype.getTagsOf = function(){
        // 获取指定标签框的标签
        return inputObj ? inputObj.tagsinput('items') : [];
    };

    TreeView.prototype.clearTagsOf = function(inputObj){
        // 清除指定标签框
        if(inputObj){
            inputObj.tagsinput('removeAll');
        }
    };

    return TreeView;
}());

//已有数据渲染成树
//LocalTreeDialog.init()
var LocalTreeDialog = (function(){

    function LTD(options){
        var self = this;

        self.treeDialog          = null;
        self.curTagsInput        = null;
        self.treeControl         = null;
        self.selectizeControl    = null;

        self.settings = {
            inputs              : null,
            data                : [],
            showRoot            : 0,
            maxTags             : 0,        // 最多可选择几个标签，0表示不限制
            tagsChange          : function(){},
            beforeAddTag        : null,     // 可选，hook 函数，检查是否可以加这个标签, 返回False则不添加标签
            afterAddTag         : null,     // 可选，hook 函数，加标签后的操作
            formatData          : null
        };

        for (var k in options) {
            self.settings[k] = options[k];
        }

        self.openTreeDialog = function() {
            // 打开选择对话框
            self.curTagsInput = $(this).parent().prev();
            self.buildTreeDialog();
            self.treeDialog.modal('show');
        };

        self.buildTreeDialog = function() {
            var self = this;

            // 生成知识点选择对话框
            if (self.treeDialog) {
                self.treeDialog.remove();
            }
            var id = makeRandomId();
            var treeDialogHTML =
                '<div id="' + id + '" class="modal fade" tabindex="-1">' +
                    '<div class="modal-dialog">' +
                        '<div class="modal-content">' +
                            '<div class="modal-header">' +
                                '<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>' +
                                '<h4 class="modal-title">请选择...</h4>' +
                            '</div>' +
                            '<div class="modal-body">' +
                                '<div class="treeSearch"><select placeholder="搜索"></select></div>' +
                                '<div class="tree_div"></div>' +
                            '</div>' +
                        '</div>' +
                    '</div>' +
                '</div>';
            self.treeDialog = $(treeDialogHTML).appendTo('body');

            // 生成知识点树
            var tree = self.treeDialog.find('.tree_div');
            tree.jstree({
                core : {
                    check_callback  : true,
                    themes          : { stripes: true },
                    data            : self.settings.data
                },
                plugins: [
                    "search"
                ]
            }).on('select_node.jstree', function(e, data){
                // 绑定树节点点击事件
                self.addTag(data.node.id, data.node.text, data.node.parents);
            });
            self.treeControl = tree.jstree(true);

            if (self.settings.getAllPointsUrl) {
                // 设置了getAllPointsUrl时，预先加载所有数据
                // 生成搜索框
                var treeSearchSelect = self.treeDialog.find('select');
                treeSearchSelect.selectize({
                    valueField  : 'id',
                    labelField  : 'text',
                    searchField : 'text',
                    sortField   : 'text',
                    options     : [],
                    create      : false,
                    onItemAdd   : function (value, $item) {
                        // 绑定搜索下拉框点击事件
                        addTag(value, $item.text());
                        self.selectizeControl.clear();
                    }
                });
                self.selectizeControl = treeSearchSelect[0].selectize;

                // 搜索框初始化
                var searchDataLoaded = false;
                treeSearchSelect.next().children().first().click(function () {
                    var control = treeSearchSelect[0].selectize;
                    if (!searchDataLoaded) {
                        searchDataLoaded = true;
                        self.treeDialog.find('input').prop({placeholder: '请稍候...'});
                        var url = self.settings.getAllPointsUrl;
                        commonAjax(url, null, function (data) {
                            for (var i in data) {
                                control.addOption({ id: data[i][0], text: data[i][1] });
                            }
                            self.treeDialog.find('input').prop({placeholder: '搜索'});
                        });
                    }
                });
            } else {
                // 未设置getAllPointsUrl时，直接搜树
                var searchBox = $('<input>', {
                    'class': 'form-control',
                    placeholder: '搜索',
                    keyup: function () {
                        self.treeControl.search(this.value, true, true);
                    }
                });
                $('#' + id).find('.treeSearch').html(searchBox);
            }
        };

        self.addTag = function(point_id, point_name, parents) {
            // 给当前标签框加一个标签
            this.addTagTo(self.curTagsInput, point_id, point_name, parents);
        };

        self.addTagTo = function(inputObj, point_id, point_name, parents){
            // 给指定标签框加一个标签
            if (!inputObj) {
                return;
            }

            var tag = {id: point_id, text: point_name};
            if(this.settings.beforeAddTag && !this.settings.beforeAddTag(tag, parents, this.treeControl)){
                // hook 函数，检查是否可以加这个标签
                return;
            }
            if(this.settings.maxTags == 1){
                this.clearTagsOf(inputObj);
            }
            inputObj.tagsinput('add', tag);
            if (this.treeDialog) {
                this.treeDialog.modal('hide');
            }
            if (this.settings.afterAddTag) {
                // hook 函数，加标签后的操作
                this.settings.afterAddTag(tag, parents, this.treeControl);
            }
        };

        self.getTags = function(){
            // 获取当前标签框的标签
            return this.getTagsOf(this.curTagsInput);
        };

        self.clearTags = function(){
            // 清除当前标签框
            this.clearTagsOf(this.curTagsInput);
        };

        self.bindInput = function(inputs){
            // 使一个input成为标签输入框并且点击打开选择对话框
            // 生成标签框
            inputs.tagsinput({
                trimValue: true,
                itemValue: 'id',
                itemText: 'text',
                maxTags: this.settings.maxTags
            });
            inputs.next().next('.bootstrap-tagsinput').remove();
            // 绑定标签框点击事件
            inputs.next().find('input').unbind('click').click(this.openTreeDialog);
        };

        self.bindInput(self.settings.inputs);

        self.settings.inputs.on("itemRemoved", self.settings.tagsChange);

        self.curTagsInput = self.settings.inputs.first();

        if(self.settings.formatData == null){
            self.formatData(self.settings.data);
        }else{
            self.settings.formatData(self.settings.data);
        }
    };

    LTD.prototype.getTagsOf = function(inputObj){
        // 获取指定标签框的标签
        return inputObj ? inputObj.tagsinput('items') : [];
    };

    LTD.prototype.clearTagsOf = function(inputObj){
        // 清除指定标签框
        if (inputObj)
            inputObj.tagsinput('removeAll');
    };

    LTD.prototype.formatData = function(data){
        for(var i = 0; i < data.length; i++){
            data[i].text = data[i].name;
            data[i].id = data[i]._id;
            if(typeof data[i].children != 'undefined' && data[i].children.length > 0){
                arguments.callee(data[i].children);
            }
        }
        return true;
    };

    return LTD;
}());

// 树节点展示、选择和搜索对话框
// TreeDialogMod.init()
var TreeDialogMod = (function(){
    var settings = {
        inputs: $('.treeDialog'),
        getChildrenUrl: '',
        getAllPointsUrl: '',
        showRoot: 0,
        maxTags: 0,   // 最多可选择几个标签，0表示不限制
        subjectId: null,
        beforeAddTag: null,   // 可选，hook 函数，检查是否可以加这个标签, 返回False则不添加标签
        afterAddTag: null   // 可选，hook 函数，加标签后的操作
    };
    var treeDialog = null;
    var treeSubjectId = null;
    var curTagsInput = null;
    var treeControl = null;
    var selectizeControl = null;

    var getSubjectId = function() {
        // 获取当前subjectId
        var subject = $('#subject_id');
        if (subject.length) {
            return subject.val();
        } else if (settings.subjectId) {
            return settings.subjectId
        } else {
            return null;
        }
    };

    var buildTreeDialog = function() {
        // 生成知识点选择对话框
        if (treeDialog) {
            treeDialog.remove();
        }
        var id = makeRandomId();
        var treeDialogHTML =
            '<div id="' + id + '" class="modal fade" tabindex="-1">' +
                '<div class="modal-dialog">' +
                    '<div class="modal-content">' +
                        '<div class="modal-header">' +
                            '<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>' +
                            '<h4 class="modal-title">请选择...</h4>' +
                        '</div>' +
                        '<div class="modal-body">' +
                            '<div class="treeSearch"><select placeholder="搜索"></select></div>' +
                            '<div class="tree_div"></div>' +
                        '</div>' +
                    '</div>' +
                '</div>' +
            '</div>';
        treeDialog = $(treeDialogHTML).appendTo('body');

        // 生成知识点树
        var tree = treeDialog.find('.tree_div');
        tree.jstree({
            core : {
                check_callback: true,
                themes: {stripes: true},
                data: {
                    url: settings.getChildrenUrl,
                    dataType: 'json',
                    data: function (node) {
                        return {parent_id: node.id, subject_id: treeSubjectId, show_root: settings.showRoot};
                    }
                }
            },
            plugins: [
                "search"
            ]
        }).on('select_node.jstree', function(e, data){
            // 绑定树节点点击事件
            addTag(data.node.id, data.node.text, data.node.parents);
        });
        treeControl = tree.jstree(true);

        if (settings.getAllPointsUrl) {
            // 设置了getAllPointsUrl时，预先加载所有数据
            // 生成搜索框
            var treeSearchSelect = treeDialog.find('select');
            treeSearchSelect.selectize({
                valueField: 'id',
                labelField: 'text',
                searchField: 'text',
                sortField: 'text',
                options: [],
                create: false,
                onItemAdd: function (value, $item) {
                    // 绑定搜索下拉框点击事件
                    addTag(value, $item.text());
                    selectizeControl.clear();
                }
            });
            selectizeControl = treeSearchSelect[0].selectize;

            // 搜索框初始化
            var searchDataLoaded = false;
            treeSearchSelect.next().children().first().click(function () {
                var control = treeSearchSelect[0].selectize;
                if (!searchDataLoaded) {
                    searchDataLoaded = true;
                    treeDialog.find('input').prop({placeholder: '请稍候...'});
                    var url = settings.getAllPointsUrl;
                    url += treeSubjectId ? treeSubjectId.toString() : '';
                    commonAjax(url, null, function (data) {
                        for (var i in data) {
                            control.addOption({id: data[i][0], text: data[i][1]});
                        }
                        treeDialog.find('input').prop({placeholder: '搜索'});
                    });
                }
            });
        } else {
            // 未设置getAllPointsUrl时，直接搜树
            var searchBox = $('<input>', {
                'class': 'form-control',
                placeholder: '搜索',
                keyup: function () {
                    treeControl.search(this.value, true, true);
                }
            });
            $('#' + id).find('.treeSearch').html(searchBox);
        }
    };

    var openTreeDialog = function() {
        // 打开选择对话框
        curTagsInput = $(this).parent().prev();
        var currentSubjectId = getSubjectId();
        if (currentSubjectId != treeSubjectId || !currentSubjectId) {
            treeSubjectId = currentSubjectId;
            buildTreeDialog();
        }
        treeDialog.modal('show');
    };

    var addTag = function(point_id, point_name, parents) {
        // 给当前标签框加一个标签
        addTagTo(curTagsInput, point_id, point_name, parents);
    };

    var addTagTo = function(inputObj, point_id, point_name, parents){
        // 给指定标签框加一个标签
        if (!inputObj) {
            return;
        }

        var tag = {id: point_id, text: point_name};
        if (settings.beforeAddTag && ! settings.beforeAddTag(tag, parents, treeControl)) {
            // hook 函数，检查是否可以加这个标签
            return;
        }
        if (settings.maxTags == 1) {
            clearTagsOf(inputObj);
        }
        inputObj.tagsinput('add', tag);
        if (treeDialog) {
            treeDialog.modal('hide');
        }
        if (settings.afterAddTag) {
            // hook 函数，加标签后的操作
            settings.afterAddTag(tag, parents, treeControl);
        }
    };

    var getTags = function(){
        // 获取当前标签框的标签
        return getTagsOf(curTagsInput);
    };

    var getTagsOf = function(inputObj){
        // 获取指定标签框的标签
        return inputObj ? inputObj.tagsinput('items') : [];
    };
    
    var clearTags = function(){
        // 清除当前标签框
        clearTagsOf(curTagsInput);
    };

    var clearTagsOf = function(inputObj){
        // 清除指定标签框
        if (inputObj)
            inputObj.tagsinput('removeAll');
    };

    var bindInput = function(inputs){
        // 使一个input成为标签输入框并且点击打开选择对话框
        // 生成标签框
        inputs.tagsinput({
            trimValue: true,
            itemValue: 'id',
            itemText: 'text',
            maxTags: settings.maxTags
        });
        inputs.next().next('.bootstrap-tagsinput').remove();
        // 绑定标签框点击事件
        inputs.next().find('input').unbind('click').click(openTreeDialog);
    };

    var init = function(options){
        for (var k in options) {
            settings[k] = options[k];
        }
        if(settings.subjectId != null){
            bindInput(settings.inputs);
            curTagsInput = settings.inputs.first()
        }
    };

    return {
        settings: settings,
        init: init,
        addTag: addTag,
        addTagTo: addTagTo,
        getTags: getTags,
        getTagsOf: getTagsOf,
        clearTags: clearTags,
        clearTagsOf: clearTagsOf,
        bindInput: bindInput
    };
})();

// 地区展示、选择和搜索对话框
var RegionDialogMod = (function(){
    var settings = {
        inputs: $('.regionDialog'),
        getChildrenUrl: '/service/regions-tree',
        getAllPointsUrl: '/service/regions-all',
        maxTags: 0,   // 最多可选择几个标签，0表示不限制
        beforeAddTag: null   // 可选，hook 函数，检查是否可以加这个标签, 返回False则不添加标签
    };
    var treeDialog = null;
    var curTagsInput = null;
    var treeControl = null;
    var selectizeControl = null;

    var buildTreeDialog = function() {
        // 生成选择对话框
        if (treeDialog) {
            treeDialog.remove();
        }
        var id = makeRandomId();
        var treeDialogHTML =
            '<div id="' + id + '" class="modal fade" tabindex="-1">' +
                '<div class="modal-dialog">' +
                    '<div class="modal-content">' +
                        '<div class="modal-header">' +
                            '<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>' +
                            '<h4 class="modal-title">请选择...</h4>' +
                        '</div>' +
                        '<div class="modal-body">' +
                            '<div class="treeSearch"><select placeholder="搜索"></select></div>' +
                            '<div class="tree_div"></div>' +
                        '</div>' +
                    '</div>' +
                '</div>' +
            '</div>';
        treeDialog = $(treeDialogHTML).appendTo('body');

        // 生成树
        var tree = treeDialog.find('.tree_div');
        tree.jstree({
            core : {
                check_callback: true,
                themes: {stripes: true},
                data: {
                    url: settings.getChildrenUrl,
                    dataType: 'json',
                    data: function (node) {
                        return {parent_id: node.id};
                    }
                }
            }
        }).on('select_node.jstree', function(e, data){
            // 绑定树节点点击事件
            addTag(data.node.id, data.node.text, data.node.parents);
        });
        treeControl = tree.jstree(true);

        // 生成搜索框
        var treeSearchSelect = treeDialog.find('select');
        treeSearchSelect.selectize({
            valueField: 'id',
            labelField: 'text',
            searchField: 'text',
            sortField: 'text',
            options: [],
            create: false,
            onItemAdd: function (value, $item) {
                // 绑定搜索下拉框点击事件
                addTag(value, $item.text());
                selectizeControl.clear();
            }
        });
        selectizeControl = treeSearchSelect[0].selectize;

        // 搜索框初始化
        var searchDataLoaded = false;
        treeSearchSelect.next().children().first().click(function () {
            var control = treeSearchSelect[0].selectize;
            if (!searchDataLoaded) {
                searchDataLoaded = true;
                treeDialog.find('input').prop({placeholder: '请稍候...'});
                commonAjax(settings.getAllPointsUrl, null, function (data) {
                    for (var i in data) {
                        control.addOption({id: data[i][0], text: data[i][1]});
                    }
                    treeDialog.find('input').prop({placeholder: '搜索'});
                });
            }
        });
    };

    var openTreeDialog = function() {
        // 打开选择对话框
        curTagsInput = $(this).parent().prev();
        if (!treeDialog) {
            buildTreeDialog();
        }
        treeDialog.modal('show');
    };

    var addTag = function(point_id, point_name, parents) {
        // 给当前标签框加一个标签
        addTagTo(curTagsInput, point_id, point_name, parents);
    };

    var addTagTo = function(inputObj, point_id, point_name, parents){
        // 给指定标签框加一个标签
        if (!inputObj) {
            return;
        }

        var tag = {id: point_id, text: point_name};
        if (settings.beforeAddTag && ! settings.beforeAddTag(tag, parents, treeControl)) {
            // hook 函数，检查是否可以加这个标签
            return;
        }
        if (settings.maxTags == 1) {
            clearTagsOf(inputObj);
        }
        inputObj.tagsinput('add', tag);
        if (treeDialog) {
            treeDialog.modal('hide');
        }
        if (settings.afterAddTag) {
            // hook 函数，加标签后的操作
            settings.afterAddTag(tag, parents, treeControl);
        }
    };

    var getTags = function(){
        // 获取当前标签框的标签
        return getTagsOf(curTagsInput);
    };

    var getTagsOf = function(inputObj){
        // 获取指定标签框的标签
        return inputObj ? inputObj.tagsinput('items') : [];
    };

    var clearTags = function(){
        // 清除当前标签框
        clearTagsOf(curTagsInput);
    };

    var clearTagsOf = function(inputObj){
        // 清除指定标签框
        if (inputObj)
            inputObj.tagsinput('removeAll');
    };

    var bindInput = function(inputs){
        // 使一个input成为标签输入框并且点击打开选择对话框
        // 生成标签框
        inputs.tagsinput({
            trimValue: true,
            itemValue: 'id',
            itemText: 'text',
            maxTags: settings.maxTags
        });
        inputs.next().next('.bootstrap-tagsinput').remove();
        // 绑定标签框点击事件
        inputs.next().find('input').unbind('click').click(openTreeDialog);
    };

    var init = function(options){
        for (var k in options) {
            settings[k] = options[k];
        }
        bindInput(settings.inputs);
        curTagsInput = settings.inputs.first()
    };

    return {
        settings: settings,
        init: init,
        addTag: addTag,
        addTagTo: addTagTo,
        getTags: getTags,
        getTagsOf: getTagsOf,
        clearTags: clearTags,
        clearTagsOf: clearTagsOf,
        bindInput: bindInput
    };
})();

// 本模块是用户搜索<select>框
// 依赖selectize.js
var UserListFilterMod = (function(){
    var settings = {
        userInput: $('.userListFilter'),
        subjectId: 0
    };
    var dataCache = null;
    var curSubjectId = 0;

    var getSubjectId = function() {
        // 获取当前subjectId
        var subject = $('#subject_id');
        var schoolLevel = $('#school_level');
        if (subject.length && schoolLevel.length) {
            return parseInt(schoolLevel.val()) * 100 + parseInt(subject.val());
        } else if (subject.length) {
            return subject.val();
        } else if (settings.subjectId) {
            return settings.subjectId
        } else {
            return 0;
        }
    };

    var fillData = function(inputDiv, control){
        control.clearOptions();
        for (var i in dataCache) {
            control.addOption({id: dataCache[i][0], text: dataCache[i][1] + ' ' + dataCache[i][2]});
        }
    };

    var initData = function(inputDiv, control){
        // 搜索框数据初始化
        if (curSubjectId != getSubjectId()) {
            dataCache = null;
            curSubjectId = getSubjectId();
        }
        if (!dataCache) {
            commonAjax('/service/user-list', {subject_id: getSubjectId()}, function (data) {
                dataCache = data;
                fillData(inputDiv, control);
            });
        } else {
            fillData(inputDiv, control);
        }
    };
    var init = function(options){
        for (var k in options) {
            settings[k] = options[k];
        }

        // 生成用户搜索框
        settings.userInput.selectize({
            valueField: 'id',
            labelField: 'text',
            searchField: 'text',
            sortField: 'text',
            options: [],
            maxItems: 1,
            create: false
        });
        settings.userInput.each(function(){
            var inputDiv = $(this).next().children().first();
            var control = this.selectize;
            inputDiv.css({width: '180px'});
            inputDiv.parent().click(function(){
                initData(inputDiv, control);
            });
        });
    };
    return {
        settings: settings,
        init: init
    };
})();


$(function(){
    //全局加一监听，将tagsinput的内容显示在title上
    $(document.body).on('mouseover', '.bootstrap-tagsinput .tag', function(){
        var item = $(this);
        var text = item.text();
        item.attr('title', text);
    })
});
