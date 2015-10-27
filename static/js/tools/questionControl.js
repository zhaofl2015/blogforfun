(function() {
  var QuestionControl;

  QuestionControl = (function() {
  	function QuestionControl() {
  	
    }

  	//审核
  	QuestionControl.prototype.audit = function(type, obj, event){
  		var that = this;
        var item = $(event.target).closest('.questionitem');
  		var title = '';
  		switch(type){
  			case 'rough':
  				title = '初审';
  			break;
  			case 'final':
  				title = '终审';
  			break;
  			case 'direct_final':
  				title = '直接终审';
  			break;
  		}
  		
  		var box = $.popbox({
  			title: title,
  			contentSelector: '#auditform',
            onOpen: function(){
                //初始化富文本编辑器
                var editorId = 'reasoneditor';
                if(UE.hasEditor(editorId)){
                    UE.getEditor(editorId).destroy();
                }
                reasoneditor = UE.getEditor(editorId, {
                    serverUrl: "/xx/files/ueditor/upload",
                    toolbars: [[]],
                    enableAutoSave: false,
                    elementPathEnabled: false,
                    wordCount: false,
                    initialFrameHeight: 100
                });
            },
  			onOk: function(){
  				var score = 1;
		  		var checkScore = $('input[name="dafen"]:checked');
		  		if(checkScore.length==0){
		  			alert('请打分');
		  			return;
		  		}

		  		var position = [];
		  		$('input[name="weizhi"]:checked').each(function(){
		  			position.push($(this).val());
		  		});

		  		var reason = reasoneditor.getContent();

		  		var submitdata = {
		  			audit_type: type || 'rough',
		  			question_id: that._id,
		  			score: checkScore.val(),
		  			positions: position,
		  			reason: reason
		  		}

  				$.post('/xx/audit/rough', submitdata, function(data){
  					if(data.success){
  						box.close();
                        item.find('.status_text').text(data.status_text);
                        item.find('.removebtn')[data.could_delete ? 'show' : 'hide']();
                        item.find('.editbtn')[data.could_edit ? 'show' : 'hide']();
                        item.find('.roughbtn')[data.could_rough_audit ? 'show' : 'hide']();
                        item.find('.finalbtn')[data.could_final_audit ? 'show' : 'hide']();
                        item.find('.directbtn')[data.could_direct_final_audit ? 'show' : 'hide']();
  					}
  					else{
  						alert(data.error);
  					}
  				})
  				.fail(function(){
  					alert('发送请求失败，请重试');
  				});

  				return false;
  			}
  		});
  	}

  	//删除试题
  	QuestionControl.prototype.remove = function(q_list){
  		var del = confirm('确定删除该试题吗？');
		if(!del){return;}
		var question_id = this._id;
        $tools.ajax({
            url: '/xx/questions/delete',
            data: {question_id: question_id},
            success: function(data){
                $tools.msgTip('删除成功！', 'success');
                q_list.remove(function(item){
                    return item._id == question_id;
                });
            }
        });
  	}

    //删除复合题子题
    QuestionControl.prototype.removeSubQuestion = function(pid, subindex, q_list, obj, event){
        var del = confirm('确定删除该试题吗？');
        if(!del){return;}
        $tools.ajax({
            url: '/xx/questions/delete',
            data: {
                question_id: pid,
                sub_index: subindex
            },
            success: function(data){
                $tools.msgTip('删除成功！', 'success');
                q_list.splice(subindex, 1);
                $(event.target).closest('.subitem').remove();
            }
        });
    }

    //设置是否适合在手机上显示
    QuestionControl.prototype.set_mobile_fit = function(obj, event){
        var self = this;
        var check = $(event.target); 
        var val = check.is(':checked') ? 1: 0;
        $.post('/xx/questions/not_fit_mobile', {question_id: this._id, not_fit_mobile: val})
        .success(function(data){
            if(!data.success){
                $tools.msgTip(data.error);
                check.prop('checked', !val); //如果请求失败，将值还原
            }
        })
        .fail(function(){
            $tools.msgTip('发送请求失败，请重试');
            check.prop('checked', !val); //如果请求失败，将值还原
        });
    }

    //手机端预览
    QuestionControl.prototype.mobilePreview = function(id, obj, event){
        var subjectId = this.subject_id || 103;
        var url = '/xx/questions/preview-mobile';
        //中学的预览地址
        if(subjectId >= 200){
          url = 'http://www.17xueshe.com/qbank/qPreviewMobile';
        }
        event.stopPropagation();
        var box = $.popbox({
            title: '手机端预览',
            width: 340,
            maxHeight: 500,
            padding: '0',
            showBtn: false,
            showFoot: false,
            //blurClose: true,
            content: '<iframe id="previewiframe" src="'+url+'?question_id='+id+'" width="340" height="480" frameborder="0"></iframe>'
        });
    }

    //上线
    QuestionControl.prototype.online = function(obj, event){
        var item = $(event.target).closest('.questionitem');
        var that = this;
        $tools.ajax({
            url: '/online/online-offline',
            data: {
                doc_id: that._id,
                online: 1
            },
            showLoadingMask: false,
            success: function(data){
                $tools.msgTip('上线成功！', 'success');
                that.ol_status = data.ol_status;
                item.find('.ol_status_text').text(data.ol_status_text);
                item.find('.onlinebtn').hide();
                item.find('.offlinebtn').show();
            }
        });
    }

    //下线
    QuestionControl.prototype.offline = function(obj, event){
        var offl = confirm('确定下线该试题吗？');
        if(!offl){return;}
        var item = $(event.target).closest('.questionitem');
        var that = this;
        $tools.ajax({
            url: '/online/online-offline',
            data: {
                doc_id: that._id,
                online: 0
            },
            showLoadingMask: false,
            success: function(data){
                $tools.msgTip('下线成功！', 'success');
                that.ol_status = data.ol_status;
                item.find('.ol_status_text').text(data.ol_status_text);
                item.find('.onlinebtn').show();
                item.find('.offlinebtn').hide();
            }
        });
    }

    //下次更新是否保留版本号， 更新后ID不变
    QuestionControl.prototype.keepVersion = function(){
        var self = this;
        var check = $(event.target); 
        var val = check.is(':checked') ? 1: 0;
        $.post('/online/keep-version', {doc_id: this._id, keep: val})
        .success(function(data){
            if(!data.success){
                $tools.msgTip(data.error);
                check.prop('checked', !val); //如果请求失败，将值还原
            }
        })
        .fail(function(){
            $tools.msgTip('发送请求失败，请重试');
            check.prop('checked', !val); //如果请求失败，将值还原
        });
    }

    //格式化获取的教辅详细数据
    QuestionControl.prototype.formatWorkbookDetail = function(item, detail, index){
        if(index>=1){
            detail += '<br>';
        }
        for(var i=0; i<index; i++){
            detail += '----';
        }
        var name = item.name ? item.name : item.title;
        detail += name;
        if(item.child == null){
            return detail;
        }
        else{
            return arguments.callee(item.child, detail, ++index);
        }
    }

    //获取所属教辅的详细信息
    QuestionControl.prototype.getWorkbookDetail = function(wc_id, callback){
        var that = this;
        $.post('/workbook/service-get-workbook-parents', {workbook_catalog_id: wc_id})
        .success(function(data){
            var detail = that.formatWorkbookDetail(data.data, '', 0);
            typeof callback == 'function' && callback(detail);
        });
    }

    //初始化教辅详细信息弹出层
    QuestionControl.prototype.initWorkbookDetail = function(){
        var that = this;
        setTimeout(function(){
            $('.popinfo').popover({
                trigger: 'hover',
                html: true
            })
            .on('show.bs.popover', function(event){
                var item = $(event.target);
                that.getWorkbookDetail(item.data('wcid'), function(detail){
                    item.next('.popover').find('.popover-content').html(detail);
                });
            })
        });
    }

    //上线校验
    QuestionControl.prototype.onlineCheck = function(){
      var that = this;
      $.ajax({
          url: '/service/validate',
          type: 'GET',
          data: {doc_id: that._id},
          success: function(data){
            var msg = data.info||data.error;
            if(data.success){
                $tools.msgTip(msg, 'success');    
            }
            else{
                $.popbox({
                    title: '错误信息',
                    content: msg
                });
            }
          }
      });
    }

  	return QuestionControl;
  })();

  this.QuestionControl = QuestionControl;

}).call(this);