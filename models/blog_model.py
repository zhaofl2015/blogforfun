#!/usr/bin/env python
# encoding: utf-8


"""
@version: ??
@author: fleago
@license: github Licence 
@contact: fleago@163.com
@site: notyet
@software: PyCharm
@file: blog_model.py
@time: 2015/10/25 21:35
"""
from bson import ObjectId
from mongoengine import *
from utils.common_utils import now_lambda


class Blog(Document):
    title = StringField(required=True)
    comment = ListField(StringField())
    content = StringField(default='')
    author = ObjectId()
    create_time = DateTimeField(default=now_lambda())
    update_time = DateTimeField(default=None)
    delete_time = DateTimeField(default=None)
    last_comment_time = DateTimeField(default=None)
    view_count = IntField(default=0)
    last_view_time = DateTimeField(default=None)
    last_view_ip = DateTimeField(default=None)
    last_view_user = ObjectId()

    pass

def func():
    pass


class Main():
    def __init__(self):
        pass


if __name__ == '__main__':
    pass