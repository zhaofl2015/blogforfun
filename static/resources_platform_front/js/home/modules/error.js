define(["knockout"], function (ko) {
    return function (context) {
        this.name = "error";

        this.error = context.app.loadError();

        //when ajax successed
        context.app.loading(false);
    }
});