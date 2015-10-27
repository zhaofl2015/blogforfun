class Point
    constructor: (obj)->
        @id = ko.observable if obj? and obj.id? then obj.id else ''
        @content = ko.observable if obj? and obj.content? then obj.content else ''
        @isKeyPoint = ko.observable if obj? and obj.isKeyPoint? then obj.isKeyPoint else no
        @tagId = ko.observable if obj? and obj.tagId? then obj.tagId else 0
        @tagName = ko.observable if obj? and obj.tagName? then obj.tagName else ''

        @isKeyPoint.subscribe ->
            $('body').trigger 'answers_update'
            return

@Point = Point