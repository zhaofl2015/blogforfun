define(["knockout"], function (ko){
    return function (context){
        var parent = context.parent;
        var data = context.data;

        $("body").on("pageReady", function (){
            //文件等级比例
            $('#container1').highcharts({
                chart      : {
                    plotBackgroundColor: null,
                    plotBorderWidth    : null,
                    plotShadow         : false,
                    type               : 'pie'
                },
                title      : {
                    text: '文件等级占比 207911'
                },
                tooltip    : {
                    pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
                },
                plotOptions: {
                    pie: {
                        allowPointSelect: true,
                        cursor          : 'pointer',
                        dataLabels      : {
                            enabled: true,
                            format : '<b>{point.name}</b>: {point.percentage:.1f} %',
                            style  : {
                                color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
                            }
                        }
                    }
                },
                series     : [{
                    name        : "Brands",
                    colorByPoint: true,
                    data        : data.statistics.level
                }]
            });

            //下载资源比例
            $('#container2').highcharts({
                chart      : {
                    plotBackgroundColor: null,
                    plotBorderWidth    : null,
                    plotShadow         : false,
                    type               : 'pie'
                },
                title      : {
                    text: '下载资源 298011'
                },
                tooltip    : {
                    pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
                },
                plotOptions: {
                    pie: {
                        allowPointSelect: true,
                        cursor          : 'pointer',
                        dataLabels      : {
                            enabled: true,
                            format : '<b>{point.name}</b>: {point.percentage:.1f} %',
                            style  : {
                                color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
                            }
                        }
                    }
                },
                series     : [{
                    name        : "Brands",
                    colorByPoint: true,
                    data        : data.statistics.download
                }]
            });

            //园丁豆使用情况
            $('#container3').highcharts({
                chart      : {
                    type: 'bar'
                },
                title      : {
                    text: 'Historic World Population by Region'
                },
                subtitle   : {
                    text: 'Source: <a href="https://en.wikipedia.org/wiki/World_population">Wikipedia.org</a>'
                },
                xAxis      : {
                    categories: ['消耗的园丁豆', '回收的园丁豆'],
                    title     : {
                        text: null
                    }
                },
                yAxis      : {
                    min   : 0,
                    title : {
                        text : '园丁豆使用情况(个)',
                        align: 'high'
                    },
                    labels: {
                        overflow: 'justify'
                    }
                },
                tooltip    : {
                    valueSuffix: ' millions'
                },
                plotOptions: {
                    bar: {
                        dataLabels: {
                            enabled: true
                        }
                    }
                },
                legend     : {
                    layout         : 'vertical',
                    align          : 'right',
                    verticalAlign  : 'top',
                    x              : -40,
                    y              : 80,
                    floating       : true,
                    borderWidth    : 1,
                    backgroundColor: ((Highcharts.theme && Highcharts.theme.legendBackgroundColor) || '#FFFFFF'),
                    shadow         : true
                },
                credits    : {
                    enabled: false
                },
                series     : [{
                    name: '园丁豆使用情况',
                    data: [107, 203]
                }]
            });

            $('#container4').highcharts({
                chart: {
                    type: 'column'
                },
                title: {
                    text: 'UV 信息'
                },
                subtitle: {
                    text: 'Click the columns to view versions. Source: <a href="http://netmarketshare.com">netmarketshare.com</a>.'
                },
                xAxis: {
                    type: 'category'
                },
                yAxis: {
                    title: {
                        text: 'Total percent market share'
                    }

                },
                legend: {
                    enabled: false
                },
                plotOptions: {
                    series: {
                        borderWidth: 0,
                        dataLabels: {
                            enabled: true
                        }
                    }
                },
                tooltip: {
                    headerFormat: '<span style="font-size:11px">{series.name}</span><br>',
                    pointFormat: '<span style="color:{point.color}">{point.name}</span>: <b>{point.y:.2f}%</b> of total<br/>'
                },
                series: [{
                    name: "Brands",
                    colorByPoint: true,
                    data: [{
                        name: "UV",
                        y: 3492
                    }, {
                        name: "上传UV",
                        y: 1892
                    }, {
                        name: "下载UV",
                        y: 3012
                    }, {
                        name: "无下载又无上传UV",
                        y: 1981
                    }, {
                        name: "新增UV",
                        y: 2019
                    }, {
                        name: "累计UV",
                        y: 29810
                    }]
                }]
            });

            $('#container5').highcharts({
                chart: {
                    type: 'column'
                },
                title: {
                    text: '资源状态'
                },
                subtitle: {
                    text: 'Click the columns to view versions. Source: <a href="http://netmarketshare.com">netmarketshare.com</a>.'
                },
                xAxis: {
                    type: 'category'
                },
                yAxis: {
                    title: {
                        text: 'Total percent market share'
                    }

                },
                legend: {
                    enabled: false
                },
                plotOptions: {
                    series: {
                        borderWidth: 0,
                        dataLabels: {
                            enabled: true
                        }
                    }
                },
                tooltip: {
                    headerFormat: '<span style="font-size:11px">{series.name}</span><br>',
                    pointFormat: '<span style="color:{point.color}">{point.name}</span>: <b>{point.y:.2f}%</b> of total<br/>'
                },
                series: [{
                    name: "Brands",
                    colorByPoint: true,
                    data: [{
                        name: "后台上传资源",
                        y: 987
                    }, {
                        name: "发布资源",
                        y: 398
                    }, {
                        name: "取消发布资源",
                        y: 210
                    }, {
                        name: "删除资料",
                        y: 29
                    }, {
                        name: "处理文件",
                        y: 2019
                    }, {
                        name: "累计发布",
                        y: 29810
                    }]
                }]
            });

            parent.loading(false);
        });
    }
});
