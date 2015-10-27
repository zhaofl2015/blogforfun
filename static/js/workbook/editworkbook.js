this.workbook = (function(model){
    var __editor__ = null,
        bookTree = null;

    var WorkEdit = function(){
        this._data = null;
        this.showType = ko.observable('add'); 
        this.title = ko.observable('');
        this.types = ko.observableArray([]);
        this.type = ko.observable('');
        this.series = ko.observableArray([]);
        this.serie = ko.observable("");
        this.alias = ko.observable("");
        this.press = ko.observable("");
        this.book_version = ko.observable("");
        this.book_time = ko.observable("");
    };

    WorkEdit.prototype.setType = function(newType){
        this.showType(newType);
    };

    WorkEdit.prototype.setData = function(data){
        this._data = data;

        this.title(data.workbook.title);
        this.types(data.workbook_types);
        this.type(data.workbook.workbook_type);
        this.series(data.all_series);
        this.serie(data.workbook.series.id);
        this.alias(data.workbook.alias);
        this.press(data.workbook.press);

        bookTree.clearTags();
        if(data.workbook.book_node.text){
            bookTree.addTag(data.workbook.book_node.id, data.workbook.book_node.text);
        }
        this.book_time(data.workbook.date);
        
        $("#addOrEdit").modal('toggle');
    };

    WorkEdit.prototype.submit = function(){
        var self = this;

        var data = {
            title           : this.title(),
            workbook_type   : this.type(),
            series_id       : this.serie(),
            alias           : this.alias(),
            press           : this.press(),
            book_node_id    : this.book_version(),
            date            : this.book_time()
        };

        if(this.showType() == 'add'){
            data.subject_id = model.subject;
        }else{
            data.workbook_id = this._data.workbook.id
        }

        $tools.ajax({
            url     : "/workbook/edit",
            data    : data,
            success : function(returnData){
                model.EventBus.publish("EVENT_WORKBOOK_RESEARCH");
                $("#addOrEdit").modal('toggle');
            }
        });
    };

    function getEditor(){
        if(__editor__ == null){
            __editor__ = new WorkEdit();
        }

        return __editor__;
    }

    /*
     *  加载WorkEdit对象
     *  @param info         Object 对象
     *      target              要绑定 ko 对象的锚点
     *      regionTarget        地区选择器绑定锚点
     *      treeDialogTarget    教材版本空间绑定锚点
     *  @return {WorkEdit}  WorkEdit 对象实例
     */
    model.loadEditor = function(info){
        var editor = getEditor();

        //初始化教材版本
        bookTree = new model.TreeView({
            target          : $(info.treeDialogTarget),
            subject         : model.subject,
            getChildrenUrl  : '/xx/book/get-tree-nodes',
            getAllUrl       : '/xx/book/get-all-nodes/' + model.subject,
            maxTags         : 1,
            beforeAddTag    : function(tag, parents, treeControl) {
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

        model.EventBus.subscribe('EVENT_WORKBOOK_ADD', function(data){
            editor.setType('add');
            editor.setData(data);
        });

        model.EventBus.subscribe('EVENT_WORKBOOK_EDIT', function(data){
            editor.setType('edit');
            editor.setData(data);
        });

        ko.applyBindings(editor, model.byId(info.target));

        return editor;
    };

    return model;
}(this.workbook || {}));
