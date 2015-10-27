this.workbook = (function(model){
    var _data = null;

    function WorkbookList(){
        this.instance = ko.observable('list');
        this.page = ko.observable(1);
        this.datalist = ko.observableArray([]);
    }

    WorkbookList.prototype.add_cover = function(){
        var self = this;

        $('#' + this.id()).fileupload({
            url                 : "/xx/files/upload",
            dataType            : 'json',
            maxChunkSize        : null,
            formData            : {
                upload: "upload"
            },
            singleFileUploads   : true,
            done                : function (e, data) {
                $tools.ajax({
                    url : '/workbook/cover-set',
                    data: {
                        workbook_id : self.id(),
                        url         : data.result.url
                    },
                    success: function(){
                        self.cover.ori_url(data.result.url)
                    }
                });
            }
        });
        
        return true;
    };

    WorkbookList.prototype.edit_workbook = function(){
        $tools.ajax({
            url     : '/workbook/edit',
            type    : 'GET',
            data    : {
                workbook_id: this.id()
            },
            success : function(returnData){
                model.EventBus.publish('EVENT_WORKBOOK_EDIT', returnData);
            }
        });
    };

    WorkbookList.prototype.lock_action = function(){
        $tools.ajax({
            url     :'/workbook/set-lock',
            data    :{
                workbook_id: this.id()
            },
            success : function(returnData){
                model.EventBus.publish("EVENT_WORKBOOK_RESEARCH");
            }
        }); 
    };

    WorkbookList.prototype.unlock_action = function(){
        var conf = window.confirm('确定取消发布吗？');
        if(!conf){return;}
        $tools.ajax({
            url     : '/workbook/set-unlock',
            data    : {
                workbook_id: this.id()
            },
            success : function(returnData){
                model.EventBus.publish("EVENT_WORKBOOK_RESEARCH");
            }
        });
    };

    WorkbookList.prototype.online_action = function(){
        $tools.ajax({
            url     : '/online/online-offline',
            data    : {
                doc_id: this.id(),
                online: 1
            },
            success : function(returnData){
                model.EventBus.publish("EVENT_WORKBOOK_RESEARCH");
            }
        });
    };

    WorkbookList.prototype.offline_action = function(){
        var conf = window.confirm('确定下线吗？');
        if(!conf){return;}
        $tools.ajax({
            url     : '/online/online-offline',
            data    : {
                doc_id: this.id(),
                online: 0
            },
            success : function(returnData){
                model.EventBus.publish("EVENT_WORKBOOK_RESEARCH");
            }
        });
    };

    WorkbookList.prototype.delete_action = function(){
        var conf = window.confirm('确定删除吗？');
        if(!conf){return;}
        $tools.ajax({
            url: '/workbook/delete',
            data: {
                workbook_id: this.id()
            },
            success: function(returnData){
                model.EventBus.publish("EVENT_WORKBOOK_RESEARCH");
            }
        }); 
    };

    WorkbookList.prototype.onlinecheck_action = function(){
        $.ajax({
            url: '/service/validate',
            type: 'GET',
            data: {doc_id: this.id()},
            success: function(data){
                var msg = data.info||data.error;
                if(data.success){
                    $tools.msgTip(msg, 'success');    
                }
                else{
                    $.popbox({
                        title: '错误信息',
                        content: msg
                    });
                }
            }
        });
    }

    WorkbookList.prototype.search = function(page){
        var self = this;

        $tools.ajax({
            url     : "/workbook/index",
            data    : {
                subject_id      : model.subject,
                workbook_id     : _data.book_id,
                title           : _data.book_name,
                workbook_type   : _data.book_type,
                alias           : _data.book_alias,
                press           : _data.book_press,
                book_node_id    : _data.book_node_id,
                date_str        : _data.book_time,
                creator_id      : _data.user_info,
                status          : _data.statusValue,
                ol_status       : _data.ol_statusValue,
                region_node_id  : _data.book_region,
                page            : page || _data.page
            },
            success : function(returnData){
                console.log(returnData);
                self.page(returnData.page);
                model.PaginationMod.renderPagination(returnData.page, returnData.per_page , returnData.total, self.instance() + '.search');
                self.formatList( returnData.items );
            }
        });
    };

    WorkbookList.prototype.formatList = function(datalist){
        this.datalist( ko.mapping.fromJS(datalist)() );
    };

    /*
     *  加载WorkbookList对象
     *  @param info         Object 对象
     *      target              要绑定 ko 对象的锚点
     *      instance            创建的实例
     *  @return {WorkbookList}  WorkbookList 对象实例
     */
    model.loadList = function(info){
        var workbookList = new WorkbookList();

        workbookList.instance(info.instance);

        model.EventBus.subscribe('EVENT_WORKBOOK_SEARCH', function(info){
            _data = info;
            workbookList.search();
        });

        ko.applyBindings(workbookList, model.byId(info.target));

        return workbookList;
    };

    return model;
}(this.workbook || {}));
