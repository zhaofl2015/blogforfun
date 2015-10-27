moduleKeywords = ['included', 'extended']

class SuperClass
    @include: (obj)->
        throw('include(obj) 继承对象不存在') unless obj
        for key, value of obj.prototype when key not in moduleKeywords
            @::[key] = value

        included = obj.included
        included.apply(this) if included
        @

@SuperClass = SuperClass