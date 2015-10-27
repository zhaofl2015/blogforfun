this.workbook = (function(model){
    function Search(){
        this.book_id                = ko.observable('');
        this.book_name              = ko.observable('');
        this.book_type_list         = [1, 2];
        this.book_type              = ko.observable('');
        this.book_alias             = ko.observable('');
        this.book_press             = ko.observable('');
        this.book_node_id           = ko.observable('');
        this.book_time              = ko.observable('');
        this.status                 = ko.observableArray(model.status);
        this.statusValue            = ko.observable(-1);
        this.ol_status              = ko.observableArray(model.ol_status);
        this.ol_statusValue         = ko.observable(-1);
        this.creator_user_id        = ko.observable('');
    };

    Search.prototype.workbook_search = function(){
        model.EventBus.publish("EVENT_WORKBOOK_SEARCH", {
            book_id         : this.book_id(),
            book_name       : this.book_name(),
            book_type       : this.book_type(),
            book_alias      : this.book_alias(),
            book_press      : this.book_press(),
            book_node_id    : this.book_node_id(),
            book_time       : this.book_time(),
            statusValue     : this.statusValue(),
            ol_statusValue  : this.ol_statusValue(),
            user_info       : this.creator_user_id(),
            page            : 1
        });
    };

    Search.prototype.add_workbook = function(){
        $tools.ajax({
            url     : '/workbook/edit',
            type    : 'GET',
            data    : {
                subject_id: model.subject
            },
            success : function(returnData){
                console.log(returnData);
                model.EventBus.publish('EVENT_WORKBOOK_ADD', returnData);
            }
        });
    };
    
    /**
     * 加载Search模块
     * @param info              Object 对象
     *      target                  要绑定 ko 对象的锚点
     *      treeDialogTarget        教材版本选择器锚点
     *      userListFilterTarget    录入员过滤器锚点
     * @returns {Search}        Search 对象实例
     */
    model.loadSearch = function(info){
        //初始化教材版本
        new model.TreeView({
            target          : $(info.treeDialogTarget),
            subject         : model.subject,
            getChildrenUrl  : '/xx/book/get-tree-nodes',
            getAllUrl       : '/xx/book/get-all-nodes/' + model.subject,
            maxTags         : 1,
            beforeAddTag    : function(tag, parents, treeControl){
                // 点击树之后，把父节点的名称也加进来
                if (parents) {
                    if (treeControl) {
                        var names = [];
                        for (var i = parents.length - 3; i >= 0; i--) {
                            var parent = treeControl.get_node(parents[i]);
                            names.push(parent.text);
                        }
                        names.push(tag.text);
                        tag.text = names.join(' - ');
                    }
                    return parents.length >= 2;
                } else {
                    return true;
                }
            }
        });

        //人员选择器初始化
        model.UserListFilterMod.init({
            userInput   : $(info.userListFilterTarget),
            subjectId   : model.subject
        });

        var search = new Search();

        model.EventBus.subscribe("EVENT_WORKBOOK_RESEARCH", function(){
            model.EventBus.publish("EVENT_WORKBOOK_SEARCH", {
                book_id         : search.book_id(),
                book_name       : search.book_name(),
                book_type       : search.book_type(),
                book_alias      : search.book_alias(),
                book_press      : search.book_press(),
                book_node_id    : search.book_node_id(),
                book_time       : search.book_time(),
                statusValue     : search.statusValue(),
                ol_statusValue  : search.ol_statusValue(),
                user_info       : search.creator_user_id()
            });
        });

        ko.applyBindings(search, model.byId(info.target));

        return search;
    };

    return model;
}(this.workbook || {}));
