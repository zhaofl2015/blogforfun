define(["knockout", "PaginationMod", "tools", "TreeView", "jquery-ui", "ko-mapping", "ko-datepicker"], function (ko, PaginationMod, $tools, TreeView) {
    return function (context) {
        var self = this;

        //初始化上下文
        self.parent = context.parent;
        self.data   = context.data;

        //资源ID
        self.resource_id = ko.observable('');

        //类型信息
        self.types      = ko.observableArray(self.data.types);
        self.type       = ko.observable(self.types()[0].resource_type[0]);
        self.type_text  = ko.observable(self.types()[0].resource_type[1]);
        self.setType    = function (type, name) {
            self.type(type);
            self.type_text(name);
        };

        //状态信息
        self.statuses       = ko.observableArray(self.data.status);
        self.status         = ko.observable(self.statuses()[0][0]);
        self.status_text    = ko.observable(self.statuses()[0][1]);
        self.setStatus      = function (status, name) {
            self.status(status);
            self.status_text(name);
        };

        //教材信息
        self.book       = ko.observable('');
        $("body").on("pageReady", function(){
            //初始化知识点树插件
            new TreeView({
                target			: $('.bookDialog'),
                getChildrenUrl	: '/xx/book/get-tree-nodes',
                getAllUrl		: '/xx/book/get-all-nodes/',
                subject			: self.parent.subject(),
                maxTags			: 1
            });
        });
        
        self.upload_id  = ko.observable();
        self.from_date  = ko.observable();
        self.to_date    = ko.observable();

        self.upload_list = ko.observableArray([]);

        self.searchSource = function (page) {
            $tools.ajax({
                url: "/platform-admin/personal-list",
                data: {
                    page                    : page,
                    platform_resource_id    : self.resource_id(),
                    subject_id              : self.parent.subject(),
                    status                  : self.status(),
                    resource_type_id        : self.type(),
                    book_id                 : self.book(),
                    creator_id              : self.upload_id(),
                    start_at                : self.from_date(),
                    end_at                  : self.to_date()
                },
                success: function (returnData) {
                    self.upload_list(ko.mapping.fromJS(returnData.items)());

                    PaginationMod.renderPagination(returnData.page, returnData.per_page, returnData.total, 'searchSource');
                }
            });
        };

        self.check = function(){
            //TODO: 需要实现查重
            console.log("check");
        };

        self.arrayToText = $tools.arrayToText;

        self.operation = function(){
            self.dialogs({
                name: "resource/dialogs/dialog_upload",
                data: {
                    parent : self,
                    data   : this
                },
                afterRender: function(){
                    $("#operation").modal('show');
                }
            });
        };

        //弹窗信息
        self.dialogs = ko.observable({
            name: "resource/dialogs/dialog_upload",
            data: {
                parent : self,
                data   : {}
            }
        });

        self.searchSource(1);
        self.parent.subject.subscribe(function(){
            self.searchSource(1);
        });

        self.parent.loading(false);

        searchSource = self.searchSource;

        //测试口
        upload = self;
    }
});
