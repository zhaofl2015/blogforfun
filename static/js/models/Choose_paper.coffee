class Choose_paper
    papers                 : ko.observableArray []
    choose_ownerpaper_array: ko.observableArray []
    choose_ownerpaper_value: ko.observable ''
    question_index_array   : ko.observableArray []
    question_index_value   : ko.observable ''

    _paper_to_edit         : ko.observable ''

    constructor: (papers = [])->
        @papers papers

        for paper in @papers()
            @_paper_to_edit paper if paper.number is ''


        if typeof @_paper_to_edit() isnt 'undefined'
            @papers.remove @_paper_to_edit()

            @choose_ownerpaper_value @_paper_to_edit().title
            @get_question_index @_paper_to_edit().paper_id

        return
    update_choose_papers: ->
        that = @

        if @updateTimer
            clearTimeout @updateTimer
            @updateTimer = null

        if @updateAjax
            @updateAjax.abort()
            @updateAjax = null

        @updateTimer = setTimeout ->
            that.updateAjax = $.post '/xx/questions/paper_hints',
                title: that.choose_ownerpaper_value()
            , (data)->
                if data.success
                    that.choose_ownerpaper_array.removeAll()

                    for i of data.hints
                        if data.hints.hasOwnProperty i
                            that.choose_ownerpaper_array.push
                                paperid  : i
                                papername: data.hints[i]

                    that.get_question_index()
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
    get_question_index  : (paper_id)->
        that = @
        target_paper_id = paper_id || @_get_paper_id()

        if target_paper_id
            $.post '/xx/questions/question_index_hints',
                paper_id: target_paper_id
            , (data)->
                if data.success
                    that.question_index_array.removeAll()
                    that.question_index_array.push "请选择"

                    that.question_index_array.push d for d in data.indices
                return
        return
    add_paper           : ->
        paper_id = if typeof @_paper_to_edit() is "undefined" or @_paper_to_edit() is "" then @_get_paper_id() else @_paper_to_edit().paper_id

        index = @question_index_value()

        if !!(paper_id and index)
            @papers.push
                paper_id: paper_id
                title   : @choose_ownerpaper_value()
                number   : index

            @papers _.sortBy @papers(), (paper)->
                paper.title + paper.number + paper.paper_id

            numbers = []
            @papers _.filter @papers(), (paper)->
                if numbers.indexOf(paper.title + paper.number + paper.paper_id) is -1
                    numbers.push paper.title + paper.number + paper.paper_id
                    return yes
                else
                    alert "题号重复"
                    return no

            @question_index_array.removeAll()
            @question_index_value ''
            @choose_ownerpaper_array.removeAll()
            @choose_ownerpaper_value ''
        return
    delete_paper        : (self)->
        self.papers.remove @
        return

@Choose_paper = Choose_paper
