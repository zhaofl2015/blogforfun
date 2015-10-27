class Answer
    constructor: (obj)->
        @id = ko.observable if obj? and obj.id? then obj.id else ''
        @content = ko.observable if obj? and obj.content? then obj.content else ''
        @score = ko.observable if obj? and obj.score? then obj.score else 1
        @tips = ko.observableArray if obj? and obj.tips? then obj.tips else []
        @points = ko.observableArray if obj? and obj.points? then obj.points else []

        @classify_name = ko.observable if obj? and obj.classify_name? then obj.classify_name else ''

        @editor_type = ko.observable if obj? and obj.editor_type? then obj.editor_type else 0

        @_editor_code = $tools.guid "option_xxxxxxxxxxxxxxxxxxxxxxxxxx"

        @_search_point_id = ko.observable ''
        @_search_point_content = ko.observable ''
        @_search_point_type = ko.observable no

        that = @
        @editor_type.subscribe (newValue)->
            UE.getEditor(that._editor_code).setContent that.content() if newValue is 1
            return

        @content.subscribe (newValue)->
            that.content $tools.replaceAll newValue, "data-bind", ""
            return

    add_option_point: (obj, event)->
        input = $(event.target).closest('.form-group').find('.treeDialog')
        point = TreeDialogMod.getTagsOf(input)[0];
        if point?
            TreeDialogMod.clearTags()

            @_search_point_id point.id
            @_search_point_content point.text

            is_in_array = false
            is_in_array = true for p in @points() when p.id()+'' == point.id+''

            if not is_in_array
                @points.push new Point
                    id        : @_search_point_id()
                    content   : @_search_point_content()
                    isKeyPoint: @_search_point_type()

            @_search_point_id ''
            @_search_point_content ''
            @_search_point_type no

        return

@Answer = Answer