class Variable
    constructor: (content)->
        @content = ko.observable if content? then content else ''

@Variable = Variable