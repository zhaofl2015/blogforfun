/**
 * Created by chong.liu on 2015/6/23.
 */
var curMatheqIframe = null; // 当前使用的窗口iframe
CKEDITOR.plugins.add( 'matheq', {
	init: function( editor ) {
		editor.addCommand( 'matheq', new CKEDITOR.dialogCommand( 'matheq', {
			allowedContent: 'img[latex,!src]',
			requiredContent: 'img'
		} ) );
		editor.ui.addButton( 'matheq', {
            label: '公式编辑器',
            command: 'matheq',
            icon:'/static/js/editor/latex_editor/formula-icon.png'
		} );
		CKEDITOR.dialog.add( 'matheq', function( editor ){
            return {
                title: '公式编辑器',
                minWidth: 580,
                minHeight: 480,
                contents: [
                    {
                        id: 'tab1',
                        label: '',
                        title: '',
                        expand: true,
                        padding: 0,
                        elements: [
                            {
                                type: 'html',
                                html: '<iframe frameBorder="0" style="border:none; padding: 0px; margin: 0px; height: 440px; width: 590px;" src="/latex/editor">'
                            }
                        ]
                    }
                ],
                onShow: function() {
                    curMatheqIframe = $('iframe:visible')[0];
                },
                onOk: function() {
                    var latex = $.trim(curMatheqIframe.contentWindow.$('#matheq-latex').val());
                    if (latex) {
                        $.ajax({
                            url: 'https://tiku.17zuoye.net/latex/render?r=j&m=y&s=' + encodeURIComponent(latex),   // 要去掉http://tiku.17zuoye.net
                            dataType: 'json',
                            error: function(){alert('服务器错误，请联系管理员。');},
                            success: function(data){
                                if (data.error){
                                    alert('发生错误，请联系管理员。错误代码：' + data.error.toString());
                                }else{
                                    editor.insertHtml('<img latex="' + data.escaped_latex + '" src="' + data.url + '" />');
                                }
                            }
                        });
                    }
                }
            };
        } );
	}
} );
