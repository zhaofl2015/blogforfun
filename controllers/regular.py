# -*- coding: utf-8 -*-
from __future__ import unicode_literals
from flask.ext.wtf.recaptcha import validators

__author__ = 'fanglei.zhao'

from wtforms import  Form, SelectField, DateField, SubmitField


class FilterForm(Form):
    user_id = SelectField('用户', description='用户', choices=[])
    from_day = DateField('从哪天', description='从哪天', validators=[validators.optional])
    to_day = DateField('到哪天', description='到哪天', validators=[validators.optional])
    submit = SubmitField('搜索')

    def __init__(self, *args, **kwargs):
        Form.__init__(self, *args, **kwargs)