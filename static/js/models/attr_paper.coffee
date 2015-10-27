class attr_paper
    papers: ko.observableArray []

    _search_paper_id  : ko.observable ''
    _search_paper_name: ko.observable ''
    _search_paper_num : ko.observable ''
    _search_paper_list: ko.observableArray []
    _search_index_list: ko.observableArray []

    search_paper        : ->
        that = @

        if @updateTimer
            clearTimeout @updateTimer
            @updateTimer = null

        if @updateAjax
            @updateAjax.abort()
            @updateAjax = null

        @updateTimer = setTimeout ->
            that.updateAjax = $.post '/xx/questions/paper_hints',
                title: that._search_paper_name()
                subject_id: that.subject_id()
            , (data)->
                if data.success
                    that._search_paper_list.removeAll()

                    for i of data.hints
                        if data.hints.hasOwnProperty i
                            that._search_paper_list.push new Paper
                                id     : i
                                content: data.hints[i]
                                number : -1

                            that._search_paper_id i if data.hints[i] is that._search_paper_name()

                    that.search_paper_numbers()
                return
            return
        return
    search_paper_numbers: ->
        that = @

        $.post '/xx/questions/question_index_hints',
            paper_id: that._search_paper_id
        , (data)->
            if data.success
                that._search_index_list.removeAll()
                that._search_index_list.push '请选择'

                that._search_index_list.push d for d in data.indices
            return
        return
    add_paper           : ->
        if @_search_paper_id()? and @_search_paper_id() isnt ''
            @papers.push new Paper
                id     : @_search_paper_id()
                content: @_search_paper_name()
                number : @_search_paper_num()

            @_search_paper_id ''
            @_search_paper_name ''
            @_search_paper_num ''
            @_search_paper_list []
            @_search_index_list []
        return

@attr_paper = attr_paper