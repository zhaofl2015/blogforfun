/**
 * Created by chong.liu on 2015/6/9.
 */

var RegionsModViewModel = function () {
    var self = this;
    self.selectProvinces = ko.observableArray([]);
    self.selectProvincesValue = ko.observable(-1);
    self.selectCities = ko.observableArray([]);
    self.selectCitiesValue = ko.observable(-1);
    self.selectRegions = ko.observableArray([]);
    self.selectRegionsValue = ko.observable(-1);

    self.loadProvinces = function(){
        var provinceDef = $.Deferred();
        $.post('/service/provinces', {}, function (data) {
            self.selectProvinces(ko.mapping.fromJS(data)());
            provinceDef.resolve()
        });
        return provinceDef;
    };

    self.showSelectedCity = function (provinceId,cityId,regionId) {
        $.post('/service/cities', {province_id: provinceId}, function (data) {
            self.selectCities(ko.mapping.fromJS(data)());
            for(var i = 0, city = self.selectCities(); i < city.length; i++ ){
                if(cityId == city[i][0]){
                    self.selectCitiesValue(cityId);
                    self.showSelectedRegion(cityId,regionId);
                }
            }
        });
    };

    self.showSelectedRegion = function (cityId,regionId) {
        $.post('/service/regions', {city_id: cityId}, function (data) {
            self.selectRegions(ko.mapping.fromJS(data)());
            for(var i = 0, regions = self.selectRegions(); i < regions.length; i++ ){
                if(regionId == regions[i][0]){
                    self.selectRegionsValue(regionId);
                }
            }
        });
    };

    //选择省
    self.selectedProvinces = function () {
        if ((self.selectProvincesValue() == undefined)) {
            self.selectCities([]); //初始化市
            self.selectRegions([]); //初始化区
            return false;
        }
        //获取相对应的市
        $.post('/service/cities', {province_id: self.selectProvincesValue()}, function (data) {
            self.selectCities(ko.mapping.fromJS(data)());
            self.selectRegions([]); //初始化区
        });
    };

    //选择市
    self.selectedCities = function () {
        //获取相对应的区
        self.selectRegions([]); //初始化区
        if ((self.selectCitiesValue() == undefined)) {
            return false;
        }
        $.post('/service/regions', {city_id: self.selectCitiesValue()}, function (data) {
            self.selectRegions(ko.mapping.fromJS(data)());
        });
    };
    self.init = function (provinceId, cityId, regionId) {
        var promise = self.loadProvinces();
        promise.done(function () {
            for (var i = 0, provinces = self.selectProvinces(); i < provinces.length; i++) {
                if (provinces[i][0] == provinceId) {
                    self.selectProvincesValue(provinceId);
                    self.showSelectedCity(provinceId,cityId,regionId);
                }
            }
        });
    };
};