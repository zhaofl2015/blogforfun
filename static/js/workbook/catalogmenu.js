var workbook = (function(model){

    var CataMenu = function(){
        this.isContentTree = ko.observable(false);
        this.workbook_catalog_id = ko.observable("");
        this.could_add_content = ko.observable(false);
        this.could_add_type_0_child = ko.observable(false);
        this.could_add_type_1_child = ko.observable(false);
        this.could_delete = ko.observable(false);
        this.could_delete_content = ko.observable(false);
        this.could_edit = ko.observable(false);
        this.could_manage_content = ko.observable(false);
    };

    CataMenu.prototype.delete_content = function(){
        if(!window.confirm('确定删除吗？'))return;
        $tools.ajax({
            url: '/workbook/content-delete',
            data: {
                workbook_catalog_id: this.workbook_catalog_id()
            },
            success: function(returnData){
                console.info(returnData);
            }
        });
    };

    CataMenu.prototype.edit_content = function(){
        model.EventBus.publish("EVENT_CATAMENU_EDIT_CONTENT");
    };

    CataMenu.prototype.edit_catalog = function(){
        model.EventBus.publish("EVENT_CATAMENU_EDIT_CATALOG");
    };

    CataMenu.prototype.add_catalog = function(){
        model.EventBus.publish("EVENT_CATAMENU_ADD_CATALOG");
    };

    CataMenu.prototype.delete_catalog = function(){
        if(!window.confirm('确定删除吗？'))return;

        model.EventBus.publish("EVENT_CATAMENU_DEL_CATALOG");
    };

    model.loadCatalogMenu = function(info){
        var catamenu = new CataMenu();

        model.EventBus.subscribe("EVENT_CATAMENU_RESET", function(zTree){
            var data = zTree.getSelectedNodes()[0];
            catamenu.isContentTree(zTree.isContentTree);
            catamenu.workbook_catalog_id(data.id);
            catamenu.could_add_content(data.could_add_content);
            catamenu.could_add_type_0_child(data.could_add_type_0_child);
            catamenu.could_add_type_1_child(data.could_add_type_1_child);
            catamenu.could_delete(data.could_delete);
            catamenu.could_delete_content(data.could_delete_content);
            catamenu.could_edit(data.could_edit);
            catamenu.could_manage_content(data.could_manage_content);
        });

        ko.applyBindings(catamenu, model.byId(info.target));

        return catamenu;
    };
    
    return model;
}(this.workbook || {}));
