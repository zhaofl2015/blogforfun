define(["jquery", "jquery-jstree"], function($){
    function makeRandomId() {
        return Math.random().toString(36).replace('.', '');
    }

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

    return TreeView;
});