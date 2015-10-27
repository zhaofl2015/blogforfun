require.config({
    baseUrl: "/static",
    paths  : {
        "jquery"            : "3rd/jquery/jquery.min",
        "jquery-ui"         : "3rd/jquery-ui/jquery-ui.min",
        "jquery-fileupload" : "lib/jQuery.File.Upload/js/jquery.fileupload",
        "jquery.ui.widget"  : "lib/jQuery.File.Upload/js/vendor/jquery.ui.widget",
        "jquery-jstree"     : "3rd/jstree/jstree.min",
        "selectize"         : "3rd/selectize/js/selectize.min",
        "knockout"          : "lib/knockout-master/dist/knockout.debug",
        "ko-mapping"        : "lib/knockout.mapping/knockout-mapping",
        "ko-amd"            : "lib/knockout-amd-helpers/build/knockout-amd-helpers.min",
        "ko-datepicker"     : "js/handlers/knockout-datepicker",
        "sammy"             : "lib/sammy/sammy",
        "text"              : "lib/text",
        "tools"             : "js/modules/tools/tools",
        "UrlUtils"          : "js/modules/tools/UrlUtils",
        "PaginationMod"     : "js/modules/tools/PaginationMod",
        "TreeView"          : "js/modules/tools/TreeView",
        "app"               : "js/modules/resource/app"
    },
    shim   : {
        "jquery": {
            exports: "jquery"
        },
        "sammy" : {
            deps: ["jquery"]
        },
        "PaginationMod": {
            deps: ["jquery"]
        },
        "jquery-fileupload": {
            deps: ["jquery.ui.widget"]
        },
        "TreeView": {
            deps: ["jquery", "jquery-jstree", "selectize"]
        }
    }
});
