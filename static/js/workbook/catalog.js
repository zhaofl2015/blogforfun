var workbook = (function(model){
    var catalog_data = null,
        zTree = null,
        rMenu = null;

    function OnClick(event, treeId, treeNode){
        if(treeNode){
            $("#linshi_id").text(treeNode.id);
        }
    }

    function OnRightClick(event, treeId, treeNode){
        if(!treeNode && event.target.targetName.toLowerCase() != 'button' && $(event.target).parents('a').length == zTree.cancelSelectedNode()){
            showRMenu('root', event.clientX, event.clientY);
        }else if(treeNode && !treeNode.noR){
            $("#linshi_id").text(treeNode.id);
            zTree.selectNode(treeNode);
            showRMenu('node', event.clientX, event.clientY);
        }
    }

    function showRMenu(type, x, y) {
        zTree.isContentTree = catalog_data != null;
        model.EventBus.publish("EVENT_CATAMENU_RESET", zTree);

        $("#rMenu ul").show();
        if (type=="root") {
            $("#m_del").hide();
            $("#m_check").hide();
            $("#m_unCheck").hide();
        } else {
            $("#m_del").show();
            $("#m_check").show();
            $("#m_unCheck").show();
        }
        rMenu.css({"top":y+"px", "left":x+"px", "visibility":"visible"});
        $("body").bind("mousedown", onBodyMouseDown);
    }

    function hideRMenu() {
        if (rMenu) rMenu.css({"visibility": "hidden"});
        $("body").unbind("mousedown", onBodyMouseDown);
    }

    function onBodyMouseDown(event){
        if (!(event.target.id == "rMenu" || $(event.target).parents("#rMenu").length>0)) {
            rMenu.css({"visibility" : "hidden"});
        }
    }

    function addTreeNode(data) {
        hideRMenu();
        var newNode = { 
            id                          : data.catalog.id,
            name                        : data.catalog.name,
            parent_workbook_catalog_id  : data.catalog.parent_id,
            could_add_content           : data.catalog.could_add_content,
            could_add_type_0_child      : data.catalog.could_add_type_0_child,
            could_add_type_1_child      : data.catalog.could_add_type_1_child,
            could_delete                : data.catalog.could_delete,
            could_delete_content        : data.catalog.could_delete_content,
            could_edit                  : data.catalog.could_edit,
            could_manage_content        : data.catalog.could_manage_content
        };

        if(data.catalog.page.length > 0){
            newNode.name += '&nbsp;&nbsp;&nbsp;(' + data.catalog.page + ')页';
        }
        if(data.catalog.book_nodes.length > 0){
            newNode.name += "&nbsp;&nbsp;&nbsp;<span class='label label-info'>&nbsp;&nbsp;" + data.catalog.book_nodes[0].text + "&nbsp;&nbsp;</span>";
        }
         
        if (data.envelope == 'addnode' && zTree.getSelectedNodes()[0]) {
            newNode.checked = zTree.getSelectedNodes()[0].checked;
            zTree.addNodes(zTree.getSelectedNodes()[0], newNode);
        } else {
            zTree.addNodes(null, newNode);
        }
    }

    function editTreeNode(data){
        var node = zTree.getSelectedNodes()[0];
        if(node){
            node.name = data.catalog.name;

            if(data.catalog.page.length > 0){
                node.name += '&nbsp;&nbsp;&nbsp;(' + data.catalog.page + ')页';
            }
            if(data.catalog.book_nodes.length > 0){
                node.name += "&nbsp;&nbsp;&nbsp;<span class='label label-info'>&nbsp;&nbsp;" + data.catalog.book_nodes[0].text + "&nbsp;&nbsp;</span>";
            }

            zTree.updateNode(node);
        }
    }

    function removeTreeNode() {
        hideRMenu();
        var nodes = zTree.getSelectedNodes();
        if (nodes && nodes.length>0) {
            if (nodes[0].children && nodes[0].children.length > 0) {
                var msg = "If you delete this node will be deleted along with sub-nodes. \n\nPlease confirm!";
                if (confirm(msg)==true){
                    zTree.removeNode(nodes[0]);
                }
            } else {
                zTree.removeNode(nodes[0]);
            }
        }
    }

    function checkTreeNode(checked) {
        var nodes = zTree.getSelectedNodes();
        if (nodes && nodes.length>0) {
            zTree.checkNode(nodes[0], checked, true);
        }
        hideRMenu();
    }
    
    function resetTree() {
        hideRMenu();
        $.fn.zTree.init($("#treeDemo"), setting, zNodes);
    }

    function formatTreeData(data){
        ko.utils.arrayForEach(data, function(d){
            d.parent_workbook_catalog_id = d.id;
            d.isParent = !d.is_type_leaf;
            if(d.page.length > 0){
                d.name += '&nbsp;&nbsp;&nbsp;(' + d.page + ')页';
            }
            if(d.book_nodes.length > 0){
                d.name += "&nbsp;&nbsp;&nbsp;<span class='label label-info'>&nbsp;&nbsp;" + d.book_nodes[0].text + "&nbsp;&nbsp;</span>";
            }
        });
        return data;
    }

    var Catalog = function(){
        this._data = null;
        this._tree = null;
        this.title = ko.observable('');
        this.treeData = ko.observableArray([]);
    };

    Catalog.prototype.addCatalog = function(){
        var self = this;

        $tools.ajax({
            url: '/workbook/catalog-edit',
            type: 'GET',
            data: {
                workbook_id : self._data.workbook.id,
                parent_id   : catalog_data ? catalog_data.parent_id : '#'
            },
            success: function(returnData){
                returnData.catalog.type = 'add';
                returnData.catalog.isContentTree = catalog_data != null;
                if(catalog_data != null){
                    returnData.catalog.parent_id = catalog_data.id;
                }
                returnData.catalog.envelope = 'addroot';
                model.EventBus.publish("EVENT_CATALOG_ADDTREE", returnData.catalog);
            }
        });
    };

    Catalog.prototype.formatData = function(info){
        this._data = info;

        this.title(info.workbook.title);

        //临时放在这里的代码
        var setting = {
            view: {
                selectedMulti   : false,
                nameIsHTML      : true
            },
            data: {
                simpleData: {
                    enable  : true,
                    idKey   : 'id',
                    pIdKey  : 'pId'
                }
            },
            async: {
                url         : '/workbook/catalog-tree',
                enable      : true,
                type        : 'get',
                dataType    : 'json',
                autoParam   : ['parent_workbook_catalog_id'],
                dataFilter  : function(treeId, parentNode, responseData){
                    return formatTreeData( responseData.catalogs )
                }
            },
            callback: {
                onClick     : OnClick,
                onRightClick: OnRightClick
            }
        };

        zTree = $.fn.zTree.init($(info.treeTarget), setting, formatTreeData( info.treeData ));
        this._tree = zTree;
        rMenu = $('#rMenu');
    };

    /*
     *  加载Catalog对象
     *  @param info         Object 对象
     *      target              要绑定 ko 对象的锚点
     *      workbook            教辅基础数据
     *      catalog             树基础数据
     *      treeTarget          种树的锚点
     *  @return {Catalog}   Catalog 对象实例
     */
    model.loadCatalog = function(info){
        catalog_data = info.catalogData;

        console.log(catalog_data);

        var catalog = new Catalog();

        var sendata = {};
        if(catalog_data){
            sendata.parent_workbook_catalog_id = catalog_data.id
        }else{
            sendata.workbook_id = info.workbook.id
        }

        $tools.ajax({
            url     : '/workbook/catalog-tree',
            type    : 'GET',
            data    : sendata,
            success : function(returnData){
                info.treeData = returnData.catalogs;
                catalog.formatData(info);
            }
        });

        //右键添加节点
        model.EventBus.subscribe("EVENT_CATAMENU_ADD_CATALOG", function(){
            var nodes = catalog._tree.getSelectedNodes()[0];

            console.dir(catalog);

            $tools.ajax({
                url     : '/workbook/catalog-edit',
                type    : 'GET',
                data    : {
                    workbook_id : catalog._data.workbook.id,
                    parent_id   : nodes.id,
                    tree_type   : catalog._tree.isContentTree ? 1 : 0
                },
                success : function(returnData){
                    returnData.catalog.type = 'add';
                    returnData.catalog.isContentTree = catalog_data != null;
                    returnData.catalog.envelope = 'addnode';
                    model.EventBus.publish("EVENT_CATALOG_ADDTREE", returnData.catalog);
                }
            });
        });

        //右键删除节点
        model.EventBus.subscribe("EVENT_CATAMENU_DEL_CATALOG", function(){
            var nodes = catalog._tree.getSelectedNodes()[0];

            $tools.ajax({
                url : '/workbook/catalog-delete',
                data: {
                    workbook_catalog_id: nodes.id
                },
                success: function(returnData){
                    removeTreeNode();
                }
            });
        });

        model.EventBus.subscribe("EVENT_CATALOG_ADD_DONE", function(data){
            addTreeNode(data);
        });

        model.EventBus.subscribe("EVENT_CATALOG_DEIT_DONE", function(data){
            editTreeNode(data);
        });

        model.EventBus.subscribe("EVENT_CATAMENU_EDIT_CATALOG", function(){
            var nodes = catalog._tree.getSelectedNodes()[0];

            $tools.ajax({
                url     : '/workbook/catalog-edit',
                type    : 'get',
                data    : {
                    workbook_catalog_id: nodes.id
                },
                success : function(returnData){
                    returnData.catalog.type = 'edit';
                    returnData.catalog.isContentTree = catalog_data != null;
                    model.EventBus.publish("EVENT_CATALOG_EDITTREE", returnData.catalog);
                }
            });
        });
        
        ko.applyBindings(catalog, model.byId(info.target));

        return catalog;
    };

    return model;
}(this.workbook || {}));
