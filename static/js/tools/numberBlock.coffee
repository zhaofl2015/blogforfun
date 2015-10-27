UE.registerUI 'numberblock', (editor, uiName)->
    editor.registerCommand "set_number_block",
        execCommand: ->
            $img = $ editor.selection.getStart()

            if $img.prop("tagName") isnt "IMG"
                alert "请选择图片之后再点击此按钮"
                return no
            else
                dialog = new UE.ui.Dialog
                    iframeUrl: "/xx/questions/img_iframe?img_url=#{$img.attr('src')}&width=#{$img.width()}&height=#{$img.height()}"
                    editor   : editor
                    name     : uiName
                    title    : "图标加输入框"
                    cssRules : "width:#{$img.width() + 50}px; height:#{$img.height() + 50}px;"
                    buttons  : [
                        className: 'edui-okbutton'
                        label    : '确定'
                        onclick  : ->
                            $jcrop = $("iframe:last").contents().find("body #img-wrap")
                            $jcrop.find(".temporary").remove()
                            $img.after $ "<div id='img_parent' style='position: relative;'></div>" if $img.parents(".view").find("#img_parent").length==0
                            $img_parent = $img.parents(".view").find "#img_parent"
                            $img_parent.append $img.clone()
                            $jcrop.find('.add-box').css({color: '#F00', border: '2px solid #F00'})
                            blockhtml = $jcrop.html()
                            blockCount = $img_parent.find('.add-box').length
                            blockhtml = blockhtml.replace /__\$\$__/g, ->
                                return ++blockCount
                            $img_parent.append blockhtml
                            $img.remove()

                            $("body").trigger "update_model", [editor.getContent(), editor.key]

                            dialog.close yes

                            return
                    ,
                        className: 'edui-cancelbutton',
                        label    : '取消'
                        onclick  : ->
                            dialog.close no
                            return
                    ]

                dialog.render()
                dialog.open()


    btn = new UE.ui.Button
        name    : 'dialogbtn'+ uiName
        title   : 'dialogbtn'+ uiName
        cssRules: 'background: url(/static/img/pen.png) !important'
        #cssRules: 'background-position: -381px 0;'
        onclick: ->
            editor.execCommand "set_number_block"

            return

    return btn