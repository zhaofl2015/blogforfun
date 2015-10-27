/*
传入文件后缀名，返回该文件对应的icon的css类名
*/
define(function(){
	return function(ext){
		if(!ext)return 'rar-ico';
		ext = ext.toLowerCase();
		var iconName = '';
		switch(ext){
			case 'doc':
			case 'docx':
				iconName = 'word-ico';
			break;
			case 'pdf':
				iconName = 'pdf-ico';
			break;
			case 'xls':
			case 'xlsx':
				iconName = 'excel-ico';
			break;
			case 'ppt':
			case 'pptx':
				iconName = 'ppt-ico';
			break;
			case 'jpg':
			case 'jpeg':
			case 'png':
			case 'gif':
			case 'bmp':
				iconName = 'pic-ico';
			break;
			case 'mp3':
				iconName = 'audio-ico';
			break;
			case 'mp4':
			case 'wav':
			case 'wma':
			case 'avi':
			case 'rm':
			case 'mid':
			case 'mpg':
			case 'mpeg':
			case 'asf':
			case 'rmvb':
			case 'flv':
				iconName = 'video-ico';
			break;
			case 'txt':
				iconName = 'txt-ico';
			break;
			case 'rar':
			case 'zip':
				iconName = 'rar-ico';
			break;
			default:
				iconName = 'rar-ico';
			break;
		}
		return iconName;
	}
});