class attr_roles
    roles               : ko.observableArray []

    add_role: ->
        @roles.push new Role()
        resetUpload(@)
        return

    delete_role: (self)->
        self.roles.remove @
        return

    change_role_type: (role)->
        if @role_type() is role then return

        @role_type role

        return

@attr_roles = attr_roles