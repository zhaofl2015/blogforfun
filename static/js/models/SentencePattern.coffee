class SentencePattern
    constructor: (content)->
        @content = ko.observable if content? then content else ''

@SentencePattern = SentencePattern