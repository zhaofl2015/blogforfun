class BigDady
    #子题的初始化工作
    SubComplexDisposal: (gd, type)->
        console.info gd
        that = @

        params = UrlUtils.getUrlParams location.href 
        @id params.question_id

        @sub_index if gd.sub_index is -1 then '' else gd.sub_index
        #初始化模板类型
        @template_name "ko-type-#{type}"
        @review_template_name "ko-review-#{type}"

        #初始化作答时间
        @seconds gd.seconds || 0

        #初始化答案区显示方式
        if ko.isObservable @answer_is_radio
            @answer_is_radio ko.observable type is 1 or type is 5
        else
            @answer_is_radio = ko.observable type is 1 or type is 5

        #初始化试卷类型
        @content_type_id type
        @content_type_name "复合题"
        @second_content_type_id gd.content_type_id
        @second_content_type_name gd.content_type
        @third_content_type_id gd.content_type_2_id
        @third_content_type_name gd.content_type_2

        #前端是否显示
        @question_type gd.question_type if gd.question_type?

        #初始化题目类型工作
        @sub_content_type_list = ko.observable gd.sub_content_type_choices
        if ko.isObservable @sub_content_type_id
            @sub_content_type_id type
        else
            @sub_content_type_id = ko.observable type
        if ko.isObservable @sub_content_type_name
            @sub_content_type_name ''
        else
            @sub_content_type_name = ko.observable ''
        ko.utils.arrayForEach @sub_content_type_list(), (content_type)->
            that.sub_content_type_name content_type[1] if content_type[0] is type
            return

        # 新解析界面判断
        if ko.isObservable that.different
            that.different gd.analysis_types?.length > 0
        else
            that.different = ko.observable gd.analysis_types?.length > 0
        if that.different()
            # 可用数据集合
            that.__analysis_types = gd.analysis_types
            # 需要展示数据集合
            if ko.isObservable that.__analysis_type_ids
                that.__analysis_type_ids gd.analysis_type_ids
            else
                that.__analysis_type_ids = ko.observableArray gd.analysis_type_ids
            # 定义模型数据
            if ko.isObservable that.keychain
                that.keychain []
            else
                that.keychain = ko.observableArray []
            if gd.analysis_list?.length > 0
                ko.utils.arrayForEach gd.analysis_list, (analysis)->
                    temp_ana_type = 1
                    multi = 1
                    ko.utils.arrayForEach that.__analysis_types, (node)->
                        temp_ana_type = node.content_type if node._id is analysis.analysis_type_id
                        multi = node.multi if node.id is analysis.analysis_type_id
                        return

                    choice = [];
                    ko.utils.arrayForEach analysis.choice_ids, (c, index)->
                        choice.push
                            id  : ko.observable c
                            text: ko.observable analysis.choice_contents[index]
                        return
                    that.keychain.push
                        key     : analysis.analysis_type_id
                        name    : analysis.analysis_type
                        multi   : multi
                        type    : temp_ana_type
                        choice  : ko.observableArray choice
                        content : ko.observable analysis.text
                    return
            else
                ko.utils.arrayForEach that.__analysis_types, (analysis)->
                    that.keychain.push(
                        key     : analysis._id
                        name    : analysis.name
                        multi   : analysis.multi
                        type    : analysis.content_type
                        choice  : ko.observableArray []
                        content : ko.observable ''
                    ) if that.__analysis_type_ids.indexOf(analysis._id) isnt -1
                    return

        #初始化题干
        @content gd.content

        #初始化解析
        @analysis gd.analysis

        #初始化是否显示序号
        @hide_option_number gd.hide_option_number is 1

        #监听答案简化版列表
        @_answer_list.onecSubscribe ->
            that.answers([])
            ko.utils.arrayForEach that.options(), (option)->
                if $.inArray(option.id(), that._answer_list()) isnt -1
                    that.answers.push new Answer
                        id     : option.id()
                        content: option.content()

                return

            $("body").trigger "answers_update"

            return

        #选项知识点改变，刷新对应答案知识点
        $("body").off("answers_update").on "answers_update", ->
            ko.utils.arrayForEach that.options(), (option)->
                ko.utils.arrayForEach that.answers(), (answer)->
                    switch type
                        when 1,2,3,5
                            if answer.id() is option.id()
                                answer.points.removeAll()
                                ko.utils.arrayForEach option.points(), (point)->
                                    answer.points.push new Point
                                        id        : point.id()
                                        content   : point.content()
                                        isKeyPoint: point.isKeyPoint()
                                        tagId     : point.tagId()
                                        tagName   : point.tagName()
                                    return
                                answer.score option.score()
                    return
            return

        @content.onecSubscribe (newValue)->
            console.info newValue
            newValue = $tools.replaceAll newValue, "data-bind", ""
            console.info newValue
            that.content newValue

        #根据子题型类型用不同方式初始化
        @sub_content_type_id.onecSubscribe (newType)->
            console.info "newType - #{newType}"

            that.content ''
            that.content_editor_code = $tools.guid "content_xxxxxxxxxxxxxxxxxxxxxxxxxx"
            gd.content = ''
            that.options.removeAll()
            gd.options = []
            that.answers.removeAll()
            gd.answers = []

            gd.knowledge_points_b_list = []
            gd.knowledge_points_list = []
            that._answer_list = if newType is 1 or newType is 5 then ko.observable '' else ko.observableArray []

            that.analysis ''
            gd.analysis = ''
            that.analysis_editor_code = $tools.guid "analysis_xxxxxxxxxxxxxxxxxxxxxxxxxx"

            that.SubComplexDisposal gd, newType

            setDashboard(that)
            return

        #监听答案变化
        $("body").off("update_model").on "update_model", (event, content, key)->
            that.content content if /^CO/.test key
            that.analysis content if /^AN/.test key

            return

        switch type
            when 1
                #初始化选项
                ko.utils.arrayForEach gd.options, (options_content, index)->
                    that.options.push new Option
                        id     : String.fromCharCode +index + 65
                        content: options_content.option
                    return

                #初始化答案
                ko.utils.arrayForEach gd.answers, (dkanswer)->
                    answer = new Answer
                        id      : String.fromCharCode +dkanswer.answer + 65
                        content : dkanswer.name
                        score   : dkanswer.score_percentage

                    ko.utils.arrayForEach dkanswer.knowledge_points, (knowledge)->
                        answer.points.push new Point
                            id        : knowledge.id
                            content   : knowledge.name
                            isKeyPoint: knowledge.main is 1
                            tagId     : knowledge.tag_id
                            tagName   : knowledge.tag_name 
                        that.options()[+dkanswer.answer].points.push new Point
                            id        : knowledge.id
                            content   : knowledge.name
                            isKeyPoint: knowledge.main is 1
                            tagId     : knowledge.tag_id
                            tagName   : knowledge.tag_name
                        return

                    that.answers.push answer
                    that._answer_list String.fromCharCode +dkanswer.answer + 65
                    return
            when 2
                #初始化选项
                ko.utils.arrayForEach gd.options, (options_content, index)->
                    that.options.push new Option
                        id     : String.fromCharCode +index + 65
                        content: options_content.option
                    return

                #初始化答案
                ko.utils.arrayForEach gd.answers, (dkanswer)->
                    answer = new Answer
                        id      : String.fromCharCode +dkanswer.answer + 65
                        content : dkanswer.name
                        score   : dkanswer.score_percentage

                    ko.utils.arrayForEach dkanswer.knowledge_points, (knowledge)->
                        answer.points.push new Point
                            id        : knowledge.id
                            content   : knowledge.name
                            isKeyPoint: knowledge.main is 1
                            tagId     : knowledge.tag_id
                            tagName   : knowledge.tag_name

                        that.options()[+dkanswer.answer].points.push new Point
                            id        : knowledge.id
                            content   : knowledge.name
                            isKeyPoint: knowledge.main is 1
                            tagId     : knowledge.tag_id
                            tagName   : knowledge.tag_name
                        return

                    that.answers.push answer
                    that._answer_list.push String.fromCharCode +dkanswer.answer + 65
                    return
            when 3
                #初始化选项
                ko.utils.arrayForEach gd.options, (options_content, index)->
                    that.options.push new Option
                        id     : String.fromCharCode +index + 65
                        content: options_content.option
                    return

                #初始化答案
                ko.utils.arrayForEach gd.answers, (dkanswer)->
                    answer = new Answer
                        id      : String.fromCharCode +dkanswer.answer + 65
                        content : dkanswer.name
                        score   : dkanswer.score_percentage

                    ko.utils.arrayForEach dkanswer.knowledge_points, (knowledge)->
                        answer.points.push new Point
                            id        : knowledge.id
                            content   : knowledge.name
                            isKeyPoint: knowledge.main is 1
                            tagId     : knowledge.tag_id
                            tagName   : knowledge.tag_name

                        that.options()[+dkanswer.answer].points.push new Point
                            id        : knowledge.id
                            content   : knowledge.name
                            isKeyPoint: knowledge.main is 1
                            tagId     : knowledge.tag_id
                            tagName   : knowledge.tag_name
                        return

                    that.answers.push answer
                    that._answer_list.push String.fromCharCode +dkanswer.answer + 65
                    return
            when 4
                parseContent = ->
                    setTimeout(->
                        count = 0
                        preview = $('.content_preview')
                        content = preview.html()
                        newCont = content.replace(/__\$\$__/g, ->
                            return '<span style="padding:0 20px;border-bottom:1px solid #000;white-space: nowrap;">空' + (++count) + '</span>')
                        preview.html newCont
                        preview.find('img[latex]').each (index, element)->
                            latex = $(element).attr 'latex'
                            newLatex = latex.replace /\\fbox {}/g, ->
                                return '\\fbox {空'+(++count)+'}'
                            $.ajax
                                url: 'https://tiku.17zuoye.net/latex/render?r=p&ds=140&m=y&s=' + encodeURIComponent(newLatex)
                                dataType: "jsonp"
                                jsonp: "cb"
                                success: (data)->
                                    $(element).attr 'src', data.url
                    , 100)
                #填空题监控题干内容
                @content.onecBeforeSubscribe (newValue, oldValue)->
                    #把题干中的填空占位符替换为标号
                    parseContent()

                    oldBlockCount = oldValue.split("\\fbox {}").length - 1
                    newBlockCount = newValue.split("\\fbox {}").length - 1
                    oldCount = oldValue.split("__$$__").length - 1 + oldBlockCount
                    newCount = newValue.split("__$$__").length - 1 + newBlockCount

                    if newCount isnt oldCount
                        that.answers.removeAll()
                        for i in [0...newCount]
                            answer = new Answer({id: i})
                            that.answers.push answer
                            $tools.initEditor answer._editor_code, that, "answers()[#{i}].content"

                        TreeDialogMod.bindInput $ '.answer_nlgs .treeDialog'
                    return

                #初始化答案
                ko.utils.arrayForEach gd.answers, (dkanswer)->
                    answer = new Answer
                        content     : dkanswer.answer
                        score       : dkanswer.score_percentage
                        editor_type : dkanswer.rich_text

                    ko.utils.arrayForEach dkanswer.knowledge_points, (knowledge)->
                        answer.points.push new Point
                            id        : knowledge.id
                            content   : knowledge.name
                            isKeyPoint: knowledge.main is 1
                            tagId     : knowledge.tag_id
                            tagName   : knowledge.tag_name
                        return

                    that.answers.push answer
                    return

                #把题干中的填空占位符替换为标号
                parseContent()
            when 5 #判断题
                #初始化选项
                if gd.options.length is 0
                    that.options.push(new Option({ id     : 'A', content: '<img src="'+right_img+'" />'}));
                    that.options.push(new Option({ id     : 'B', content: '<img src="'+wrong_img+'" />'}));
                else
                    ko.utils.arrayForEach gd.options, (options_content, index)->
                        that.options.push new Option
                            id      : String.fromCharCode +index + 65
                            content : options_content.option
                        return


                #初始化答案
                ko.utils.arrayForEach gd.answers, (dkanswer)->
                    answer = new Answer
                        id      : String.fromCharCode +dkanswer.answer + 65
                        content : if that.options()[+dkanswer.answer] then that.options()[+dkanswer.answer].content() else ''
                        score   : dkanswer.score_percentage

                    that.options()[+dkanswer.answer].score dkanswer.score_percentage

                    ko.utils.arrayForEach dkanswer.knowledge_points, (knowledge)->
                        answer.points.push new Point
                            id        : knowledge.id
                            content   : knowledge.name
                            isKeyPoint: knowledge.main is 1
                            tagId     : knowledge.tag_id
                            tagName   : knowledge.tag_name

                        that.options()[+dkanswer.answer].points.push new Point
                            id        : knowledge.id
                            content   : knowledge.name
                            isKeyPoint: knowledge.main is 1
                            tagId     : knowledge.tag_id
                            tagName   : knowledge.tag_name
                        return

                    that.answers.push answer
                    that._answer_list String.fromCharCode +dkanswer.answer + 65
            when 6 #主观题
                #初始化答案
                if gd.answers.length is 0
                    @answers.push new Answer
                        id: 0
                else
                    ko.utils.arrayForEach gd.answers, (dkanswer, index)->
                        answer = new Answer
                            id          : index
                            content     : dkanswer.answer
                            score       : dkanswer.score_percentage
                            editor_type : dkanswer.rich_text

                        ko.utils.arrayForEach dkanswer.knowledge_points, (knowledge)->
                            answer.points.push new Point
                                id        : knowledge.id
                                content   : knowledge.name
                                isKeyPoint: knowledge.main is 1
                                tagId     : knowledge.tag_id
                                tagName   : knowledge.tag_name
                            return

                        that.answers.push answer
                        return

                TreeDialogMod.bindInput($('.treeDialog'));
            when 7 #连线题
                #初始化选项
                option_id = 0;
                ko.utils.arrayForEach (if gd.options.length > 0 then gd.options else []), (option, index)->
                    for o, i in option.option
                        option_obj =
                            id            : option_id++
                            content       : o
                            position_col  : index + 1
                            position_index: i + 1

                        that.options.push new Option option_obj
                    return

                #初始化答案
                ko.utils.arrayForEach gd.answers, (dkanswer, index)->
                    answer = new Answer
                        id          : index
                        content     : dkanswer.answer
                        score       : dkanswer.score_percentage
                        editor_type : dkanswer.rich_text

                    ko.utils.arrayForEach dkanswer.knowledge_points, (knowledge)->
                        answer.points.push new Point
                            id        : knowledge.id
                            content   : knowledge.name
                            isKeyPoint: knowledge.main is 1
                            tagId     : knowledge.tag_id
                            tagName   : knowledge.tag_name
                        return

                    that.answers.push answer
                    return

            when 8 #归类题
                #初始化选项
                ko.utils.arrayForEach (if gd.options.length > 0 then gd.options else []), (option_content, index)->
                    that.options.push new Option
                        id     : index
                        content: option_content.option
                    return

                #初始化答案
                if gd.answers.length is 0
                    @answers.push new Answer
                        id: 0
                else
                    #初始化答案
                    ko.utils.arrayForEach gd.answers, (dkanswer, index)->
                        answer = new Answer
                            id              : index
                            content         : dkanswer.answer
                            score           : dkanswer.score_percentage
                            classify_name   : dkanswer.classification

                        ko.utils.arrayForEach dkanswer.knowledge_points, (knowledge)->
                            answer.points.push new Point
                                id        : knowledge.id
                                content   : knowledge.name
                                isKeyPoint: knowledge.main is 1
                                tagId     : knowledge.tag_id
                                tagName   : knowledge.tag_name
                            return

                        that.answers.push answer
                    return

            when 9 #排序题
                #初始化选项
                ko.utils.arrayForEach (if gd.options.length > 0 then gd.options else []), (option_content, index)->
                    that.options.push new Option
                        id     : index
                        content: option_content.option
                    return

                #初始化答案
                if gd.answers.length is 0
                    @answers.push new Answer
                        id: 0
                else
                    #初始化答案
                    ko.utils.arrayForEach gd.answers, (dkanswer, index)->
                        answer = new Answer
                            id              : index
                            content         : dkanswer.answer
                            score           : dkanswer.score_percentage

                        ko.utils.arrayForEach dkanswer.knowledge_points, (knowledge)->
                            answer.points.push new Point
                                id        : knowledge.id
                                content   : knowledge.name
                                isKeyPoint: knowledge.main is 1
                                tagId     : knowledge.tag_id
                                tagName   : knowledge.tag_name
                            return

                        that.answers.push answer
                        return
            when 10
                that = @

                #初始化选项
                ko.utils.arrayForEach gd.options, (options_content, index)->
                    that.options.push new Option
                        id     : String.fromCharCode +index + 65
                        content: options_content.option
                    return

                #填空题监控题干内容
                @content.beforeSubscribe (newValue, oldValue)->
                    oldBlockCount = oldValue.split("\\fbox {}").length - 1
                    newBlockCount = newValue.split("\\fbox {}").length - 1
                    oldCount = oldValue.split("__$$__").length - 1 + oldBlockCount
                    newCount = newValue.split("__$$__").length - 1 + newBlockCount

                    if newCount isnt oldCount
                        that.answers.removeAll()
                        for i in [0...newCount]
                            answer = new Answer({id: i})
                            that.answers.push answer

                        TreeDialogMod.bindInput $ '.answer_nlgs .treeDialog'
                    return

                #初始化答案
                ko.utils.arrayForEach gd.answers, (dkanswer)->
                    answer = new Answer
                        content : String.fromCharCode +dkanswer.answer + 65
                        score   : dkanswer.score_percentage

                    ko.utils.arrayForEach dkanswer.knowledge_points, (knowledge)->
                        answer.points.push new Point
                            id        : knowledge.id
                            content   : knowledge.name
                            isKeyPoint: knowledge.main is 1
                            tagId     : knowledge.tag_id
                            tagName   : knowledge.tag_name
                        return

                    that.answers.push answer

                return

        return
    #子题的回写工作
    SubComplexRecycling: (gd)->
        console.info gd

        that = @

        gd.content_type_id = +@second_content_type_id()
        gd.content_type = @second_content_type_name()
        gd.content_type_2_id = +@third_content_type_id()
        gd.content_type_2 = @third_content_type_name()

        #回写题目类型工作
        gd.sub_content_type = @sub_content_type_name()
        gd.sub_content_type_id = @sub_content_type_id()

        #回写是否显示序号
        gd.hide_option_number = if @hide_option_number() then 1 else 0

        #前端是否显示
        gd.question_type = @question_type() if gd.question_type?

        #回写作答时间
        gd.seconds = +@seconds()

        #回写题干
        gd.content = @content()

        #回写解析
        gd.analysis = @analysis()

        #回写选项
        gd.options = []
        gd.answers = []
        ko.utils.arrayForEach @options(), (option, index)->
            #判断是否有位置信息，如果有，则option回写为二维数组
            if option.position() != '-'
                pos = option.position().split '-'
                pos_col = pos[0] - 1
                pos_index = pos[1] - 1
                unless gd.options[pos_col]?
                    gd.options[pos_col] = {}
                    gd.options[pos_col].option = []

                gd.options[pos_col].option[pos_index] = option.content()
            else
                gd.options.push
                    option : option.content()

            if that.answers()[0]?
                if that.answers()[0].id() is String.fromCharCode +index + 65
                    gd.answers.push (index + '')
            return

        switch @sub_content_type_id()
            when 1, 2, 3, 5
                gd.answers = []
                ko.utils.arrayForEach @answers(), (answer)->
                    dkanswer =
                        answer              : answer.id().charCodeAt() - 65
                        score_percentage    : answer.score()
                        knowledge_points    : []

                    ko.utils.arrayForEach answer.points(), (point)->
                        dkanswer.knowledge_points.push
                            id      : point.id()
                            name    : point.content()
                            main    : if point.isKeyPoint() then 1 else 0
                            tag_id  : point.tagId()
                            tag_name: point.tagName()

                    gd.answers.push dkanswer
                    return
            when 4
                gd.answers = []
                ko.utils.arrayForEach @answers(), (answer)->
                    dkanswer =
                        answer              : answer.content()
                        rich_text           : answer.editor_type()
                        score_percentage    : answer.score()
                        knowledge_points    : []

                    ko.utils.arrayForEach answer.points(), (point)->
                        dkanswer.knowledge_points.push
                            id      : point.id()
                            name    : point.content()
                            main    : if point.isKeyPoint() then 1 else 0
                            tag_id  : point.tagId()
                            tag_name: point.tagName()

                    gd.answers.push dkanswer
                    return
            when 6, 7, 9
                gd.answers = []
                ko.utils.arrayForEach @answers(), (answer)->
                    dkanswer =
                        answer              : answer.content()
                        score_percentage    : answer.score()
                        knowledge_points    : []

                    ko.utils.arrayForEach answer.points(), (point)->
                        dkanswer.knowledge_points.push
                            id      : point.id()
                            name    : point.content()
                            main    : if point.isKeyPoint() then 1 else 0
                            tag_id  : point.tagId()
                            tag_name: point.tagName()

                    gd.answers.push dkanswer
                    return
            when 8
                gd.answers = []
                ko.utils.arrayForEach @answers(), (answer)->
                    dkanswer =
                        answer              : answer.content().replace(/，/g, ',')
                        score_percentage    : answer.score()
                        classification      : answer.classify_name()
                        knowledge_points    : []

                    ko.utils.arrayForEach answer.points(), (point)->
                        dkanswer.knowledge_points.push
                            id      : point.id()
                            name    : point.content()
                            main    : if point.isKeyPoint() then 1 else 0
                            tag_id  : point.tagId()
                            tag_name: point.tagName()

                    gd.answers.push dkanswer
                    return
            when 10
                gd.answers = []
                invalidArray = []
                ko.utils.arrayForEach @answers(), (answer, index)->
                    invalidArray.push (index+1) if answer.content() is ''
                    dkanswer =
                        answer              : answer.content().charCodeAt() - 65
                        score_percentage    : answer.score()
                        knowledge_points    : []

                    ko.utils.arrayForEach answer.points(), (point)->
                        dkanswer.knowledge_points.push
                            id      : point.id()
                            name    : point.content()
                            main    : if point.isKeyPoint() then 1 else 0
                            tag_id  : point.tagId()
                            tag_name: point.tagName()

                    gd.answers.push dkanswer
                    return
                if invalidArray.length > 0
                    alert('第 '+invalidArray.join(',')+ ' 空未填写答案！');
                    return false

        #处理中学解析
        if that.different()
            gd.analysis_list = []
            ko.utils.arrayForEach that.keychain(), (data)->
                choice = []
                ko.utils.arrayForEach data.choice(), (c)->
                    choice.push c.id()
                    return
                gd.analysis_list.push
                    analysis_type_id : data.key
                    choice_ids       : choice
                    text             : data.content()
                return

        return gd

    #复合体的初始化工作
    ComplexDisposal: (gd)->
        console.info gd

        that = @

        #初始化作答说明
        @description gd.description

        @id gd._id
        @nid gd.nid
        @subject_id gd.subject_id

        #初始化作答说明
        @description gd.description
        
        #初始化题干
        @content gd.content.content

        #初始化试卷类型
        @content_type_id 0
        @content_type_name "复合题"
        @second_content_type_id gd.content_type_id
        @second_content_type_name gd.content_type
        @third_content_type_id gd.content_type_2_id
        @third_content_type_name gd.content_type_2

        @content_type_choices gd.content_type_choices

        # 新解析界面判断
        that.different = ko.observable gd.analysis_types?.length > 0
        if that.different()
            # 可用数据集合
            that.__analysis_types = gd.analysis_types
            # 需要展示数据集合
            that.__analysis_type_ids = ko.observableArray []
            # 初始化需展示数据
            ko.utils.arrayForEach that.content_type_choices(), (choice1)->
                if choice1.id is that.second_content_type_id()
                    that.__analysis_type_ids choice1.analysis_type_ids
                    ko.utils.arrayForEach choice1.children, (choice2)->
                        if choice2.id is that.third_content_type_id()
                            that.__analysis_type_ids choice2.analysis_type_ids
                        return
                return
            # 定义模型数据
            that.keychain = ko.observableArray []
            if gd.content.sub_contents[0].analysis_list?.length > 0
                ko.utils.arrayForEach gd.content.sub_contents[0].analysis_list, (analysis)->
                    type = 1
                    multi = 1
                    ko.utils.arrayForEach that.__analysis_types, (node)->
                        type = node.content_type if node._id is analysis.analysis_type_id
                        multi = node.multi if node._id is analysis.analysis_type_id
                        return

                    choice = [];
                    ko.utils.arrayForEach analysis.choice_ids, (c, index)->
                        choice.push
                            id  : ko.observable c
                            text: ko.observable analysis.choice_contents[index]
                        return
                    that.keychain.push
                        key     : analysis.analysis_type_id
                        name    : analysis.analysis_type
                        multi   : multi
                        choice  : ko.observableArray choice
                        type    : type
                        content : ko.observable analysis.text
                    return
            else
                ko.utils.arrayForEach that.__analysis_types, (analysis)->
                    that.keychain.push(
                        key     : analysis._id
                        name    : analysis.name
                        multi   : analysis.multi
                        choice  : ko.observableArray []
                        type    : analysis.content_type
                        content : ko.observable ''
                    ) if that.__analysis_type_ids.indexOf(analysis._id) isnt -1
                    return

            # 监听ids变化
            that.__analysis_type_ids.subscribe ->
                that.keychain.removeAll();
                ko.utils.arrayForEach that.__analysis_types, (analysis)->
                    choice = [];
                    ko.utils.arrayForEach analysis.choices, (c, index)->
                        choice.push
                            id  : ko.observable c
                            text: ko.observable analysis.choice_contents[index]
                        return
                    that.keychain.push(
                        key     : analysis._id
                        name    : analysis.name
                        multi   : analysis.multi
                        choice  : ko.observableArray choice
                        type    : analysis.content_type
                        content : ko.observable ''
                    ) if that.__analysis_type_ids.indexOf(analysis._id) isnt -1
                    return
                return

        @second_content_type_list().push [c.id, c.name]  for c in gd.content_type_choices
        @update_third_content_type_list()

        #初始化试卷列表
        ko.utils.arrayForEach gd.papers, (paper)->
            if paper.number is ''
                that._search_paper_id paper.paper_id
                that._search_paper_name paper.title
            else
                that.papers.push new Paper
                    id     : paper.paper_id
                    content: paper.title
                    number : paper.number
        @search_paper_numbers() if @._search_paper_id() isnt ''

        #初始化难度
        @difficulty_id gd.difficulty_int
        @difficulty_name gd.difficulty
        @difficulty_list gd.difficulty_list

        #前端是否显示
        @question_type gd.question_type if gd.question_type?

        #初始化作答时间
        @seconds gd.seconds || 0

        #初始化听力材料界面
        @has_listen gd.has_listen is 1
        if gd.listen_url isnt ''
            @resources.push new Resource
                name: gd.listen_name
                url : gd.listen_url

        #初始化题目知识点
        ko.utils.arrayForEach gd.knowledge_points, (knowledge)->
            that.points.push new Point
                id        : knowledge.id
                content   : knowledge.name
                isKeyPoint: knowledge.main is 1
                tagId     : knowledge.tag_id
                tagName   : knowledge.tag_name
            return

        #监听一级题型和二级题型，如果发生变化，判断是否有听力材料，做相关更新
        listen_change = ->
            that.__analysis_type_ids [] if that.different()
            for choice1 in gd.content_type_choices
                if choice1.id is that.second_content_type_id()
                    that.__analysis_type_ids choice1.analysis_type_ids if that.different()
                    for choice2 in choice1.children
                        if choice2.id is that.third_content_type_id()
                            that.__analysis_type_ids choice2.analysis_type_ids if that.different()
                            if choice2.has_listen is 1
                                that.has_listen true
                            else
                                that.has_listen false
                                that.resources.removeAll()
                $('script[name="analysis_types_editor_code"]').each ->
                    $tools.initEditor $(this).context.id, that.keychain()[$(this).attr "data-chain-id"], 'content'
            return

        @second_content_type_id.subscribe listen_change
        @third_content_type_id.subscribe listen_change

        #初始化解析
        @analysis gd.content.analysis

        @sub_complex_id = ko.observable -1
        @sub_complex_type = ko.observable gd.sub_content_type_choices

        #初始化教辅内容
        that.initWorkbook(gd.workbooks)

        return

    #复合题的回写工作
    ComplexRecycling: (gd)->
        that = @

        #回写作答说明
        gd.description = @description()

        #回写试卷类型
        gd.content_type_id = +@second_content_type_id()
        gd.content_type = @second_content_type_name()
        gd.content_type_2_id = +@third_content_type_id()
        gd.content_type_2 = @third_content_type_name()

        #回写题干
        gd.content.content = @content()

        #回写试卷列表
        gd.papers = []
        ko.utils.arrayForEach @papers(), (paper)->
            gd.papers.push({
                paper_id: paper.id()
                title   : paper.content()
                number  : +paper.number()
            });
            return

        #回写难度
        gd.difficulty_int = +@difficulty_id()
        gd.difficulty = @difficulty_name()

        #前端是否显示
        gd.question_type = @question_type() if gd.question_type?

        #回写作答时间
        gd.seconds = +@seconds()

        #初始化听力材料界面
        gd.listen_name = if @resources()[0]? then @resources()[0].name() else ''
        gd.listen_url = if @resources()[0]? then @resources()[0].url() else ''

        #回写题目知识点
        gd.knowledge_points = []
        ko.utils.arrayForEach @points(), (point)->
            gd.knowledge_points.push
                id      : point.id()
                name    : point.content()
                main    : if point.isKeyPoint() then 1 else 0
                tag_id  : point.tagId()
                tag_name: point.tagName()
            return

        #处理中学解析
        if that.different()
            gd.analysis_list = []
            ko.utils.arrayForEach that.keychain(), (data)->
                choice = []
                ko.utils.arrayForEach data.choice(), (c)->
                    choice.push c.id()
                    return
                gd.analysis_list.push
                    analysis_type_id : data.key
                    choice_ids       : choice
                    text             : data.content()
                return

        return gd
    GarbageDisposal: (gd)->
        console.info gd

        that = @

        @nid gd.nid
        @id gd._id
        @subject_id gd.subject_id
        #初始化作答说明
        @description gd.description
        #初始化题干
        @content gd.content.sub_contents[0].content

        #初始化试卷类型
        @content_type_id gd.content.sub_contents[0].sub_content_type_id
        @content_type_name gd.content.sub_contents[0].sub_content_type
        @second_content_type_id gd.content_type_id
        @second_content_type_name gd.content_type
        @third_content_type_id gd.content_type_2_id
        @third_content_type_name gd.content_type_2

        @content_type_choices gd.content_type_choices

        # 新解析界面判断
        that.different = ko.observable gd.analysis_types?.length > 0
        if that.different()
            # 可用数据集合
            that.__analysis_types = gd.analysis_types
            # 需要展示数据集合
            that.__analysis_type_ids = ko.observableArray []
            # 初始化需展示数据
            ko.utils.arrayForEach that.content_type_choices(), (choice1)->
                if choice1.id is that.second_content_type_id()
                    that.__analysis_type_ids choice1.analysis_type_ids
                    ko.utils.arrayForEach choice1.children, (choice2)->
                        if choice2.id is that.third_content_type_id()
                            that.__analysis_type_ids choice2.analysis_type_ids
                        return
                return
            # 定义模型数据
            that.keychain = ko.observableArray []
            if gd.content.sub_contents[0].analysis_list?.length > 0
                ko.utils.arrayForEach gd.content.sub_contents[0].analysis_list, (analysis)->
                    type = 1
                    multi = 1
                    ko.utils.arrayForEach that.__analysis_types, (node)->
                        type = node.content_type if node ._id is analysis.analysis_type_id
                        multi = node.multi if node ._id is analysis.analysis_type_id
                        return
                    choice = [];
                    ko.utils.arrayForEach analysis.choice_ids, (c, index)->
                        choice.push
                            id  : ko.observable c
                            text: ko.observable analysis.choice_contents[index]
                        return
                    that.keychain.push
                        key     : analysis.analysis_type_id
                        name    : analysis.analysis_type
                        multi   : multi
                        choice  : ko.observableArray choice
                        type    : type
                        content : ko.observable analysis.text
                    return
            else
                ko.utils.arrayForEach that.__analysis_types, (analysis)->
                    that.keychain.push(
                        key     : analysis._id
                        name    : analysis.name
                        multi   : analysis.multi
                        choice  : ko.observableArray []
                        type    : analysis.content_type
                        content : ko.observable ''
                    ) if that.__analysis_type_ids.indexOf(analysis._id) isnt -1
                    return

            # 监听ids变化
            that.__analysis_type_ids.subscribe ->
                that.keychain.removeAll();
                ko.utils.arrayForEach that.__analysis_types, (analysis)->
                    choice = [];
                    ko.utils.arrayForEach analysis.choices, (c, index)->
                        choice.push
                            id  : ko.observable c
                            text: ko.observable analysis.choice_contents[index]
                        return
                    that.keychain.push(
                        key     : analysis._id
                        name    : analysis.name
                        multi   : analysis.multi
                        choice  : ko.observableArray choice
                        type    : analysis.content_type
                        content : ko.observable ''
                    ) if that.__analysis_type_ids.indexOf(analysis._id) isnt -1
                    return
                return

        @second_content_type_list().push [c.id, c.name]  for c in gd.content_type_choices

        @update_third_content_type_list()
        #初始化试卷列表
        ko.utils.arrayForEach gd.papers, (paper)->
            if paper.number is ''
                that._search_paper_id paper.paper_id
                that._search_paper_name paper.title
            else
                that.papers.push new Paper
                    id     : paper.paper_id
                    content: paper.title
                    number : paper.number
            return
        @search_paper_numbers() if @._search_paper_id() isnt ''

        #初始化教辅数据
        that.initWorkbook(gd.workbooks)

        #初始化难度
        @difficulty_id gd.difficulty_int
        @difficulty_name gd.difficulty
        @difficulty_list gd.difficulty_list

        #前端是否显示
        @question_type gd.question_type if gd.question_type?

        #初始化作答时间
        @seconds gd.seconds || 0

        #初始化听力材料界面
        @has_listen gd.has_listen is 1
        if gd.content.sub_contents[0].listen_url isnt ''
            @resources.push new Resource
                name: gd.content.sub_contents[0].listen_name
                url : gd.content.sub_contents[0].listen_url


        #初始化是否显示序号
        @hide_option_number gd.content.sub_contents[0].hide_option_number is 1

        #初始化题目知识点
        ko.utils.arrayForEach gd.knowledge_points, (knowledge)->
            that.points.push new Point
                id        : knowledge.id
                content   : knowledge.name
                isKeyPoint: knowledge.main is 1
                tagId     : knowledge.tag_id
                tagName   : knowledge.tag_name
            return

        #初始化解析
        @analysis gd.content.sub_contents[0].analysis

        #初始化答案区显示方式
        @answer_is_radio = ko.observable [1, 5, 11].indexOf(@content_type_id()) != -1

        #监听答案变化
        $("body").off("update_model").on "update_model", (event, content, key)->
            that.content content if /^CO/.test key
            that.analysis content if /^AN/.test key

            return

        #差异处理
        func[@content_type_id()].call @, gd

        #监听答案简化版列表
        @_answer_list.subscribe ->
            that.answers([])
            ko.utils.arrayForEach that.options(), (option)->
                if $.inArray(option.id(), that._answer_list()) isnt -1
                    that.answers.push new Answer
                        id     : option.id()
                        content: option.content()

                return

            $("body").trigger "answers_update"

            return

        #选项知识点改变，刷新对应答案知识点
        $("body").on "answers_update", ->
            ko.utils.arrayForEach that.options(), (option)->
                ko.utils.arrayForEach that.answers(), (answer)->
                    switch that.content_type_id()
                        when 1,2,3,5,11
                            if answer.id() is option.id()
                                answer.points.removeAll()
                                ko.utils.arrayForEach option.points(), (point)->
                                    answer.points.push new Point
                                        id        : point.id()
                                        content   : point.content()
                                        isKeyPoint: point.isKeyPoint()
                                        tagId     : point.tagId()
                                        tagName   : point.tagName()
                                    return
                                answer.score option.score()
                    return
            return

        #监听一级题型和二级题型，如果发生变化，判断是否有听力材料，做相关更新
        listen_change = ->
            that.__analysis_type_ids [] if that.different()
            for choice1 in gd.content_type_choices
                if choice1.id is that.second_content_type_id()
                    that.__analysis_type_ids choice1.analysis_type_ids if that.different()
                    for choice2 in choice1.children
                        if choice2.id is that.third_content_type_id()
                            that.__analysis_type_ids choice2.analysis_type_ids if that.different()
                            if choice2.has_listen is 1
                                that.has_listen true
                            else
                                that.has_listen false
                                that.resources.removeAll()
                $('script[name="analysis_types_editor_code"]').each ->
                    $tools.initEditor $(this).context.id, that.keychain()[$(this).attr "data-chain-id"], 'content'
            return

        @second_content_type_id.subscribe (newValue)->
            ko.utils.arrayForEach that.second_content_type_list(), (type)->
                that.second_content_type_name type[1] if newValue is type[0]
                return
            listen_change()
            return
        @third_content_type_id.subscribe (newValue)->
            ko.utils.arrayForEach that.third_content_type_list(), (type)->
                that.third_content_type_name type[1] if newValue is type[0]
                return
            listen_change()
            return

        return

    Recycling: (gd)->
        that = @

        #回写作答说明
        gd.description = @description()

        #回写题干
        gd.content.sub_contents[0].content = @content()

        #回写试卷类型
        gd.content.sub_contents[0].sub_content_type_id = +@content_type_id()
        gd.content.sub_contents[0].sub_content_type = @content_type_name()
        gd.content_type_id = +@second_content_type_id()
        gd.content_type = @second_content_type_name()
        gd.content_type_2_id = +@third_content_type_id()
        gd.content_type_2 = @third_content_type_name()

        #回写试卷列表
        gd.papers = []
        ko.utils.arrayForEach @papers(), (paper)->
            gd.papers.push({
                paper_id: paper.id()
                title   : paper.content()
                number  : +paper.number()
            });
            return

        #回写难度
        gd.difficulty_int = +@difficulty_id()
        gd.difficulty = @difficulty_name()

        #前端是否显示
        gd.question_type = @question_type() if gd.question_type?

        #回写作答时间
        gd.seconds = +@seconds()

        #初始化听力材料界面
        gd.content.sub_contents[0].listen_name = if @resources()[0]? then @resources()[0].name() else ''
        gd.content.sub_contents[0].listen_url = if @resources()[0]? then @resources()[0].url() else ''

        #回写是否显示序号
        gd.content.sub_contents[0].hide_option_number = if @hide_option_number() then 1 else 0

        #回写选项
        gd.content.sub_contents[0].options = []
        gd.content.sub_contents[0].answers = []
        gd.content.sub_contents[0].oral_dict.options = [] if that.content_type_id() in [11, 12]
        position_error_option = [] #用于记录校验位置错误的选项
        ko.utils.arrayForEach @options(), (option, index)->
            #判断是否有位置信息，如果有，则option回写为二维数组
            if that.content_type_id() is 7
                #如果选项的位置为空，则记录下来
                if option.position_col() is '' or option.position_index() is ''
                    position_error_option.push option.id()
                    return
                pos_col = option.position_col() - 1
                pos_index = option.position_index() - 1
                unless gd.content.sub_contents[0].options[pos_col]?
                    gd.content.sub_contents[0].options[pos_col] = {}
                    gd.content.sub_contents[0].options[pos_col].option = []

                gd.content.sub_contents[0].options[pos_col].option[pos_index] = option.content()
            else if that.content_type_id() is 11
                voice_texts = []
                ko.utils.arrayForEach option.voice_texts(), (voice)->
                    voice_texts.push voice.content()
                    return

                gd.content.sub_contents[0].oral_dict.options.push
                    text        : option.content()
                    voice_texts : [].concat voice_texts
            else
                gd.content.sub_contents[0].options.push
                    option: option.content()
            if that.answers()[0]?
                if that.answers()[0].id() is String.fromCharCode +index + 65
                    gd.content.sub_contents[0].answers.push (index + '')
            return

        #校验位置信息错误的选项
        if position_error_option.length > 0
            error_str = '';
            error_str += (option+1)+'  ' for option in position_error_option
            alert '选项'+error_str+'的位置未填写！'
            return false
        if that.content_type_id() is 7
            ko.utils.arrayForEach gd.content.sub_contents[0].options, (optcol, colnum)->
                ko.utils.arrayForEach optcol, (opt, inum)->
                    unless opt?
                        alert '缺少第'+(colnum+1)+'列 第'+(inum+1)+'个选项！'
                        return no
                    return yes
                return

        #回写题目知识点
        gd.knowledge_points = []
        ko.utils.arrayForEach @points(), (point)->
            gd.knowledge_points.push
                id      : point.id()
                name    : point.content()
                main    : if point.isKeyPoint() then 1 else 0
                tag_id  : point.tagId()
                tag_name: point.tagName()
            return

        #回写解析
        gd.content.sub_contents[0].analysis = @analysis()

        #差异处理，如果校验失败，recyclingResult为false
        recyclingResult = back[@content_type_id()].call @, gd
        return false if recyclingResult is false

        #处理中学解析
        if that.different()
            gd.content.sub_contents[0].analysis_list = []
            ko.utils.arrayForEach that.keychain(), (data)->
                choice = []
                ko.utils.arrayForEach data.choice(), (c)->
                    choice.push c.id()
                    return
                gd.content.sub_contents[0].analysis_list.push
                    analysis_type_id : data.key
                    choice_ids       : choice
                    text             : data.content()
                return
        return gd

    #获取教辅提交数据
    getWorkbookData: ->
        that = @
        result = []
        for w in that.workbook_contents()
            temp_part_index = if w.part_index==undefined then null else w.part_index 
            result.push
                workbook_catalog_id: w.id
                part_index: temp_part_index
                number: w.number
                number_voice_text: w.number_voice_text
        return result
    formatWorkbookDetail:(item, detail, index) ->
        temp_arr = Array index
        detail += '<br>' if index >= 1
        detail += '----' for a in temp_arr

        name = if item.name then item.name else item.title
        detail += name
        if item.child is null
            return detail
        else
            arguments.callee(item.child, detail, ++index)
    #初始化教辅数据
    initWorkbook: (workbooks = [])->
        that = @
        ko.utils.arrayForEach workbooks, (w)->
            $.post('/workbook/service-get-workbook-parents', {workbook_catalog_id: w.workbook_catalog_id}).success((data)->
                detail = that.formatWorkbookDetail(data.data, '', 0)
                that.workbook_contents.push
                    id: w.workbook_catalog_id
                    name: w.workbook_catalog_id
                    number: w.part_number
                    is_part: w.is_part || false
                    part_index: w.part_index
                    detail: detail
                    number_voice_text: w.part_number_voice_text
                $('.popinfo').popover
                    trigger: 'hover'
                    html: true
            )            
            return
        

func = [
    # type 0
    ->,
    # ytpe 1
    (gd)->
        that = @

        #初始化选项
        ko.utils.arrayForEach gd.content.sub_contents[0].options, (options_content, index)->
            that.options.push new Option
                id     : String.fromCharCode +index + 65
                content: options_content.option
            return

        #初始化答案
        ko.utils.arrayForEach gd.content.sub_contents[0].answers, (dkanswer)->
            answer = new Answer
                id      : String.fromCharCode +dkanswer.answer + 65
                content : if that.options()[+dkanswer.answer] then that.options()[+dkanswer.answer].content() else ''
                score   : dkanswer.score_percentage

            that.options()[+dkanswer.answer].score dkanswer.score_percentage

            ko.utils.arrayForEach dkanswer.knowledge_points, (knowledge)->
                answer.points.push new Point
                    id        : knowledge.id
                    content   : knowledge.name
                    isKeyPoint: knowledge.main is 1
                    tagId     : knowledge.tag_id
                    tagName   : knowledge.tag_name
                that.options()[+dkanswer.answer].points.push new Point
                    id        : knowledge.id
                    content   : knowledge.name
                    isKeyPoint: knowledge.main is 1
                    tagId     : knowledge.tag_id
                    tagName   : knowledge.tag_name
                return

            that.answers.push answer
            that._answer_list String.fromCharCode +dkanswer.answer + 65

        return
    ,
    # type 2
    (gd)->
        that = @

        #初始化选项
        ko.utils.arrayForEach gd.content.sub_contents[0].options, (options_content, index)->
            that.options.push new Option
                id      : String.fromCharCode +index + 65
                content : options_content.option
            return

        #初始化答案
        ko.utils.arrayForEach gd.content.sub_contents[0].answers, (dkanswer)->
            answer = new Answer
                id      : String.fromCharCode +dkanswer.answer + 65
                content : if that.options()[+dkanswer.answer] then that.options()[+dkanswer.answer].content() else ''
                score   : dkanswer.score_percentage

            that.options()[+dkanswer.answer].score dkanswer.score_percentage

            ko.utils.arrayForEach dkanswer.knowledge_points, (knowledge)->
                answer.points.push new Point
                    id        : knowledge.id
                    content   : knowledge.name
                    isKeyPoint: knowledge.main is 1
                    tagId     : knowledge.tag_id
                    tagName   : knowledge.tag_name

                that.options()[+dkanswer.answer].points.push new Point
                    id        : knowledge.id
                    content   : knowledge.name
                    isKeyPoint: knowledge.main is 1
                    tagId     : knowledge.tag_id
                    tagName   : knowledge.tag_name
                return

            that.answers.push answer
            that._answer_list.push String.fromCharCode +dkanswer.answer + 65

        return
    ,
    # type 3
    (gd)->
        that = @

        #初始化选项
        ko.utils.arrayForEach gd.content.sub_contents[0].options, (options_content, index)->
            that.options.push new Option
                id      : String.fromCharCode +index + 65
                content : options_content.option
            return

        #初始化答案
        ko.utils.arrayForEach gd.content.sub_contents[0].answers, (dkanswer)->
            answer = new Answer
                id      : String.fromCharCode +dkanswer.answer + 65
                content : if that.options()[+dkanswer.answer] then that.options()[+dkanswer.answer].content() else ''
                score   : dkanswer.score_percentage

            that.options()[+dkanswer.answer].score dkanswer.score_percentage

            ko.utils.arrayForEach dkanswer.knowledge_points, (knowledge)->
                answer.points.push new Point
                    id        : knowledge.id
                    content   : knowledge.name
                    isKeyPoint: knowledge.main is 1
                    tagId     : knowledge.tag_id
                    tagName   : knowledge.tag_name

                that.options()[+dkanswer.answer].points.push new Point
                    id        : knowledge.id
                    content   : knowledge.name
                    isKeyPoint: knowledge.main is 1
                    tagId     : knowledge.tag_id
                    tagName   : knowledge.tag_name
                return

            that.answers.push answer
            that._answer_list.push String.fromCharCode +dkanswer.answer + 65

        return
,
    # type 4
    (gd)->
        that = @

        parseContent = ->
            setTimeout(->
                count = 0
                preview = $ '.content_preview'
                content = preview.html()
                newCont = content.replace /__\$\$__|\\fbox {}/g, (str)->
                    if str is '__$$__'
                        return '<span style="padding:0 20px;border-bottom:1px solid #000;white-space: nowrap;">空' + (++count) + '</span>'

                    if str.indexOf '\fbox {}'
                        return '\\fbox {空'+(++count)+'}'

                preview.html newCont

                preview.find('img[latex]').each (index, element)->
                    latex = $(element).attr 'latex'

                    $.ajax
                        url: 'https://tiku.17zuoye.net/latex/render?r=p&ds=140&m=y&s=' + encodeURIComponent(latex)
                        dataType: "jsonp"
                        jsonp: "cb"
                        success: (data)->
                            $(element).attr 'src', data.url
            , 100)

        #填空题监控题干内容
        @content.beforeSubscribe (newValue, oldValue)->
            #把题干中的填空占位符替换为标号
            parseContent()

            oldBlockCount = oldValue.split("\\fbox {}").length - 1
            newBlockCount = newValue.split("\\fbox {}").length - 1
            oldCount = oldValue.split("__$$__").length - 1 + oldBlockCount
            newCount = newValue.split("__$$__").length - 1 + newBlockCount

            if newCount isnt oldCount
                that.answers.removeAll()
                for i in [0...newCount]
                    answer = new Answer({id: i})
                    that.answers.push answer
                    $tools.initEditor answer._editor_code, that, "answers()[#{i}].content"

                TreeDialogMod.bindInput $ '.answer_nlgs .treeDialog'

            return

        #初始化答案
        ko.utils.arrayForEach gd.content.sub_contents[0].answers, (dkanswer)->
            answer = new Answer
                content     : dkanswer.answer
                score       : dkanswer.score_percentage
                editor_type : dkanswer.rich_text

            ko.utils.arrayForEach dkanswer.knowledge_points, (knowledge)->
                answer.points.push new Point
                    id        : knowledge.id
                    content   : knowledge.name
                    isKeyPoint: knowledge.main is 1
                    tagId     : knowledge.tag_id
                    tagName   : knowledge.tag_name
                return

            that.answers.push answer

        #把题干中的填空占位符替换为标号
        parseContent()

        return
    ,
    # type 5  判断题
    (gd)->
        that = @

        #初始化选项
        ko.utils.arrayForEach gd.content.sub_contents[0].options, (options_content, index)->
            that.options.push new Option
                id      : String.fromCharCode +index + 65
                content : options_content.option
            return


        #初始化答案
        ko.utils.arrayForEach gd.content.sub_contents[0].answers, (dkanswer)->
            answer = new Answer
                id      : String.fromCharCode +dkanswer.answer + 65
                content : if that.options()[+dkanswer.answer] then that.options()[+dkanswer.answer].content() else ''
                score   : dkanswer.score_percentage

            that.options()[+dkanswer.answer].score dkanswer.score_percentage

            ko.utils.arrayForEach dkanswer.knowledge_points, (knowledge)->
                answer.points.push new Point
                    id        : knowledge.id
                    content   : knowledge.name
                    isKeyPoint: knowledge.main is 1
                    tagId     : knowledge.tag_id
                    tagName   : knowledge.tag_name

                that.options()[+dkanswer.answer].points.push new Point
                    id        : knowledge.id
                    content   : knowledge.name
                    isKeyPoint: knowledge.main is 1
                    tagId     : knowledge.tag_id
                    tagName   : knowledge.tag_name
                return

            that.answers.push answer
            that._answer_list String.fromCharCode +dkanswer.answer + 65

        return
,
    # type 6  主观题
    (gd)->
        that = @
        #初始化答案
        if gd.content.sub_contents[0].answers.length is 0
            @answers.push new Answer
                id: 0
        else
            ko.utils.arrayForEach gd.content.sub_contents[0].answers, (dkanswer, index)->
                answer = new Answer
                    id      : index
                    content : dkanswer.answer
                    score   : dkanswer.score_percentage

                ko.utils.arrayForEach dkanswer.knowledge_points, (knowledge)->
                    answer.points.push new Point
                        id        : knowledge.id
                        content   : knowledge.name
                        isKeyPoint: knowledge.main is 1
                        tagId     : knowledge.tag_id
                        tagName   : knowledge.tag_name
                    return


                that.answers.push answer
                return
        return
    ,
    # type 7  连线题
    (gd)->
        that = @
        #初始化选项
        option_id = 0;
        ko.utils.arrayForEach (if gd.content.sub_contents[0].options.length > 0 then gd.content.sub_contents[0].options else []), (option, index)->
            for o, i in option.option
                option_obj =
                    id            : option_id++
                    content       : o
                    position_col  : index + 1
                    position_index: i + 1

                that.options.push new Option option_obj
            return

        #初始化答案
        if gd.content.sub_contents[0].answers.length is 0
            @answers.push new Answer
                id: 0
        else
            ko.utils.arrayForEach gd.content.sub_contents[0].answers, (dkanswer, index)->
                answer = new Answer
                    id      : index
                    content : dkanswer.answer
                    score   : dkanswer.score_percentage

                ko.utils.arrayForEach dkanswer.knowledge_points, (knowledge)->
                    answer.points.push new Point
                        id        : knowledge.id
                        content   : knowledge.name
                        isKeyPoint: knowledge.main is 1
                        tagId     : knowledge.tag_id
                        tagName   : knowledge.tag_name
                    return

                that.answers.push answer
                return
        return

    ,
    # type 8  归类题
    (gd)->
        that = @
        #初始化选项
        ko.utils.arrayForEach (if gd.content.sub_contents[0].options.length > 0 then gd.content.sub_contents[0].options else []), (option, index)->
            option_obj =
                id     : index
                content: option.option

            that.options.push new Option option_obj
            return

        #初始化答案
        if gd.content.sub_contents[0].answers.length is 0
            @answers.push new Answer
                id: 0
        else
            ko.utils.arrayForEach gd.content.sub_contents[0].answers, (dkanswer, index)->
                answer = new Answer
                    id              : index
                    content         : dkanswer.answer
                    classify_name   : dkanswer.classification
                    score           : dkanswer.score_percentage

                ko.utils.arrayForEach dkanswer.knowledge_points, (knowledge)->
                    answer.points.push new Point
                        id        : knowledge.id
                        content   : knowledge.name
                        isKeyPoint: knowledge.main is 1
                        tagId     : knowledge.tag_id
                        tagName   : knowledge.tag_name
                    return

                that.answers.push answer
                return
        return
    ,
    # type 9  排序题
    (gd)->
        that = @
        #初始化选项
        ko.utils.arrayForEach (if gd.content.sub_contents[0].options.length > 0 then gd.content.sub_contents[0].options else []), (option, index)->
            option_obj =
                id     : index
                content: option.option

            that.options.push new Option option_obj
            return

        #初始化答案
        if gd.content.sub_contents[0].answers.length is 0
            @answers.push new Answer
                id: 0
        else
            ko.utils.arrayForEach gd.content.sub_contents[0].answers, (dkanswer, index)->
                answer = new Answer
                    id      : index
                    content : dkanswer.answer
                    score   : dkanswer.score_percentage

                ko.utils.arrayForEach dkanswer.knowledge_points, (knowledge)->
                    answer.points.push new Point
                        id        : knowledge.id
                        content   : knowledge.name
                        isKeyPoint: knowledge.main is 1
                        tagId     : knowledge.tag_id
                        tagName   : knowledge.tag_name
                    return

                that.answers.push answer
                return
        return
    ,
    # type 10
    (gd)->
        that = @

        #初始化选项
        ko.utils.arrayForEach gd.content.sub_contents[0].options, (options_content, index)->
            that.options.push new Option
                id      : String.fromCharCode +index + 65
                content : options_content.option
            return

        parseContent = ->
            setTimeout(->
                count = 0
                preview = $('.content_preview')
                content = preview.html()
                newCont = content.replace(/__\$\$__/g, ->
                    return '<span style="padding:0 20px;border-bottom:1px solid #000;white-space: nowrap;">空' + (++count) + '</span>')
                preview.html newCont
                preview.find('img[latex]').each (index, element)->
                    latex = $(element).attr 'latex'
                    newLatex = latex.replace /\\fbox {}/g, ->
                        return '\\fbox {空'+(++count)+'}'
                    $.ajax
                        url: 'https://tiku.17zuoye.net/latex/render?r=p&ds=140&m=y&s=' + encodeURIComponent(newLatex)
                        dataType: "jsonp"
                        jsonp: "cb"
                        success: (data)->
                            $(element).attr 'src', data.url
            , 100)

        #填空题监控题干内容
        @content.beforeSubscribe (newValue, oldValue)->
            #把题干中的填空占位符替换为标号
            parseContent()
            
            oldBlockCount = oldValue.split("\\fbox {}").length - 1
            newBlockCount = newValue.split("\\fbox {}").length - 1
            oldCount = oldValue.split("__$$__").length - 1 + oldBlockCount
            newCount = newValue.split("__$$__").length - 1 + newBlockCount

            if newCount isnt oldCount
                that.answers.removeAll()
                for i in [0...newCount]
                    answer = new Answer({id: i})
                    that.answers.push answer

                TreeDialogMod.bindInput $ '.answer_nlgs .treeDialog'
            return

        #初始化答案
        ko.utils.arrayForEach gd.content.sub_contents[0].answers, (dkanswer)->
            answer = new Answer
                content : String.fromCharCode +dkanswer.answer + 65
                score   : dkanswer.score_percentage

            ko.utils.arrayForEach dkanswer.knowledge_points, (knowledge)->
                answer.points.push new Point
                    id        : knowledge.id
                    content   : knowledge.name
                    isKeyPoint: knowledge.main is 1
                    tagId     : knowledge.tag_id
                    tagName   : knowledge.tag_name
                return

            that.answers.push answer

        return
    ,
    # type 11
    (gd)->
        that = @
        #初始化选项
        ko.utils.arrayForEach (if gd.content.sub_contents[0].oral_dict.options?.length > 0 then gd.content.sub_contents[0].oral_dict.options else []), (option, index)->
            that.options.push new Option
                id          : String.fromCharCode +index + 65
                content     : option.text
                voice_texts : option.voice_texts
            return

        #初始化答案
        ko.utils.arrayForEach gd.content.sub_contents[0].answers, (dkanswer)->
            answer = new Answer
                id      : String.fromCharCode +dkanswer.answer + 65
                content : if that.options()[+dkanswer.answer] then that.options()[+dkanswer.answer].content() else ''
                score   : dkanswer.score_percentage

            that.options()[+dkanswer.answer].score dkanswer.score_percentage

            ko.utils.arrayForEach dkanswer.knowledge_points, (knowledge)->
                answer.points.push new Point
                    id        : knowledge.id
                    content   : knowledge.name
                    isKeyPoint: knowledge.main is 1
                    tagId     : knowledge.tag_id
                    tagName   : knowledge.tag_name
                that.options()[+dkanswer.answer].points.push new Point
                    id        : knowledge.id
                    content   : knowledge.name
                    isKeyPoint: knowledge.main is 1
                    tagId     : knowledge.tag_id
                    tagName   : knowledge.tag_name
                return

            that.answers.push answer
            that._answer_list String.fromCharCode +dkanswer.answer + 65

        @seconds = ko.observable gd.content.sub_contents[0].oral_dict.seconds || 0
        @pic_url = ko.observable gd.content.sub_contents[0].oral_dict.pic_url || ''
        @pic_name = ko.observable gd.content.sub_contents[0].oral_dict.pic_name || ''

        return
,
    # type 12
    (gd)->
        that = @
        #初始化选项
        @voice_text = ko.observable gd.content.sub_contents[0].oral_dict.voice_text || ''
        @seconds = ko.observable gd.content.sub_contents[0].oral_dict.seconds || 0
        @pic_url = ko.observable gd.content.sub_contents[0].oral_dict.pic_url || ''
        @pic_name = ko.observable gd.content.sub_contents[0].oral_dict.pic_name || ''

        return
,
    # type 13
    (gd)->
        that = @
        ko.utils.arrayForEach (if gd.content.sub_contents[0].oral_dict.options?.length > 0 then gd.content.sub_contents[0].oral_dict.options else []), (role, index)->
            that.roles.push new Role
                id          : index
                name        : role.name
                content     : role.text
                voice_texts : role.voice_texts
                seconds     : role.seconds
                role_type   : role.role_type
                resource    : new Resource
                    name    : role.listen_name
                    url     : role.listen_url

            return

        @seconds = ko.observable gd.content.sub_contents[0].oral_dict.seconds || 0
        @pic_url = ko.observable gd.content.sub_contents[0].oral_dict.pic_url || ''
        @pic_name = ko.observable gd.content.sub_contents[0].oral_dict.pic_name || ''

        return
,
    # type 14 跟读
    (gd)->
        that = @
        ko.utils.arrayForEach (if gd.content.sub_contents[0].oral_dict.options?.length > 0 then gd.content.sub_contents[0].oral_dict.options else []), (option, index)->
            that.roles.push new Role
                id          : index
                content     : option.text
                voice_text  : option.voice_text
                seconds     : option.seconds
                resource    : new Resource
                    name    : option.listen_name
                    url     : option.listen_url
            return

        @seconds = ko.observable gd.content.sub_contents[0].oral_dict.seconds || 0
        @pic_url = ko.observable gd.content.sub_contents[0].oral_dict.pic_url || ''
        @pic_name = ko.observable gd.content.sub_contents[0].oral_dict.pic_name || ''

        return
,
    # type 15 口语开放题
    (gd)->
        that = @

        @variables = ko.observableArray []
        ko.utils.arrayForEach gd.content.sub_contents[0].oral_dict.variables || [], (variable)->
            that.variables.push new Variable variable
            return

        @sentence_patterns = ko.observableArray []
        ko.utils.arrayForEach gd.content.sub_contents[0].oral_dict.sentence_patterns || [], (sentence_pattern)->
            that.sentence_patterns.push new SentencePattern sentence_pattern
            return

        @keywords = ko.observableArray []
        ko.utils.arrayForEach gd.content.sub_contents[0].oral_dict.keywords || [], (keyword)->
            that.keywords.push new Keyword keyword
            return

        @seconds = ko.observable gd.content.sub_contents[0].oral_dict.seconds || 0
        @pic_url = ko.observable gd.content.sub_contents[0].oral_dict.pic_url || ''
        @pic_name = ko.observable gd.content.sub_contents[0].oral_dict.pic_name || ''
        return
]

back = [
    # 0
    (gd)->
,
    # 1
    (gd)->
        gd.content.sub_contents[0].answers = []
        ko.utils.arrayForEach @answers(), (answer)->
            dkanswer =
                answer              : answer.id().charCodeAt() - 65
                score_percentage    : answer.score()
                knowledge_points    : []

            ko.utils.arrayForEach answer.points(), (point)->
                dkanswer.knowledge_points.push
                    id      : point.id()
                    name    : point.content()
                    main    : if point.isKeyPoint() then 1 else 0
                    tag_id  : point.tagId()
                    tag_name: point.tagName()

            gd.content.sub_contents[0].answers.push dkanswer

            return
        return
,
    # 2
    (gd)->
        gd.content.sub_contents[0].answers = []
        ko.utils.arrayForEach @answers(), (answer)->
            dkanswer =
                answer              : answer.id().charCodeAt() - 65
                score_percentage    : answer.score()
                knowledge_points    : []

            ko.utils.arrayForEach answer.points(), (point)->
                dkanswer.knowledge_points.push
                    id      : point.id()
                    name    : point.content()
                    main    : if point.isKeyPoint() then 1 else 0
                    tag_id  : point.tagId()
                    tag_name: point.tagName()

            gd.content.sub_contents[0].answers.push dkanswer

            return
        return
,
    # 3
    (gd)->
        gd.content.sub_contents[0].answers = []
        ko.utils.arrayForEach @answers(), (answer)->
            dkanswer =
                answer              : answer.id().charCodeAt() - 65
                score_percentage    : answer.score()
                knowledge_points    : []

            ko.utils.arrayForEach answer.points(), (point)->
                dkanswer.knowledge_points.push
                    id      : point.id()
                    name    : point.content()
                    main    : if point.isKeyPoint() then 1 else 0
                    tag_id  : point.tagId()
                    tag_name: point.tagName()

            gd.content.sub_contents[0].answers.push dkanswer
        return
,
    # 4
    (gd)->
        gd.content.sub_contents[0].answers = []
        ko.utils.arrayForEach @answers(), (answer)->
            dkanswer =
                answer              : answer.content()
                score_percentage    : answer.score()
                rich_text           : answer.editor_type()
                knowledge_points    : []

            ko.utils.arrayForEach answer.points(), (point)->
                dkanswer.knowledge_points.push
                    id      : point.id()
                    name    : point.content()
                    main    : if point.isKeyPoint() then 1 else 0
                    tag_id  : point.tagId()
                    tag_name: point.tagName()

            gd.content.sub_contents[0].answers.push dkanswer

            return
        return
,
    # 5
    (gd)->
        gd.content.sub_contents[0].answers = []
        ko.utils.arrayForEach @answers(), (answer)->
            dkanswer =
                answer              : answer.id().charCodeAt() - 65
                score_percentage    : answer.score()
                knowledge_points    : []

            ko.utils.arrayForEach answer.points(), (point)->
                dkanswer.knowledge_points.push
                    id      : point.id()
                    name    : point.content()
                    main    : if point.isKeyPoint() then 1 else 0
                    tag_id  : point.tagId()
                    tag_name: point.tagName()

            gd.content.sub_contents[0].answers.push dkanswer
            return
        return
,
    # 6
    (gd)->
        gd.content.sub_contents[0].answers = []
        ko.utils.arrayForEach @answers(), (answer)->
            dkanswer =
                answer              : answer.content()
                score_percentage    : answer.score()
                knowledge_points    : []

            ko.utils.arrayForEach answer.points(), (point)->
                dkanswer.knowledge_points.push
                    id      : point.id()
                    name    : point.content()
                    main    : if point.isKeyPoint() then 1 else 0
                    tag_id  : point.tagId()
                    tag_name: point.tagName()

            gd.content.sub_contents[0].answers.push dkanswer

            return
        return
,
    # 7  连线题
    (gd)->
        gd.content.sub_contents[0].answers = []
        ko.utils.arrayForEach @answers(), (answer)->
            dkanswer =
                answer              : answer.content().replace(/，/g, ',')
                score_percentage    : answer.score()
                knowledge_points    : []

            ko.utils.arrayForEach answer.points(), (point)->
                dkanswer.knowledge_points.push
                    id      : point.id()
                    name    : point.content()
                    main    : if point.isKeyPoint() then 1 else 0
                    tag_id  : point.tagId()
                    tag_name: point.tagName()

            gd.content.sub_contents[0].answers.push dkanswer

            return
        return
,
    # 8  归类题
    (gd)->
        gd.content.sub_contents[0].answers = []
        ko.utils.arrayForEach @answers(), (answer)->
            dkanswer =
                answer              : answer.content().replace(/，/g, ',')
                score_percentage    : answer.score()
                classification      : answer.classify_name()
                knowledge_points    : []

            ko.utils.arrayForEach answer.points(), (point)->
                dkanswer.knowledge_points.push
                    id      : point.id()
                    name    : point.content()
                    main    : if point.isKeyPoint() then 1 else 0
                    tag_id  : point.tagId()
                    tag_name: point.tagName()

            gd.content.sub_contents[0].answers.push dkanswer
            return
        return
,
    # 9  排序题
    (gd)->
        gd.content.sub_contents[0].answers = []
        ko.utils.arrayForEach @answers(), (answer)->
            dkanswer =
                answer              : answer.content().replace(/，/g, ',')
                score_percentage    : answer.score()
                knowledge_points    : []

            ko.utils.arrayForEach answer.points(), (point)->
                dkanswer.knowledge_points.push
                    id      : point.id()
                    name    : point.content()
                    main    : if point.isKeyPoint() then 1 else 0
                    tag_id  : point.tagId()
                    tag_name: point.tagName()

            gd.content.sub_contents[0].answers.push dkanswer
            return
        return
,
    # 10  选词填空
    (gd)->
        gd.content.sub_contents[0].answers = []
        invalidArray = []
        ko.utils.arrayForEach @answers(), (answer, index)->
            invalidArray.push (index+1) if answer.content() is ''
            dkanswer =
                answer              : answer.content().charCodeAt() - 65
                score_percentage    : answer.score()
                knowledge_points    : []

            ko.utils.arrayForEach answer.points(), (point)->
                dkanswer.knowledge_points.push
                    id      : point.id()
                    name    : point.content()
                    main    : if point.isKeyPoint() then 1 else 0
                    tag_id  : point.tagId()
                    tag_name: point.tagName()

            gd.content.sub_contents[0].answers.push dkanswer
            return
        if invalidArray.length > 0
            alert('第 '+invalidArray.join(',')+ ' 空未填写答案！');
            return false
        return
,
    # 11
    (gd)->
        gd.content.sub_contents[0].answers = []
        ko.utils.arrayForEach @answers(), (answer)->
            dkanswer =
                answer              : answer.id().charCodeAt() - 65
                score_percentage    : answer.score()
                knowledge_points    : []

            ko.utils.arrayForEach answer.points(), (point)->
                dkanswer.knowledge_points.push
                    id      : point.id()
                    name    : point.content()
                    main    : if point.isKeyPoint() then 1 else 0
                    tag_id  : point.tagId()
                    tag_name: point.tagName()

            gd.content.sub_contents[0].answers.push dkanswer
            return

        gd.content.sub_contents[0].oral_dict.seconds = @seconds()
        gd.content.sub_contents[0].oral_dict.pic_url = @pic_url()
        gd.content.sub_contents[0].oral_dict.pic_name = @pic_name()

        return
,
    # 12
    (gd)->
        gd.content.sub_contents[0].oral_dict.voice_text = @voice_text()
        gd.content.sub_contents[0].oral_dict.seconds = @seconds()
        gd.content.sub_contents[0].oral_dict.pic_url = @pic_url()
        gd.content.sub_contents[0].oral_dict.pic_name = @pic_name()

        return
,
    # 13
    (gd)->
        gd.content.sub_contents[0].oral_dict.options = []
        ko.utils.arrayForEach @roles(), (role)->
            voice_texts = []

            ko.utils.arrayForEach role.voice_texts(), (voice)->
                voice_texts.push voice.content()
                return

            gd.content.sub_contents[0].oral_dict.options.push
                name        : role.name()
                text        : role.content()
                voice_texts : voice_texts
                seconds     : +role.seconds()
                role_type   : +role.role_type()
                listen_name : role.resource.name()
                listen_url  : role.resource.url()

            return

        gd.content.sub_contents[0].oral_dict.seconds = @seconds()
        gd.content.sub_contents[0].oral_dict.pic_url = @pic_url()
        gd.content.sub_contents[0].oral_dict.pic_name = @pic_name()

        return
,
    # 14
    (gd)->
        gd.content.sub_contents[0].oral_dict.options = []
        ko.utils.arrayForEach @roles(), (role)->
            gd.content.sub_contents[0].oral_dict.options.push
                name        : role.name()
                text        : role.content()
                voice_text  : role.voice_text()
                seconds     : +role.seconds()
                listen_name : role.resource.name()
                listen_url  : role.resource.url()

            return

        gd.content.sub_contents[0].oral_dict.seconds = @seconds()
        gd.content.sub_contents[0].oral_dict.pic_url = @pic_url()
        gd.content.sub_contents[0].oral_dict.pic_name = @pic_name()

        return
,
    # type 15 口语开放题
    (gd)->
        that = @

        gd.content.sub_contents[0].oral_dict.variables = []
        ko.utils.arrayForEach @variables(), (variable)->
            gd.content.sub_contents[0].oral_dict.variables.push variable.content() if variable.content() isnt ''
            return

        gd.content.sub_contents[0].oral_dict.sentence_patterns = []
        ko.utils.arrayForEach @sentence_patterns(), (sentence_pattern)->
            gd.content.sub_contents[0].oral_dict.sentence_patterns.push sentence_pattern.content() if sentence_pattern.content() isnt ''
            return

        gd.content.sub_contents[0].oral_dict.keywords = []
        ko.utils.arrayForEach @keywords(), (keyword)->
            gd.content.sub_contents[0].oral_dict.keywords.push keyword.content() if keyword.content() isnt ''
            return

        gd.content.sub_contents[0].oral_dict.seconds = @seconds()
        gd.content.sub_contents[0].oral_dict.pic_url = @pic_url()
        gd.content.sub_contents[0].oral_dict.pic_name = @pic_name()

        return
]


@BigDady = BigDady
