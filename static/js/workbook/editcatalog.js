var workbook = (function(model){
    var bookTree = null,
        pointsTree = null;

    var CatalogEdit = function(){
        this._data = null;
        this.type = ko.observable('add');  //add or edit
        this.isContentTree = ko.observable(false);
        this.parent_id = ko.observable('#');
        this.title = ko.observable('');
        this.points = ko.observable('');
        this.pageNum = ko.observable('');
        this.explain = ko.observable('');
        this.version = ko.observable('');
    };

    CatalogEdit.prototype.setData = function(data){
        this._data = data;
        this.type(data.type);
        this.isContentTree(data.isContentTree);
        this.parent_id(data.parent_id);
        this.title(data.name);
        this.pageNum(data.page);
        this.explain(data.description);
        bookTree.clearTags();
        ko.utils.arrayForEach(data.book_nodes || [], function(book_node){
            bookTree.addTag(book_node.id, book_node.text);
        });
        pointsTree.clearTags();
        ko.utils.arrayForEach(data.knowledge_points, function(knowledge){
            pointsTree.addTag(knowledge.id, knowledge.name);
        });

        $("#newTree").modal('toggle');
    };

    CatalogEdit.prototype.submit = function(){
        var self = this;

        var data = {
            tree_type       : this.isContentTree() ? 1 : 0,
            name            : this.title(),
            page            : this.pageNum(),
            parent_id       : this.parent_id(),
            book_node_ids   : this.version(),
            description     : this.explain(),
            knowledge_points: this.points()
        };

        if(this.type() == 'add'){
            data.workbook_id = this._data.workbook_id;
        }else{
            data.workbook_catalog_id = this._data.id;
        }

        $tools.ajax({
            url     : '/workbook/catalog-edit',
            data    : data,
            success : function(returnData){
                $("#newTree").modal('toggle');
                if(self.type() == 'add'){
                    returnData.envelope = self._data.envelope;
                    model.EventBus.publish("EVENT_CATALOG_ADD_DONE", returnData);
                }else{
                    model.EventBus.publish("EVENT_CATALOG_DEIT_DONE", returnData);
                }                            
            }
        });
    };
    
    model.loadEditor = function(info){
        var catalogEdit = new CatalogEdit();

        model.EventBus.subscribe("EVENT_CATALOG_ADDTREE", function(data){
            catalogEdit.setData(data);
        });

        model.EventBus.subscribe("EVENT_CATALOG_EDITTREE", function(data){
            catalogEdit.setData(data);
        });

        //初始化教材版本
        bookTree = new model.TreeView({
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

        //初始化知识点
        pointsTree = new model.TreeView({
            target          : $(info.pointsTarget),
            subject         : model.subject,
            getChildrenUrl  : '/xx/knowledge/get-children',
            getAllUrl       : '/xx/knowledge/get-all-points/' + model.subject
        });

        ko.applyBindings(catalogEdit, model.byId(info.target));

        return catalogEdit;
    };
    
    return model;
}(this.workbook || {}));
