UE.registerUI 'button', (editor, uiName)->
    new UE.ui.Button
        name    : uiName
        title   : '添加占位符'
        cssRules: 'background-position: -240px -19px;'
        onclick : ->
            editor.execCommand "insertHtml", "__$$__"

            $("body").trigger("update_model", [editor.getContent(), editor.key]);
            return