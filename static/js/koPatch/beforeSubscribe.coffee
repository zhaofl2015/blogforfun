ko.observable.fn.beforeSubscribe = (callback, target)->
    _oldValue = null

    @.subscribe (oldValue)->
        _oldValue = oldValue
        return
    , null, "beforeChange"

    @.subscribe (newValue)->
        callback.call target, newValue, _oldValue
        return