define(["knockout", "sammy"], function (ko, Sammy){
    return function (context){
        var self = this;

        //初始化上下文
        self.parent = context.parent;
        self.data   = context.data;

        //控制导航栏学科
        self.subjects   = ko.observableArray(self.data.subjects);
        self.subject    = ko.observable(self.data.subject);
        self.setSubject = function (id){
            self.subject(id);
        };

        //Tab控制器
        self.menus = ko.observableArray([
            {id: "upload", title: "老师上传的资源", route: "#/resource/upload"},
            {id: "download", title: "供老师下载的资源", route: "#/resource/download"},
            {id: "statistics", title: "数据汇总", route: "#/resource/statistics"}
        ]);
        self.focusmenu = ko.observable(self.menus()[0].id);

        //系统加载相关控制
        self.loading    = ko.observable(false);
        self.palette    = ko.observable({});
        self.loadError  = ko.observableArray(false);
        self.loadError.subscribe(function (error){
            if (error) {
                self.palette({name: "resource/error", data: {app: self}});
            }
        });
        self.updateError = ko.observable(false);
        self.updateError.subscribe(function (error){
            if (error) {
                alert(error);

                self.updateError(false);
            }
        });

        Sammy(function (){
            this.templateCache = function (){
            };

            this.get(/\#\/([^/]+)\/([^/]+)/, function (){
                var area    = this.params.splat[0];
                var module  = this.params.splat[1];

                self.focusmenu(module);

                self.palette({
                    name: area + "/" + module, data: { parent: self, data: self.data }, afterRender: function (){
                        $("body").trigger("pageReady");
                    }
                });
                self.loading(true);
            });

            this.get("#/hehe/haha", function(){
                
            });

            this.get('/platform-admin', function (){
                this.app.runRoute('get', '#/resource/upload');
            });
        });

        Sammy().run();

        //测试口
        app = self;
    }
});
