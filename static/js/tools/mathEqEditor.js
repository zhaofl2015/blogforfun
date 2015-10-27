/*数学公式编辑器*/
(function () {
    UE.registerUI('matheq', function (editor, uiName) {
        editor.registerCommand('matheq', {
            execCommand: function () {
                var $img, dialog;
                $img = $(editor.selection.getStart());
                var url = "/latex/editor";
                if ($img.prop("tagName") == "IMG") {
                    url+="?latex="+encodeURIComponent($img.attr('latex'));
                }
                dialog = new UE.ui.Dialog({
                    iframeUrl: url,
                    editor: editor,
                    name: uiName,
                    title: "公式输入框",
                    cssRules: "width:590px; height:550px;",
                    buttons: [
                        {
                            className: 'edui-okbutton',
                            label: '确定',
                            onclick: function () {
                                var latex = $("iframe:last").contents().find('#matheq-latex').val();
                                if (latex) {
                                    $.ajax({
                                        url: 'https://tiku.17zuoye.net/latex/render?r=p&ds=140&m=y&s=' + encodeURIComponent(latex),//TODO 调试方便先请求tiku.17zuoye.net
                                        dataType: "jsonp",
                                        jsonp: "cb",//callback function parameter
                                        error: function () {
                                            alert('发生错误，请联系管理员。');
                                        },
                                        success: function (data) {
                                            if (data.error) {
                                                alert('发生错误，请联系管理员。错误代码：' + data.error.toString());
                                            } else {
                                                editor.execCommand('insertHtml', '<img latex="' + data.escaped_latex + '" src="' + data.url + '" />');

                                                $("body").trigger("update_model", [editor.getContent(), editor.key]);

                                                dialog.close(false);
                                            }
                                        }
                                    });
                                }
                            }
                        },
                        {
                            className: 'edui-cancelbutton',
                            label: '取消',
                            onclick: function () {
                                dialog.close(false);
                            }
                        }
                    ]
                });
                dialog.render();

                return dialog.open();

            }
        });
        var btn;
        var iconUrl = editor.options.UEDITOR_HOME_URL + 'kityformula-plugin/kf-icon.png'; //TODO 图片最好不依赖kf
        btn = new UE.ui.Button({
            name: 'dialogbutton' + uiName,
            title: 'dialogbutton' + uiName,
            cssRules: 'background: url("' + iconUrl + '") !important',
            onclick: function () {
                editor.execCommand('matheq');
            }
        });
        return btn;
    });

}).call(this);

