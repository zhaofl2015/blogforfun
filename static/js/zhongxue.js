/**
 * Created by chong.liu on 2015/5/19.
 */
function toLongSubjectId(schoolLevel, shortSubjectId){
    return parseInt(schoolLevel) * 100 + parseInt(shortSubjectId);
}

// 本模块使一个已存在的<input>成为标签输入框
// 用法:
// TagInputMod.init()
// 或
// TagInputMod.settings.tags = $('#new_id')
// TagInputMod.init()
//
// 其它说明：
// return中的是公共对象，不在return中的是私有对象。
var TagsMod = (function(){
    var settings = {
        tags: $('#tags')
    };
    var init = function(_initValue){
        settings.tags.tagsinput({
            // 依赖bootstrap-tagsinput
            trimValue: true
        });
        if (_initValue) {
            var initData = JSON.parse(_initValue);
            for (var i=0; i < initData.length; i++) {
                settings.tags.tagsinput('add', initData[i]);
            }
        }
    };
    return {
        // 暴露出来的对象和函数
        settings: settings,
        init: init
    };
})();

// 本模块处理省市县三个<select>的联动变化逻辑
// 使用方法请参考TagInputMod，都差不多。
// 依赖question_common_service.py
var RegionsMod = (function(){
    var settings = {
        province: $('#region_province_id'),
        city: $('#region_city_id'),
        region: $('#region_id'),

        // 不做任何选择时的选择
        provinceEmptyOption: [-1, '-省-'],
        cityEmptyOption: [-1, '-市-'],
        regionEmptyOption: [-1, '-县-']
    };
    var initProvinceId = null;
    var initCityId = null;
    var initRegionId = null;
    var getProvinces = function() {
        commonAjax('/service/provinces', {}, function(data){
            FormUtils.renderSelectOptions(settings.province, data, settings.provinceEmptyOption, initProvinceId);
            initProvinceId = null;
        });
    };
    var getCities = function() {
        commonAjax('/service/cities', {province_id: settings.province.val()}, function(data){
            FormUtils.renderSelectOptions(settings.city, data, settings.cityEmptyOption, initCityId);
            FormUtils.renderSelectOptions(settings.region, [], settings.regionEmptyOption);
            initCityId = null;
        });
    };
    var getRegions = function() {
        commonAjax('/service/regions', {city_id: settings.city.val()}, function(data){
            FormUtils.renderSelectOptions(settings.region, data, settings.regionEmptyOption, initRegionId);
            initRegionId = null;
        });
    };
    var init = function(provinceId, cityId, regionId) {
        initProvinceId = provinceId;
        initCityId = cityId;
        initRegionId = regionId;
        FormUtils.renderSelectOptions(settings.province, [], settings.provinceEmptyOption);
        FormUtils.renderSelectOptions(settings.city, [], settings.cityEmptyOption);
        FormUtils.renderSelectOptions(settings.region, [], settings.regionEmptyOption);
        settings.city.change(getRegions);
        settings.province.change(getCities);
        getProvinces();
    };
    return {
        // 暴露出来的对象和函数
        settings: settings,
        init: init
    };
})();

// 本模块处理科目和学年段的两个<select>发生变化时，对应题目类型<select>的变化。
// 使用方法请参考TagInputMod，都差不多。
// 依赖question_common_service.py
var ContentTypeIdMod = (function(){
    var settings = {
        subject: $('#subject_id'),
        schoolLevel: $('#school_level'),
        contentType: $('#content_type_id'),
        emptyOption: [-1, '-题型-']
    };
    var initValue = null;
    var getContentTypes = function(){
        var postParam = {
            subject_id: settings.subject.val(),
            school_level: settings.schoolLevel.val()
        };
        commonAjax('/service/content-types', postParam, function(data){
            FormUtils.renderSelectOptions(settings.contentType, data, settings.emptyOption, initValue);
            initValue = null;
        });
    };
    var init = function(_initValue){
        initValue = _initValue;
        FormUtils.renderSelectOptions(settings.contentType, [], settings.emptyOption);
        settings.subject.change(getContentTypes);
        settings.schoolLevel.change(getContentTypes);
        getContentTypes();
    };
    return {
        settings: settings,
        init: init
    };
})();

// 本模块处理学年段的<select>发生变化时，对应教材版本<select>的变化。
// 使用方法请参考TagInputMod，都差不多。
// 依赖question_common_service.py
var TextbookVersionMod = (function(){
    var settings = {
        subject: $('#subject_id'),
        schoolLevel: $('#school_level'),
        bookVersion: $('#book_version'),
        emptyOption: [-1, '-教材版本-']
    };
    var initValue = null;
    var getBookVersions = function(){
        var postParam = {
            subject_id: settings.subject.val(),
            school_level: settings.schoolLevel.val()
        };
        commonAjax('/service/book-versions', postParam, function(data){
            FormUtils.renderSelectOptions(settings.bookVersion, data, settings.emptyOption, initValue);
            initValue = null;
        });
    };
    var init = function(_initValue){
        initValue = _initValue;
        FormUtils.renderSelectOptions(settings.bookVersion, [], settings.emptyOption);
        settings.subject.change(getBookVersions);
        settings.schoolLevel.change(getBookVersions);
        getBookVersions();
    };
    return {
        settings: settings,
        init: init
    };
})();

// 本模块处理科目学年段的<select>发生变化时，对应年级<select>的变化。
// 使用方法请参考TagInputMod，都差不多。
// 注意：只返回该用户被允许操作的年级
// 依赖question_common_service.py
var GradeIdMod = (function(){
    var settings = {
        school_level: $('#school_level'),
        grade_id: $('#grade_id'),
        emptyOption: [-1, '-年级-']
    };
    var initValue = null;
    var getGrades = function(){
        commonAjax('/service/user-grades', {school_level: settings.school_level.val()}, function(data){
            FormUtils.renderSelectOptions(settings.grade_id, data, settings.emptyOption, initValue);
            initValue = null;
        });
    };
    var init = function(_initValue){
        initValue = _initValue;
        FormUtils.renderSelectOptions(settings.grade_id, [], settings.emptyOption);
        settings.school_level.change(getGrades);
        getGrades();
    };
    return {
        settings: settings,
        init: init
    };
})();

// 本模块是知识点选择和搜索对话框
// 使用方法请参考TagInputMod，都差不多。
// 依赖jstree.js, bootstrap.js, bootstrap-tagsinput.js, selectize.js
var KnowledgePointsMod = (function(){
    var settings = {
        knowledgePoints: $('#knowledge_points'),  // 支持其他选择器
        subject: $('#subject_id'),
        schoolLevel: $('#school_level')
    };
    var treeDialog = null;
    var treeSubjectId = null;
    var curTagsInput = null;

    var buildTreeDialog = function() {
        // 生成知识点选择对话框
        if (treeDialog) {
            treeDialog.remove();
        }
        var treeDialogHTML =
            '<div class="modal fade" tabindex="-1">' +
                '<div class="modal-dialog">' +
                    '<div class="modal-content">' +
                        '<div class="modal-header">' +
                            '<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>' +
                            '<h4 class="modal-title">请选择一个知识点...</h4>' +
                        '</div>' +
                        '<div class="modal-body">' +
                            '<select placeholder="搜索知识点"></select>' +
                            '<div class="tree_div"></div>' +
                        '</div>' +
                    '</div>' +
                '</div>' +
            '</div>';
        treeDialog = $(treeDialogHTML).appendTo('body');

        // 生成知识点树
        var tree = treeDialog.find('.tree_div');
        tree.jstree({
            core : {
                check_callback: true,
                themes : { stripes : true },
                data: {
                    url : '/knowledge/zy_get_children',
                    dataType : 'json',
                    data : function (node) {
                        return { parent_id : node.id, subject_id: treeSubjectId, not_show_root: 1 };
                    }
                }
            }
        }).on('select_node.jstree', function(e, data){
            // 绑定树节点点击事件
            addKnowledgePointsTag(data.node.id, data.node.text);
        });

        // 生成知识点搜索框
        var treeSearchSelect = treeDialog.find('select');
        treeSearchSelect.selectize({
            valueField: 'id',
            labelField: 'text',
            searchField: 'text',
            sortField: 'text',
            options: [],
            create: false,
            onItemAdd: function(value, $item){
                // 绑定搜索下拉框点击事件
                addKnowledgePointsTag(value, $item.text());
            }
        });
        // 搜索框数据初始化
        var searchDataLoaded = false;
        treeSearchSelect.next().children().first().mouseenter(function(){
            var control = treeSearchSelect[0].selectize;
            if (!searchDataLoaded) {
                searchDataLoaded = true;
                treeDialog.find('input').prop({placeholder: '请稍候...'});
                commonAjax('/service/knowledge-points/' + treeSubjectId.toString(), null, function (data) {
                    for (var i in data) {
                        control.addOption({id: data[i][0], text: data[i][1]});
                    }
                    treeDialog.find('input').prop({placeholder: '搜索知识点'});
                });
            }
        });
    };

    var openTreeDialog = function() {
        // 打开知识点选择对话框
        curTagsInput = $(this).parent().prev();
        var currentSubjectId = toLongSubjectId(settings.schoolLevel.val(), settings.subject.val());
        if (currentSubjectId != treeSubjectId) {
            treeSubjectId = currentSubjectId;
            buildTreeDialog();
        }
        treeDialog.modal('show');
    };

    var addKnowledgePointsTag = function(point_id, point_name) {
        // 把用户选择的一个知识点加入知识点标签框中
        if (settings.subject.val() == '3') {
            // 英语只能选择三、四、五级目录知识点, 所以它不能小于二级目录最后一个知识点的编号
            if (settings.schoolLevel.val() == '2' && parseInt(point_id) <= 20300031 || settings.schoolLevel.val() == '3' && parseInt(point_id) <= 30300016) {
                return;
            }
        }
        curTagsInput.tagsinput('add', {id: point_id, text: point_name});
        treeDialog.modal('hide');
    };

    var init = function(){
        // 生成知识点标签框
        settings.knowledgePoints.tagsinput({
            trimValue: true,
            itemValue: 'id',
            itemText: 'text'
        });
        // 绑定知识点标签框点击事件
        settings.knowledgePoints.next().find('input').click(openTreeDialog);
    };

    return {
        settings: settings,
        init: init,
        addKnowledgePointsTag: addKnowledgePointsTag
    };
})();

// 本模块是专题选择和搜索对话框
// 类似KnowledgeTreeInputMod
// 依赖jstree.js, bootstrap.js, bootstrap-tagsinput.js, selectize.js
var TopicsMod = (function(){
    var settings = {
        topics: $('#topics'), // 支持其他选择器
        subject: $('#subject_id'),
        schoolLevel: $('#school_level')
    };
    var treeDialog = null;
    var treeSubjectId = null;
    var curTagsInput = null;

    var buildTreeDialog = function() {
        // 生成专题选择对话框
        if (treeDialog) {
            treeDialog.remove();
        }
        var treeDialogHTML =
            '<div class="modal fade" tabindex="-1">' +
                '<div class="modal-dialog">' +
                    '<div class="modal-content">' +
                        '<div class="modal-header">' +
                            '<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>' +
                            '<h4 class="modal-title">请选择一个专题...</h4>' +
                        '</div>' +
                        '<div class="modal-body">' +
                            '<select placeholder="搜索专题"></select>' +
                            '<div class="tree_div"></div>' +
                        '</div>' +
                    '</div>' +
                '</div>' +
            '</div>';
        treeDialog = $(treeDialogHTML).appendTo('body');

        // 生成专题树
        var tree = treeDialog.find('.tree_div');
        tree.jstree({
            core : {
                check_callback: true,
                themes : { stripes : true },
                data: {
                    url : '/service/topic-children',
                    dataType : 'json',
                    data : function (node) {
                        return { parent_id : node.id, subject_id: treeSubjectId };
                    }
                }
            }
        }).on('select_node.jstree', function(e, data){
            // 绑定树节点点击事件
            addTopicTag(data.node.id, data.node.text);
        });

        // 生成专题搜索框
        var treeSearchSelect = treeDialog.find('select');
        treeSearchSelect.selectize({
            valueField: 'id',
            labelField: 'text',
            searchField: 'text',
            sortField: 'text',
            options: [],
            create: false,
            onItemAdd: function(value, $item){
                // 绑定搜索下拉框点击事件
                addTopicTag(value, $item.text());
            }
        });
        // 搜索框数据初始化
        var searchDataLoaded = false;
        treeSearchSelect.next().children().first().mouseenter(function() {
            var control = treeSearchSelect[0].selectize;
            if (!searchDataLoaded) {
                searchDataLoaded = true;
                treeDialog.find('input').prop({placeholder: '请稍候.'});
                commonAjax('/service/topics/' + treeSubjectId.toString(), null, function (data) {
                    for (var i in data) {
                        control.addOption({id: data[i][0], text: data[i][1]});
                    }
                    treeDialog.find('input').prop({placeholder: '搜索专题'});
                });
            }
        });
    };

    var openTreeDialog = function() {
        // 打开专题选择对话框
        curTagsInput = $(this).parent().prev();
        var currentSubjectId = toLongSubjectId(settings.schoolLevel.val(), settings.subject.val());
        if (currentSubjectId != treeSubjectId) {
            treeSubjectId = currentSubjectId;
            buildTreeDialog();
        }
        treeDialog.modal('show');
    };

    var addTopicTag = function(point_id, point_name) {
        // 把用户选择的一个专题加入专题标签框中
        curTagsInput.tagsinput('add', {id: point_id, text: point_name});
        treeDialog.modal('hide');
    };

    var init = function(){
        // 生成专题标签框
        settings.topics.tagsinput({
            trimValue: true,
            itemValue: 'id',
            itemText: 'text'
        });
        // 绑定专题标签框点击事件
        settings.topics.next().find('input').click(openTreeDialog);
    };

    return {
        settings: settings,
        init: init
    };
})();

// 本模块是录题人<select>框
// 使用方法请参考TagInputMod，都差不多。
// 依赖selectize.js
var CreatorMod = (function(){
    var settings = {
        creator: $('#creator')
    };
    var inputDiv = null;
    var searchDataLoaded = false;
    var initData = function(){
        // 搜索框数据初始化
        var control = settings.creator[0].selectize;
        if (!searchDataLoaded) {
            searchDataLoaded = true;
            inputDiv.find('input').prop({placeholder: '请稍候...'});
            commonAjax('/service/user-list', null, function (data) {
                for (var i in data) {
                    control.addOption({id: data[i][0], text: data[i][1] + ' ' + data[i][2]});
                }
                inputDiv.find('input').prop({placeholder: '选择录题人'});
            });
        }
    };
    var init = function(){
        // 生成录题人搜索框
        settings.creator.selectize({
            valueField: 'id',
            labelField: 'text',
            searchField: 'text',
            sortField: 'text',
            options: [],
            create: false
        });
        inputDiv = settings.creator.next().children().first();
        inputDiv.css({width: '150px'});
        inputDiv.parent().mouseenter(initData);
    };
    return {
        settings: settings,
        init: init
    };
})();

// 本模块是任务所属人<select>框
// 本模块类似CreatorFilterMod
// 依赖selectize.js
var AuditUserMod = (function(){
    var settings = {
        auditUser: $('#audit_user')
    };
    var inputDiv = null;
    var searchDataLoaded = false;
    var initData = function(){
        // 搜索框数据初始化
        var control = settings.auditUser[0].selectize;
        if (!searchDataLoaded) {
            searchDataLoaded = true;
            inputDiv.find('input').prop({placeholder: '请稍候...'});
            commonAjax('/service/user-list', null, function (data) {
                for (var i in data) {
                    control.addOption({id: data[i][0], text: data[i][1] + ' ' + data[i][2]});
                }
                inputDiv.find('input').prop({placeholder: '任务所属人'});
            });
        }
    };
    var init = function(){
        // 生成任务所属人搜索框
        settings.auditUser.selectize({
            valueField: 'id',
            labelField: 'text',
            searchField: 'text',
            sortField: 'text',
            options: [],
            maxItems: 1,
            create: false
        });
        inputDiv = settings.auditUser.next().children().first();
        inputDiv.css({width: '150px'});
        inputDiv.parent().mouseenter(initData);
    };
    return {
        settings: settings,
        init: init
    };
})();

// 本模块是年份<select>框
// 依赖selectize.js
var YearIntMod = (function(){
    var settings = {
        yearInt: $('#year_int')
    };
    var init = function(){
        settings.yearInt.selectize({
            create: false
        });
        var inputDiv = settings.yearInt.next().children().first();
        inputDiv.css({width: '100px'});
    };
    return {
        settings: settings,
        init: init
    };
})();

// 本模块是文理科<select>框
// 只有高中数学才显示这个框。
var DisciplineIntMod = (function(){
    var settings = {
        discipline: $('#discipline_int'),
        subject: $('#subject_id'),
        schoolLevel: $('#school_level')
    };
    var setDisplay = function(){
        if (settings.schoolLevel.val() == '3' && settings.subject.val() == '2') {
            settings.discipline.show();
        } else {
            settings.discipline.hide();
        }
        settings.discipline.val(0);
    };
    var init = function(){
        settings.subject.change(setDisplay);
        settings.schoolLevel.change(setDisplay);
        setDisplay();
    };
    return {
        settings: settings,
        init: init
    };
})();

// 本模块是阅读理解难度<select>框
// 只有阅读理解才显示这个框。
var ReadingDifficultyMod = (function(){
    var settings = {
        readingDifficulty: $('#reading_difficulty'),
        contentType: $('#content_type_id')
    };
    var setDisplay = function(){
        if (settings.contentType.val() == '30307' || settings.contentType.val() == '20311') {
            settings.readingDifficulty.show();
        } else {
            settings.readingDifficulty.hide();
        }
        settings.readingDifficulty.val(0);
    };
    var init = function(){
        settings.contentType.change(setDisplay);
        setDisplay();
    };
    return {
        settings: settings,
        init: init
    };
})();