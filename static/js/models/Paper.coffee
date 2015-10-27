class Paper
    constructor: (obj)->
        @id = ko.observable if obj? and obj.id? then obj.id else ''
        @content = ko.observable if obj? and obj.content? then obj.content else ''
        @number = ko.observable if obj? and obj.number? then obj.number else ''

@Paper = Paper