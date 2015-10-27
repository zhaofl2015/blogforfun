define(["knockout", "tools"], function(ko, $tools){
    return function(context){
        var self = this;

        //初始化上下文
        self.parent = context.parent;
        self.data = context.data;

        //类型信息
        self.types      = ko.observableArray(ko.utils.arrayFilter(self.parent.data.types, function(type){
            if(type.resource_type[0] != -1){
                return type;
            }
        }));
        self.type       = ko.observable(self.types()[0].resource_type[0]);
        self.type_text  = ko.observable(self.types()[0].resource_type[1]);
        self.setType = function (type, name) {
            self.type(type);
            self.type_text(name);
        };

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


        //反馈信息
        self.feedbacks      = ko.observableArray(self.parent.data.feedbacks);
        self.feedback       = ko.observable(self.feedbacks()[0]);
        self.feedback_text  = ko.observable(self.feedback() == '其他' ? '' : self.feedback());
        self.setFeedback    = function (feedback) {
            self.feedback(feedback);
        };
        self.feedback_disable = ko.observable(true);
        self.feedback.subscribe(function(newValue){
            if(newValue == '其他'){
                self.feedback_text('');
                self.feedback_disable(false);
            }else{
                self.feedback_text(newValue);
                self.feedback_disable(true);
            }
        });

        //提交表单
        self.submit = function(){
            $tools.ajax({
                url: '/platform-admin/operate',
                data: {
                    platform_resource_id : self.data._id,
                    level                : self.form_levels,
                    resource_type_id     : self.type(),
                    feedback             : self.feedback_text(),
                    operated_precise_at  : self.data.operated_precise_at
                },
                success: function(returnData){
                    console.log(returnData);
                }
            });
        };

        //测试口
        dialog_upload = self;
    };
});
