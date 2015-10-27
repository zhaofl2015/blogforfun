class Get_papers
    choose_ownerpaper_array: ko.observableArray []
    choose_ownerpaper_value: ko.observable ''
    choose_ownerpaper_id: ko.observable ''

    update_choose_papers: ->
        that = @

        if @updateTimer
            clearTimeout @updateTimer
            @updateTimer = null

        if @updateAjax
            @updateAjax.abort()
            @updateAjax = null

        @updateTimer = setTimeout ->
            that.updateAjax = $.post "/xx/questions/paper_hints",
                title: that.choose_ownerpaper_value()
                subject_id: that.subject_id()
            , (data)->
                if data.success
                    that.choose_ownerpaper_array.removeAll()

                    for i of data.hints
                        if data.hints.hasOwnProperty i
                            that.choose_ownerpaper_array.push
                                paperid  : i
                                papername: data.hints[i]
                    pid = that._get_paper_id()
                    that.choose_ownerpaper_id = if pid then ko.observable pid else ko.observable '' 
                return
            return
        return
    _get_paper_id       : ->
        that = @
        target_paper_id = no
        ko.utils.arrayForEach @choose_ownerpaper_array(), (el)->
            target_paper_id = el.paperid if el.papername is that.choose_ownerpaper_value()
            return
        return target_paper_id


@Get_papers = Get_papers
