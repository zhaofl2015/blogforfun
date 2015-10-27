ko.observable.fn.onecBeforeSubscribe = (callback, target)->
    self = @

    if not self.isOnecBeforeSubscribe
        _oldValue = null

        @.subscribe (oldValue)->
            _oldValue = oldValue
            return
        , null, "beforeChange"

        @.subscribe (newValue)->
            callback.call target, newValue, _oldValue
            return

        self.isOnecBeforeSubscribe = yes