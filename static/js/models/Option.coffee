class Option
    constructor: (obj)->
        @id = ko.observable if obj? and obj.id? then obj.id else ''
        @content = ko.observable if obj? and obj.content? then obj.content else ''
        @score = ko.observable if obj? and obj.score? then obj.score else 1
        @tips = ko.observableArray if obj? and obj.tips? then obj.tips else []
        @points = ko.observableArray if obj? and obj.points? then obj.points else []
        @position_col = ko.observable if obj? and obj.position_col? then obj.position_col else ''
        @position_index = ko.observable if obj? and obj.position_index? then obj.position_index else ''
        @voice_texts = ko.observableArray []

        # 初始化 voice_texts
        if obj? and obj.voice_texts?
            that = @
            ko.utils.arrayForEach obj.voice_texts, (voice_text)->
                that.voice_texts.push new Voice voice_text
                return
        # 如果没有内容，默认给一个空内容
        if @voice_texts().length is 0 then @voice_texts.push new Voice ''

        @_editor_code = $tools.guid "option_xxxxxxxxxxxxxxxxxxxxxxxxxx"

        @_search_point_id = ko.observable ''
        @_search_point_content = ko.observable ''
        @_search_point_type = ko.observable no

        that = @

        @position = ko.dependentObservable
            read: ->
                that.position_col() + "-" + that.position_index()
            write: (value) ->
                arr = value.split '-'
                that.position_col arr[0]
                that.position_index arr[1]
            owner: that

        @score.subscribe ->
            $("body").trigger "answers_update"
            return

        @points.subscribe ->
            $("body").trigger "answers_update"
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

@Option = Option