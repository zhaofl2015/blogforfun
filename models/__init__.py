#!/usr/bin/env python
# -*- coding: utf-8 -*-
from mongoengine import Document, StringField, BooleanField, IntField, ListField, DateTimeField
from utils.common_utils import now_lambda

__author__ = 'fleago'


class User(Document):
    PV_PUBLISH = 1
    PV_DELETE = 2
    PV_COMMENT = 3
    PV_EDIT = 4

    PRIVILEGES = [
        (PV_PUBLISH, '发布日志'),
        (PV_DELETE, '删除日志'),
        (PV_COMMENT, '评论'),
        (PV_EDIT, '编辑日志'),
    ]

    PRIVILEGES_DIC = dict(PRIVILEGES)

    STATUS = [
        (0, '禁用'),
        (1, '启用')
    ]

    # 管理员缓存
    ADMIN = None

    username = StringField(required=True, unique=True)
    password = StringField(required=True)
    nickname = StringField(required=True)
    email = StringField()

    is_admin = BooleanField(default=False)
    privileges = ListField(IntField(choices=PRIVILEGES))
    status = IntField(choices=STATUS,default=1)
    last_login_time = DateTimeField()
    last_login_ip = StringField()
    created_at = DateTimeField(default=now_lambda())
    updated_at = DateTimeField(default=None)

    meta = {
        'collection' : 'blog_user',
        'strict' : False
    }