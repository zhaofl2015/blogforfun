// Generated by CoffeeScript 1.9.3
(function() {
  UE.registerUI('numberblock', function(editor, uiName) {
    var btn;
    editor.registerCommand("set_number_block", {
      execCommand: function() {
        var $img, dialog;
        $img = $(editor.selection.getStart());
        if ($img.prop("tagName") !== "IMG") {
          alert("请选择图片之后再点击此按钮");
          return false;
        } else {
          dialog = new UE.ui.Dialog({
            iframeUrl: "/xx/questions/img_iframe?img_url=" + ($img.attr('src')) + "&width=" + ($img.width()) + "&height=" + ($img.height()),
            editor: editor,
            name: uiName,
            title: "图标加输入框",
            cssRules: "width:" + ($img.width() + 50) + "px; height:" + ($img.height() + 50) + "px;",
            buttons: [
              {
                className: 'edui-okbutton',
                label: '确定',
                onclick: function() {
                  var $img_parent, $jcrop, blockCount, blockhtml;
                  $jcrop = $("iframe:last").contents().find("body #img-wrap");
                  $jcrop.find(".temporary").remove();
                  if ($img.parents(".view").find("#img_parent").length === 0) {
                    $img.after($("<div id='img_parent' style='position: relative;'></div>"));
                  }
                  $img_parent = $img.parents(".view").find("#img_parent");
                  $img_parent.append($img.clone());
                  $jcrop.find('.add-box').css({
                    color: '#F00',
                    border: '2px solid #F00'
                  });
                  blockhtml = $jcrop.html();
                  blockCount = $img_parent.find('.add-box').length;
                  blockhtml = blockhtml.replace(/__\$\$__/g, function() {
                    return ++blockCount;
                  });
                  $img_parent.append(blockhtml);
                  $img.remove();
                  $("body").trigger("update_model", [editor.getContent(), editor.key]);
                  dialog.close(true);
                }
              }, {
                className: 'edui-cancelbutton',
                label: '取消',
                onclick: function() {
                  dialog.close(false);
                }
              }
            ]
          });
          dialog.render();
          return dialog.open();
        }
      }
    });
    btn = new UE.ui.Button({
      name: 'dialogbtn' + uiName,
      title: 'dialogbtn' + uiName,
      cssRules: 'background: url(/static/img/pen.png) !important',
      onclick: function() {
        editor.execCommand("set_number_block");
      }
    });
    return btn;
  });

}).call(this);

//# sourceMappingURL=numberBlock.js.map
