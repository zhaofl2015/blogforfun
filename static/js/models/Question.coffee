class Question extends SuperClass
    __random_code__ : ''
    setRandomCode   : ->
        @__random_code__ = $tools.guid "xxxxxxxxxx_xxxxxxxxxx_xxxxxxxxxx"
    getRandomCode   : ->
        @__random_code__

    @include attr_content_type
    @include attr_difficulty
    @include attr_paper
    @include attr_resource
    @include attr_roles
    @include attr_subject
    @include attr_point
    @include attr_analysis
    @include attr_workbook_content

    @include BigDady

    constructor: (obj)->
        @id = ko.observable if obj? and obj.id? then obj.id else ''
        @nid = ko.observable if obj? and obj.nid? then obj.nid else 0
        @seconds = ko.observable if obj? and obj.seconds? then obj.seconds else 0
        @content = ko.observable if obj? and obj.content? then obj.content else ''
        @content_editor_code = $tools.guid "content_xxxxxxxxxxxxxxxxxxxxxxxxxx"
        @options = ko.observableArray if obj? and obj.options? then obj.options else []
        @answers = ko.observableArray if obj? and obj.answers? then obj.answers else []
        @_answer_list = ko.observableArray []
        @hide_option_number = ko.observable if obj? and obj.hide_option_number? then obj.hide_option_number else no
        @template_name = ko.observable if obj? and obj.template_name? then obj.template_name else ''
        @review_template_name = ko.observable if obj? and obj.review_template_name? then obj.review_template_name else ''
        @description = ko.observable if obj? and obj.description? then obj.description else ''
        @sub_index = ko.observable if obj? and obj.sub_index? then obj.sub_index else ''
        @question_type = ko.observable if obj? and obj.question_type? then obj.question_type else 0

        #标记表单是否可提交，默认不失效
        @submit_disable = ko.observable false

        #图片上传进度内部变量
        @__images_uploading = []

        that = @

        $("body").on "beforeInsertImage_tk", ->
            that.__images_uploading.push yes
            that.submit_disable yes if that.__images_uploading.length > 0
            return yes

        $("body").on "afterInsertImage_tk", ->
            that.__images_uploading.pop()
            that.submit_disable no if that.__images_uploading.length is 0
            return yes

        @content.subscribe (newValue)->
            that.content $tools.replaceAll newValue, "data-bind", ""
            return

        @analysis.subscribe (newValue)->
            that.analysis $tools.replaceAll newValue, "data-bind", ""
            return

    _reset_options_id: (self)->
        ko.utils.arrayForEach @options(), (option, index)->
            switch self.content_type_id()
                when 1,2,3,5,11 then opt_id = String.fromCharCode index + 65
                when 7,8,9   then opt_id = index
                else opt_id = String.fromCharCode index + 65
            option.id opt_id
            #重新绑定富文本编辑器
            if self.content_type_id() != 11
                editor = UE.getEditor option._editor_code
                $(editor.window.document.body).attr('data-bind', 'editorinput:options()[' + index + '].content')
                ko.cleanNode editor.window.document.body
                ko.applyBindings self,editor.window.document.body
            return

        return
    add_option: (display_number, disable_editor)->
        option = new Option
            id      : if display_number==1 then @options().length else String.fromCharCode @options().length + 65
            content : ''

        @options.push option

        TreeDialogMod.bindInput $ '.answer_nlgs .treeDialog'
        if disable_editor? and disable_editor in [11, 12, 13] then return
        $tools.initEditor option._editor_code, @, "options()[#{@options().length - 1}].content"
        return
    delete_option: (self)->
        that = @
        #如果是排序题，则不删除答案，排序题的答案固定有一个
        if self.content_type_id() in [1,2,3,5,11]
            ko.utils.arrayForEach self.answers(), (answer)->
                self.answers.remove answer if answer.id() is that.id()
                return
            self._answer_list []
            ko.utils.arrayForEach self.answers(), (answer)->
                self._answer_list.push answer.id()

        self.options.remove that

        self._reset_options_id(self)

        return
    add_answer: ->
        @answers.push new Answer
            id: @answers().length
        TreeDialogMod.bindInput $ '.treeDialog'
        return
    delete_answer: (self)->
        self.answers.remove @
        ko.utils.arrayForEach self.answers(), (answer, index)->
            answer.id index
            return
        return
    submit: (question, refresh)->
        that = @

        #如果未选择试卷，进行提示。小学数学除外
        if that.papers().length == 0 and @.subject_id() isnt 102
            confirm = window.confirm('所属试卷未选择，继续提交吗？');
            if !confirm
                return

        #校验失败，则直接返回
        validPass = that.Recycling(question)
        return false if validPass is false
                
        that.submit_disable true

        #console.info(that.Recycling(question));return false;
        submit_data = that.Recycling question

#        console.info submit_data
#        console.info JSON.stringify submit_data

        #获取教辅数据
        workbooks = that.getWorkbookData()
        #console.log(workbooks); return false;

        if submit_data
            $tools.ajax
                url: '/xx/questions/edit'
                data: {content: JSON.stringify(submit_data), workbooks: JSON.stringify(workbooks)}
                success: (data)->
                    $tools.msgTip '操作成功', 'success'
                    setTimeout ->
                        if refresh
                            history.go 0
                        else
                            window.close()
                    , 1000
                complete: ->
                    setTimeout ->
                        that.submit_disable false
                    , 1000
        else
            that.submit_disable false
        return false;
    refreshPreview: (question)->
        window.question = @.Recycling question
        $('#previewiframe')[0].contentWindow.location.reload() if window.question
    pcPreview: (id)->
        #如果有id，说明是已保存过的试题。否则是未保存的，把试题数据发送过去
        if id
            window.open('/xx/questions/preview-pc-wrap?question_id='+id+'&subject_id='+@subject_id());
        else
            q = @.Recycling question
            q_clone = {};
            q_clone = $.extend(q_clone, q);
            delete q_clone.content_type_choices
            json = JSON.stringify q_clone
            param = encodeURIComponent(json)
            window.open('/xx/questions/preview-pc-wrap?questiondata='+param+'&subject_id='+@subject_id());
    mobilePreview: ->
        iframe = $('#previewiframe')
        iframe.attr('src', iframe.data('src'))
    #检查相似题，resource_type: 材料题的材料类型，1：音频，2：材料文本
    checkDuplicate: (resource_type)->
        that = @

        #判断是否是材料题
        if that.text
            if that.text() or that.resource().id()
                loading = $.popbox
                    width: 360
                    title: '系统提示'
                    showBtn: false
                    showCloseBtn: false
                    content: '<div class="text-center"><img src="/static/img/loading.gif" class="mr_20" alt="请稍等..."><span>正在检测重题目相似性</span></div>'

                file_id = if resource_type is '1' then @resource().id() else ''
                text = if resource_type is '2' then @text() else ''

                $.ajax
                    url: '/xx/questions/duplicate-resource'
                    type: 'POST'
                    data: {text: text, subject_id: @subject_id(), file_id: file_id, resource_type_id: @resource_type_id(), resource_id: @id()}
                    success: (data)->
                        loading.close()
                        if data.success
                            if data.resource_ids.length > 0
                                formstr = '<form id="duplicateForm" target="_blank" method="POST" action="/xx/questions/duplicate-list">'
                                formstr += '<input type="hidden" name="subject_id" value="'+that.subject_id()+'">'
                                formstr += '<input type="hidden" name="resource_ids[]" value="'+id+'">' for id,index in data.resource_ids
                                formstr += '</form>'
                                
                                $.popbox
                                    width: 360
                                    title: '系统提示'
                                    content: '<div class="text-center"><i class="glyphicon glyphicon-ok-circle icon-right text-success"></i><span>检测到有相似题目，立即去查看？</span></div>'+formstr
                                    onOk: ->
                                        $('#duplicateForm').submit()
                                        
                            else
                                $.popbox
                                    width: 360
                                    title: '系统提示'
                                    content: '<div class="text-center"><i class="glyphicon glyphicon-remove-circle icon-wrong text-danger"></i><span>未检测到相似题目</span></div>'
                        else
                            $.popbox
                                width: 360
                                title: '系统提示'
                                content: '<div class="text-center"><i class="glyphicon glyphicon-remove-circle icon-wrong text-danger"></i><span>未检测到相似题目</span></div>'
                    error: ->
                        loading.close()
                        $tools.msgTip '请求失败请重试！'
        else
            if @content()
                loading = $.popbox
                    width: 360
                    title: '系统提示'
                    showBtn: false
                    showCloseBtn: false
                    content: '<div class="text-center"><img src="/static/img/loading.gif" class="mr_20" alt="请稍等..."><span>正在检测重题目相似性</span></div>'

                complex = if @.content_type_id() is 0 then 1 else 0

                $.ajax
                    url: '/xx/questions/duplicate'
                    type: 'POST'
                    data: {content: @content(), subject_id: @subject_id(), complex: complex, question_id: @id()}
                    success: (data)->
                        loading.close()
                        if data.success
                            if data.question_ids.length > 0
                                formstr = '<form id="duplicateForm" target="_blank" method="POST" action="/xx/questions/duplicate-list">'
                                formstr += '<input type="hidden" name="subject_id" value="'+that.subject_id()+'">'
                                formstr += '<input type="hidden" name="question_ids[]" value="'+id+'">' for id,index in data.question_ids
                                formstr += '</form>'
                                
                                $.popbox
                                    width: 360
                                    title: '系统提示'
                                    content: '<div class="text-center"><i class="glyphicon glyphicon-ok-circle icon-right text-success"></i><span>检测到有相似题目，立即去查看？</span></div>'+formstr
                                    onOk: ->
                                        $('#duplicateForm').submit()
                                        
                            else
                                $.popbox
                                    width: 360
                                    title: '系统提示'
                                    content: '<div class="text-center"><i class="glyphicon glyphicon-remove-circle icon-wrong text-danger"></i><span>未检测到相似题目</span></div>'
                        else
                            $.popbox
                                width: 360
                                title: '系统提示'
                                content: '<div class="text-center"><i class="glyphicon glyphicon-remove-circle icon-wrong text-danger"></i><span>未检测到相似题目</span></div>'
                    error: ->
                        loading.close()
                        $tools.msgTip '请求失败请重试！'

@Question = Question