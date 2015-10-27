class Resource
    constructor: (obj)->
        @id = ko.observable if obj? and obj.id? then obj.id else ''
        @name = ko.observable if obj? and obj.name? then obj.name else ''
        @url = ko.observable if obj? and obj.url? then obj.url else ''

@Resource = Resource