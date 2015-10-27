var $tools = $tools || {};

$tools._editorConf = {
    serverUrl: "/xx/files/ueditor/upload",
    toolbars: [[
        'fullscreen', 'undo', 'redo', '|',
        'bold', 'italic', 'underline', 'fontborder', 'strikethrough', 'removeformat',
        'forecolor', 'insertorderedlist', 'insertunorderedlist', '|',
        'rowspacingtop', 'rowspacingbottom', 'lineheight', '|',
        'indent', '|',
        'justifyleft', 'justifycenter', 'justifyright', 'justifyjustify', '|',
        'link', 'unlink', '|', 'imagenone', 'imageleft', 'imageright', 'imagecenter', '|',
        'simpleupload', 'insertimage',
        'spechars', '|',
        'inserttable', 'deletetable', 'insertparagraphbeforetable', 'insertrow', 'deleterow', 'insertcol', 'deletecol',
        'mergecells', 'mergeright', 'mergedown', 'splittocells', 'splittorows', 'splittocols'        
    ]],
    enableAutoSave: false,
    autoFloatEnabled: false,
    fontfamily: [{
        label: '',
        name: 'songti',
        val: '宋体,SimSun'
    },{
        label: '',
        name: 'arial',
        val: 'arial, helvetica,sans-serif'
    }]
};

//id: 页面元素id， config：编辑器配置项， veiwmodel：需绑定的viewmodel， value：编辑器内容绑定的viewmodel字段
$tools.initEditor = function(id, viewModel, value, config){
    if(UE.hasEditor(id)){
        UE.getEditor(id).destroy();
    }

    var editor = UE.getEditor(id, $.extend(config || {}, $tools._editorConf));

	editor.addListener('ready', function(){
		$(editor.window.document.body).attr('data-bind', 'editorinput:' + value);
		ko.applyBindings(viewModel, editor.window.document.body);
 	});

    return editor;
};