define(["knockout", "tools", "PaginationMod", "TreeView", "jquery-ui", "ko-mapping", "ko-datepicker"], function (ko, $tools, PaginationMod, TreeView){
    return function (context){
        var self = this;

        //初始化上下文
        self.parent = context.parent;
        self.data   = context.data;

        //上传权限
        self.could_upload = ko.observable(self.data.could_upload);

        //资源ID
        self.resource_id = ko.observable('');

        //类型信息
        self.types      = ko.observableArray(self.data.types);
        self.type       = ko.observable(self.types()[0].resource_type[0]);
        self.type_text  = ko.observable(self.types()[0].resource_type[1]);
        self.setType    = function (type, name){
            self.type(type);
            self.type_text(name);
        };

        //状态信息
        self.statuses       = ko.observableArray(self.data.status);
        self.status         = ko.observable(self.statuses()[0][0]);
        self.status_text    = ko.observable(self.statuses()[0][1]);
        self.setStatus      = function (status, name){
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

        //等级信息
        self.levels     = ko.observableArray(self.types()[0].level_info);
        self.level      = ko.observable(self.levels()[0][0]);
        self.level_text = ko.observable(self.levels()[0][1]);
        self.setLevel   = function (level, name){
            self.level(level);
            self.level_text(name);
        };
        self.type.subscribe(function(newValue){
            ko.utils.arrayForEach(self.types(), function(type){
                if(type.resource_type[0] == newValue){
                    self.levels(type.level_info);
                    self.level(type.level_info[0][0]);
                    self.level_text(type.level_info[0][1]);
                }
            });
        });



        //园丁豆信息
        self.gold_list  = ko.observableArray(self.data.gold_list);
        self.gold       = ko.observable(self.gold_list()[0][0]);
        self.gold_text  = ko.observable(self.gold_list()[0][1]);
        self.setGold    = function (gold, text){
            self.gold(gold);
            self.gold_text(text);
        };

        //标签信息
        self.tags       = ko.observableArray(self.data.tags);
        self.tag        = ko.observable(self.tags()[0][0]);
        self.tag_text   = ko.observable(self.tags()[0][1]);
        self.setTag     = function (tag, name){
            self.tag(tag);
            self.tag_text(name);
        };

        //年份信息
        self.years      = ko.observableArray(self.data.years);
        self.year       = ko.observable(self.years()[0][0]);
        self.year_text  = ko.observable(self.years()[0][1]);
        self.setYear    = function (year, name){
            self.year(year);
            self.year_text(name);
        };


        self.from_date  = ko.observable();
        self.to_date    = ko.observable();

        self.download_list = ko.observableArray([]);

        self.arrayToText = $tools.arrayToText;

        self.searchSource = function (page){
            $tools.ajax({
                url    : "/platform-admin/public-list",
                data   : {
                    page                : page,
                    platform_resource_id: self.resource_id(),
                    subject_id          : self.parent.subject(),
                    status              : self.status(),
                    resource_type_id    : self.type(),
                    book_id             : self.book(),
                    level               : self.level(),
                    cost                : self.gold(),
                    tags                : self.tag(),
                    year                : self.year(),
                    start_at            : self.from_date(),
                    end_at              : self.to_date()
                },
                success: function (returnData){
                    self.download_list(ko.mapping.fromJS(returnData.items)());

                    PaginationMod.renderPagination(returnData.page, returnData.per_page, returnData.total, 'searchSource');                    
                }
            });
        };

        self._resetButtons = function(_old, _new){
            _old.could_publish(_new.could_publish);
            _old.could_cancel(_new.could_cancel);
            _old.could_edit(_new.could_edit);
            _old.could_download(_new.could_download);
            _old.could_delete(_new.could_delete);
        };

        self.publish = function(){
            var target = this;
            $tools.ajax({
                url : "/platform-admin/publish",
                data: {
                    platform_resource_id: this._id(),
                    operated_precise_at : this.operated_precise_at()
                },
                success: function(returnData){
                    $tools.msgTip("发布成功", "success", "发布结果");
                    target.status(returnData.personal_resource.status);
                    target.status_text(returnData.personal_resource.status_text);
                    self._resetButtons(target, returnData.personal_resource);                    
                }
            });
        };

        self.cancel = function(){
            self.dialogs({
                name: "resource/dialogs/dialog_download",
                data: {
                    parent : self,
                    data   : this
                },
                afterRender: function(){
                    $("#cancel").modal('hide');
                }
            });
        };

        self.edit = function(type){
            self.dialogs({
                name: "resource/dialogs/dialog_download",
                data: {
                    parent : self,
                    data   : this,
                    type   : type
                },
                afterRender: function(){
                    $("body").trigger("subPageReady");
                    $("#editor").modal('show');
                    $('.dialog_download_multiple').multiselect({
                        buttonText: function(options, select) {
                            if (options.length == 0) {
                                return '请选择...';
                            }else if (options.length > 3) {
                                return '已选择 ' + options.length + ' 项';
                            }else {
                                var selected = '';
                                options.each(function() {
                                    selected += $(this).text() + ', ';
                                });
                                return selected.substr(0, selected.length -2);
                            }
                        }
                    });
                }
            });
        };

        self.delete = function(){
            self.dialogs({
                name: "resource/dialogs/dialog_download",
                data: {
                    parent : self,
                    data   : this,
                    message: "是否要删除?"
                },
                afterRender: function(){
                    $("#confirm").modal('show');
                }
            });
        };

        //弹窗信息
        self.dialogs = ko.observable({
            name: "resource/dialogs/dialog_download",
            data: {
                parent : self,
                data   : {}
            }
        });

        self.searchSource(1);

        self.parent.loading(false);

        searchSource = self.searchSource;

        //测试kou
        download = self;
    }
});
