class attr_workbook_content
    workbook_contents: ko.observableArray []

    search_workbook_content_name: ko.observable ''
    search_workbook_category_id: ko.observable ''
    search_num : ko.observable ''
    is_part : ko.observable false
    part_index : ko.observable 0
    number_voice_text : ko.observable ''

    search_workbook_content: ->
        that = @
        $.popbox
            title: '选择所属教辅'
            customPos:
                marginTop: '-260px'
            content: '<div class="workbookpanel"><div class="row"><div class="col-sm-6"><select class="form-control chooseseries"><option value="-1">选择所属丛书</option></select></div><div class="col-sm-6"><select class="form-control chooseworkbook"><option value="-1">选择教辅名称</option></select></div></div><div class="catalogtree"><ul class="ztree"></ul></div></div>'
            onOpen: ->
                #获取所属丛书列表
                $.post('/workbook/service-get-workbook-series', {subject_id: that.subject_id}).success (data)->
                    if data.success
                        html = '<option value="-1">选择所属丛书</option>'
                        html += '<option value="'+s.id+'">'+s.name+'</option>' for s in data.data
                        $('.chooseseries').html(html).unbind('change').change ->
                            workbook_series_id = $(this).val()
                            that._search_workbook_list(workbook_series_id) if workbook_series_id isnt '-1'
                    else
                        $tools.msgTip('获取丛书列表数据失败，请重试')
            onOk: ->
                #如果选中了节点，更新vm中的值
                checked = that.wbTree.getCheckedNodes(true)
                if checked.length>0
                    c = checked[0]
                    that.search_workbook_category_id c.parent_workbook_catalog_id
                    that.search_workbook_content_name c.name
                    that.is_part c.is_part
                    that.part_index c.part_index
                else
                    return false
                
        return
    #搜索教辅名称列表
    _search_workbook_list: (workbook_series_id)->
        that = @
        $.post('/workbook/service-get-workbooks', {workbook_series_id: workbook_series_id}).success (data)->
            if data.success
                html = '<option value="-1">选择教辅名称</option>'
                html += '<option value="'+w.id+'">'+w.title+'</option>' for w in data.data
                $('.chooseworkbook').html(html).unbind('change').change ->
                    workbook_id = $(this).val()
                    that._search_workbood_catalog(workbook_id) if workbook_id isnt '-1'
                $('.pb_container:visible .catalogtree .ztree').html ''
            else
                $tools.msgTip('获取教辅列表数据失败，请重试')
        return
    #搜索教辅目录树
    _search_workbood_catalog: (workbook_id)->
        that = @
        $tools.ajax
            url: '/workbook/service-get-workbook-catalog'
            data: {workbook_id: workbook_id}
            showLoadingMask: false
            success: (data)->
                if data.data.length>0
                    data = that._format_catalog_data data.data
                    setting = 
                        check:
                            enable: true
                            chkStyle: "radio"
                            radioType: "all"
                        view:
                            selectedMulti: false
                        async: 
                            url: '/workbook/service-get-workbook-catalog',
                            enable: true,
                            dataType: 'json',
                            autoParam: ['parent_workbook_catalog_id'],
                            dataFilter: (treeId, parentNode, responseData)->
                                return that._format_catalog_data responseData.data
                            
                    that.wbTree = $.fn.zTree.init($(".catalogtree .ztree"), setting, data);
                else
                    $('.pb_container:visible .catalogtree .ztree').text '暂无数据'
        return

    #对教辅目录的数据进行格式化
    _format_catalog_data: (data)->
        result = []
        result.push {parent_workbook_catalog_id:d.id||d.workbook_catalog_id, name: d.name||d.title, isParent: d.could_expand, chkDisabled: !d.could_add_question, is_part: d.is_part, part_index: d.part_index} for d in data
        return result
    #添加教辅试题集
    add_workbook_content: ->
        if @search_workbook_category_id() and @search_num()
            @.workbook_contents.push
                id: @search_workbook_category_id()
                name: @search_workbook_content_name()
                number: @search_num()
                is_part: @is_part()
                part_index: @part_index()
                detail: ''
                number_voice_text: @number_voice_text()
            @search_workbook_category_id ''
            @search_workbook_content_name ''
            @search_num ''
            @number_voice_text ''


@attr_workbook_content = attr_workbook_content