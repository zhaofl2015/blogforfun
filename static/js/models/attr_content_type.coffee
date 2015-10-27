class attr_content_type
    content_type_id         : ko.observable ''
    content_type_name       : ko.observable ''
    second_content_type_id  : ko.observable ''
    second_content_type_name: ko.observable ''
    third_content_type_id   : ko.observable ''
    third_content_type_name : ko.observable ''
    content_type_choices    : ko.observableArray []
    second_content_type_list: ko.observableArray []
    third_content_type_list : ko.observableArray []
    update_third_content_type_list: ->
        @third_content_type_list.removeAll()
        key = @second_content_type_id()
        @third_content_type_list.push [tc.id, tc.name] for tc in c.children for c in @content_type_choices() when c.id is key

@attr_content_type = attr_content_type