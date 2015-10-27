class Role
    constructor: (obj)->
        @id = ko.observable if obj? and obj.id? then obj.id else ''
        @name = ko.observable if obj? and obj.name? then obj.name else ''
        @content = ko.observable if obj? and obj.content? then obj.content else ''
        @seconds = ko.observable if obj? and obj.seconds? then obj.seconds else ''
        @role_type = ko.observable if obj? and obj.role_type? then obj.role_type else 1
        @resource = if obj? and obj.resource? then obj.resource else new Resource()
        @voice_text = ko.observable if obj? and obj.voice_text? then obj.voice_text else ''
        @voice_texts = ko.observableArray []

        that = @

        # 初始化 voice_texts
        if obj? and obj.voice_texts?
            ko.utils.arrayForEach obj.voice_texts, (voice_text)->
                that.voice_texts.push new Voice voice_text
                return
        # 如果没有内容，默认给一个空内容
        if @voice_texts().length is 0 then @voice_texts.push new Voice ''

        @content.subscribe (newValue)->
            that.content $tools.replaceAll newValue, "data-bind", ""
            return

    delete_resource: ->
        @resource.id ''
        @resource.name ''
        @resource.url ''
        return

@Role = Role