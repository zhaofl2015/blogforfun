define(['knockout','YQuploader', 'skin_default', 'modules/common/fileIconMap', 'tools'], function(ko, YQuploader, skin_default, fileIconMap, tools){
	var vm = {
		fileId: ko.observable(''),
		fileName: ko.observable(''),
		fileUrl: ko.observable(''),
		fileIcon: ko.observable('rar'),
		currentStep: ko.observable(1),
		fileNameValid: ko.observable(true),
		description: ko.observable(''),
		descriptionValid: ko.observable(true),
		seriesList: ko.observableArray(params.series),
		booksList: ko.observableArray([]),
		unitsList: ko.observableArray([]),
		selectedSerie: ko.observable(params.default_series),
		selectedBook: ko.observable(''),
		selectedUnit: ko.observable(''),
		submit: function(){
			if(vm.submitDisable())return;
			tools.ajax({
				url: '/platform-resource/upload/submit',
				data: {
			        file_id: vm.fileId(),
			        filename: vm.fileName(),
			        url: vm.fileUrl(),
			        desc: vm.description(),
			        book_id: vm.selectedBook(),
			        unit_id: vm.selectedUnit(),
			        subject_id: params.subject_id
				},
				success: function(data){
					vm.currentStep(3);
					$('#step2panel').hide();
					$('#step3panel').fadeIn(300);
				}
			});
		},
		getBooks: function(setDefault){
			var name = vm.selectedSerie();
			if(!name)return;
			tools.ajax({
				url: '/platform-resource/get_books_by_series',
				showLoading: false,
				showLoadingMask: false,
				data: {
					series: name,
					subject_id: params.subject_id
				},
				success: function(data){
					vm.booksList(data.books);
					vm.selectedBook('');
					vm.selectedUnit('');
					if(setDefault){
						vm.selectedBook(params.default_book_id);
					}
				}
			});
		},
		getUnits: function(){
			var id = vm.selectedBook();
			if(!id)return;
			tools.ajax({
				url: '/platform-resource/get_units_by_book_id',
				showLoading: false,
				showLoadingMask: false,
				data: {
					book_id: id,
					subject_id: params.subject_id
				},
				success: function(data){
					vm.unitsList(data.units);
					vm.selectedUnit('');
				}
			});
		}
	};

	//是否可以提交
	vm.submitDisable = ko.computed(function(){
		return vm.fileName().length>200 || !vm.selectedSerie() || !vm.selectedBook() || !vm.selectedUnit();
	});

	var uploadResource = {
		init: function(){
			ko.applyBindings(vm);

			this.initUploader();//初始化上传控件

			this.validFileName();//实时校验文件名长度
			this.validDescirption();//实时校验描述字数

			//debug
			window.vm = vm;
		},
		initUploader: function(){
			var uploader = new YQuploader({
		        server: '/platform-resource/upload',
		        auto: true,
		        skin_tpl: skin_default,
		        pick:{
		            id: '.uploader_pick',
		            label: '',
		            innerHTML: '上传资源',
		            multiple: false
		        },
		        fileSingleSizeLimit: 200*1024*1024, //200M
		        onCustomUploadSuccess: function(file, data){
			        vm.currentStep(2);
		            $('#step2panel').fadeIn(300);
		            vm.fileName(data.filename);
		            vm.fileId(data.file_id);
		            vm.fileIcon(fileIconMap(file.ext));
		            vm.fileUrl(data.url);
		            
					vm.getBooks(true);
					
		        }
		    });
		},
		validFileName: function(){
			vm.fileName.subscribe(function(newValue){
				if(newValue.length>200){
					vm.fileNameValid(false);
				}
				else{
					vm.fileNameValid(true);
				}
			});
		},
		validDescirption: function(){
			vm.description.subscribe(function(newValue){
				if(newValue.length>500){
					vm.descriptionValid(false);
				}
				else{
					vm.descriptionValid(true);
				}
			});
		}
	}

	return {
		init: function(){
			uploadResource.init();
		}
	}
	
});