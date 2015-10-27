ko.bindingHandlers.editorinput = {
    init  : function(element, valueAccessor) {
        $(element).on('blur keyup', function() {
            var value = valueAccessor();
            value($(this).html());
        });

        $("body").on("afterInsertImage_tk", function(){
            var value = valueAccessor();
            value($(element).html());
        });

        ko.selectExtensions.writeValue(element, ko.utils.unwrapObservable(valueAccessor()));
    }
};