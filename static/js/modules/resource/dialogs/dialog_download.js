define(["knockout", "tools", "TreeView", "jquery-fileupload"], function(ko, $tools, TreeView){
    return function(context){
        var self = this;

        //初始化上下文
        self.parent     = context.parent;
        self.data       = context.data;
        self.type       = context.type;
        self.message    = context.message;

        //取消发布表单
        self.discription = ko.observable('');

        self.submit = function(){
            $tools.ajax({
                url: '/platform-admin/operate',
                data: {
                    platform_resource_id : self.data._id,
                    note                 : self.discription(),
                    operated_precise_at  : self.data.operated_precise_at
                },
                success: function(returnData){
                    console.log(returnData);
                }
            });
        };

        //删除系统提示
        self.message = ko.observable(self.message);

        self.deleted = function(){
            $tools.ajax({
                url : "/platform-admin/delete",
                data: {
                    platform_resource_id: self.data._id,
                    operated_precise_at : self.data.operated_precise_at
                },
                success: function(returnData){
                    self.parent._resetButtons(self.data, returnData.personal_resource);
                    $tools.msgTip("删除成功", "success", "删除结果");
                }
            });
        };

        //资源上传表单
        self.files = ko.observableArray([]);
        //类型信息
        self.types      = ko.observableArray(ko.utils.arrayFilter(self.parent.data.types, function(type){
            if(type.resource_type[0] != -1){
                return type;
            }
        }));
        self.type       = ko.observable(self.types()[0].resource_type[0]);
        self.type_text  = ko.observable(self.types()[0].resource_type[1]);
        self.setType    = function (type, name){
            self.type(type);
            self.type_text(name);
        };
        //教材信息
        self.book       = ko.observable('');
        //地区信息
        self.region = ko.observable();
        //年份信息
        self.year = ko.observable();
         //等级信息
        self.levels         = ko.observableArray(self.types()[0].level_info);
        self.form_levels    = [];
        self.type.subscribe(function(newValue){
            self.form_levels = [];
            ko.utils.arrayForEach(self.types(), function(type){
                if(type.resource_type[0] == newValue){
                    self.levels(type.level_info);
                }
            });
        });
        //资源描述
        self.resource_discription = ko.observable('');
        //园丁豆信息
        self.gold_list  = ko.observableArray(self.parent.data.gold_list);
        self.gold_test  = [];
        self.gold       = ko.observable(self.gold_list()[0][0]);
        self.gold_text  = ko.observable(self.gold_list()[0][1]);
        self.setGold    = function (gold, text){
            self.gold(gold);
            self.gold_text(text);
        };
        //标签信息
        self.tags       = ko.observableArray(self.parent.data.tags);
        self.tag        = ko.observable(self.tags()[0][0]);
        self.tag_text   = ko.observable(self.tags()[0][1]);
        self.setTag     = function (tag, name){
            self.tag(tag);
            self.tag_text(name);
        }; 
        self.upload_files = function(){
            $tools.ajax({
                url : "/platform-admin/upload",
                data: {
                    subject_id       : self.parent.parent.subject(),
                    name             : "",
                    file_id          : ko.utils.arrayMap(self.files(), function(obj){ return obj.file_id;}),
                    url              : ko.utils.arrayMap(self.files(), function(obj){ return obj.url; }),
                    resource_type_id : self.type(),
                    book_id          : self.book(),
                    region_id        : self.region(),
                    year             : self.year(),
                    level            : self.form_levels,
                    description      : self.resource_discription(),
                    cost             : self.gold(),
                    tags             : self.tag()
                },
                success: function(returnData){
                    console.log(returnData);
                }
            });
        };

        $("body").on("subPageReady", function(){
            var url = "/platform-admin/upload_file";
            
            $("#fileupload").fileupload({
                url         : url,
                dataType    : 'json',
                maxChunkSize: null,
                formData    : {
                    subject_id : self.parent.parent.subject(),
                    upload     : "upload"
                },
                singleFileUploads: true,
                done: function (e, data){
                    self.files.push(data.result);

                    $('#progress .progress-bar').css('width', '0%');
                },
                progressall: function (e, data) {
                    var progress = parseInt(data.loaded / data.total * 100, 10);
                    $('#progress .progress-bar').css('width', progress + '%');
                }
            }).prop('disabled', !$.support.fileInput).parent().addClass($.support.fileInput ? undefined : 'disabled');

            //教材初始化
            new TreeView({
                target			: $('.bookDialog'),
                getChildrenUrl	: '/xx/book/get-tree-nodes',
                getAllUrl		: '/xx/book/get-all-nodes/',
                subject			: self.parent.parent.subject(),
                maxTags			: 1
            });

            //初始化知识点树插件
            new TreeView({
                target			: $('.regionDialog'),
                getChildrenUrl	: '/service/regions-tree',
                getAllUrl		: '/service/regions-all',
                subject			: self.parent.parent.subject(),
                maxTags			: 0
            });
        });

        //通用关闭窗口
        self.cancel = function(){
            $("#cancel").modal('hide');
        };

        //测试口
        dialog_download = self;
    };
});
