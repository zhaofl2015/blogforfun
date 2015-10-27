class Keyword
    constructor: (content)->
        @content = ko.observable if content? then content else ''

@Keyword = Keyword