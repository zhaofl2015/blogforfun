UE.registerUI 'dialog', (editor, uiName)->
    editor.registerCommand "check_img_tag",
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
                            $img_parent.append $jcrop.html()
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
        name    : 'dialogbutton' + uiName
        title   : 'dialogbutton' + uiName
        cssRules: 'background-position: -381px 0;'
        onclick: ->
            editor.execCommand "check_img_tag"

            return

    return btn