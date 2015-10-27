class Voice
    constructor: (content)->
        @content = ko.observable if content? then content else ''

@Voice = Voice