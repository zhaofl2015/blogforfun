class attr_point
    points: ko.observableArray []

    _search_point_id     : ko.observable ''
    _search_point_content: ko.observable ''
    _search_point_type   : ko.observable no

    add_point: (obj, event)->
        input = $(event.target).closest('.form-group').find('.treeDialog')
        point = TreeDialogMod.getTagsOf(input)[0];

        if point?
            @_search_point_id point.id
            @_search_point_content point.text

            is_in_array = false
            is_in_array = true for p in @points() when p.id() == point.id
            if not is_in_array
                @points.push new Point
                    id        : @_search_point_id()
                    content   : @_search_point_content()
                    isKeyPoint: @_search_point_type()

            @_search_point_id ''
            @_search_point_content ''
            @_search_point_type no

            TreeDialogMod.clearTags()

        return

    add_option_opint: ->
        return

@attr_point = attr_point