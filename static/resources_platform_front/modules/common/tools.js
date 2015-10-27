define(['jquery', 'prompt'], function($){
	return {
		//显示loading图标
	    loadingStart: function(showmask) {
	        if(showmask){
	            var mask = $('.loadingmask');
	            if(mask.length == 0){
	                mask = $('<div class="loadingmask"></div>').appendTo(document.body);
	            }
	            mask.show();
	        }
	        var loadingicon = $('.loadingicon');
	        if(loadingicon.length == 0){
	            loadingicon = $('<img class="loadingicon" style="" src="/static/resources_platform_front/img/loading.gif" alt="正在加载" />').appendTo(document.body);
	        }
	        loadingicon.show();
	    },
	    //隐藏loading图标
	    loadingEnd: function(hidemask) {
	        $('.loadingicon').hide();
	        if(hidemask){
	            $('.loadingmask').hide();
	        }
	    },
	    popMsg: function(msg){
	    	if(!msg)return;
	    	$.prompt(msg, {
				title: '系统消息'
			})
	    },
		//通用ajax请求
	    ajax: function(conf) {
	    	var _this = this;
	        var confObj = {
	            url            : conf.url || '',
	            type           : conf.type || 'POST',
	            dataType       : conf.dataType || 'json',
	            data           : conf.data,
	            showLoading    : conf.showLoading===undefined ? true : conf.showLoading,  //是否显示loading图标
	            showLoadingMask: conf.showLoadingMask===undefined ? true : conf.showLoadingMask,  //是否显示遮罩层
	            success        : function(returnData) {
	                if(returnData){
	                    if(returnData.success){
	                        conf.success && conf.success(returnData);
	                    }else{
	                        var errormsg = returnData.error || returnData.info || '操作失败，请重试！';
	                        _this.popMsg(errormsg);
	                    }
	                }
	            },
	            error          : function(xhr, textStatus) {
	                if(textStatus != 'abort'){
	                    if(conf.error){
	                        conf.error();
	                    }
	                    else{
	                        _this.popMsg('发送请求失败，请重试！');    
	                    }
	                    
	                }
	            },
	            complete       : function() {
	                conf.complete && conf.complete();

	                this.showLoading && _this.loadingEnd(!!this.showLoadingMask);
	                //如果页面js报错导致阻塞，隐藏loading
	                if($('.loadingmask').css('display') == 'block'){
	                    _this.loadingEnd(true);
	                }
	            }
	        }

	        confObj.showLoading && _this.loadingStart(!!confObj.showLoadingMask);
	        $.ajax(confObj);
	    }
	}
});