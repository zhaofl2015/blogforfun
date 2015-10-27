define(["knockout", "ko-mapping"], function(ko){
    return function(context){
        var self = this;

        self.parent = context.parent;
        self.data   = context.data;

        self.user_name          = ko.observable(self.data.user_info.real_name);
        self.avatar_img         = ko.observable(self.data.user_info.avatar_url);
        self.integral           = ko.observable(self.data.integral);
        self.uploaded_count     = ko.observable(self.data.uploaded_count);
        self.downloaded_count   = ko.observable(self.data.downloaded_count);
    };
});