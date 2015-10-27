class attr_difficulty
    difficulty_id  : ko.observable ''
    difficulty_name: ko.observable ''
    difficulty_list: ko.observableArray []

    difficulty_update: ->
        that = @
        ko.utils.arrayForEach @difficulty_list(), (content)->
            that.difficulty_name content[1] if that.difficulty_id() is content[0]
        return

@attr_difficulty = attr_difficulty