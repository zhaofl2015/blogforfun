ko.observable.fn.onecSubscribe = (callback, callbackTarget, event)->
    self = @

    if not self.isOnecSubscribe
        event = event or "change"

        boundCallback = if callbackTarget then callback.bind callbackTarget else callback

        subscription = new ko.subscription self, boundCallback, ->
            ko.utils.arrayRemoveItem self._subscriptions[event], subscription
            self.afterSubscriptionRemove event if self.afterSubscriptionRemove

        self.beforeSubscriptionAdd event if self.beforeSubscriptionAdd

        self._subscriptions[event] = [] if not self._subscriptions[event]

        self._subscriptions[event].push subscription

        self.isOnecSubscribe = yes

        return subscription
    else
        return self