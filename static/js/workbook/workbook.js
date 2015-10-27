this.workbook = (function(model){

    function guid(){
        function s4(){
            return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
        }

        return function(){
            return s4() + s4() + "-" + s4() + "-" + s4() + "-" + s4() + "-" + s4() + s4() + s4();
        };
    }

    model.subject = null;

    model.EventBus = postal.channel(guid());

    model.byId = function(id){
        return document.getElementById(id);
    };

    return model;
}(this.workbook || {}));
