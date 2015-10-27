require.config({
    baseUrl: "/static/resources_platform_front",
    paths  : {
        "jquery"      : "lib/jquery-1.7.1.min",
        "YQuploader"  : "lib/YQuploader-1.0/YQuploader",
        "skin_default": "lib/YQuploader-1.0/skins/default/tpl",
        "webuploader": "lib/YQuploader-1.0/lib/webuploader/webuploader.min",
        "tools": "modules/common/tools",
        "prompt": "lib/jquery-impromptu/jquery-impromptu",
        "webuploader" : "lib/YQuploader-1.0/lib/webuploader/webuploader.min",
        "knockout"    : "lib/knockout-master/dist/knockout",
        "ko-mapping"  : "lib/knockout.mapping/knockout-mapping",
        "ko-amd"      : "lib/knockout-amd-helpers/build/knockout-amd-helpers.min",
        "ko-switch"   : "lib/knockout-switch-case/knockout-switch-case.min",
        "home"        : "js/home/app"
    },
    shim   : {
        "jquery": {
            exports: "$"
        },
        "prompt": {
            exports: "prompt"
        },
        "sammy" : {
            deps: ["jquery"]
        }
    }
});
