# -*- coding: utf-8 -*-
from __future__ import unicode_literals
from config import Config

__author__ = 'fanglei.zhao'

from mongoengine import Document, StringField, BooleanField, IntField, ListField, DateTimeField
from utils.common_utils import now_lambda, format_datetime


class BlogUser(Document):
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

    username = StringField(required=True, unique=True, primary_key=True)
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
    deleted_at = DateTimeField(default=None)

    meta = {
        'collection' : 'blog_user',
        'db_alias' : Config.mongodb_blog_alias,
        'strict' : False
    }

    @classmethod
    def get_admin(cls):
        if not cls.ADMIN:
            cls.ADMIN = cls.objects.get(username='admin')
        return cls.ADMIN

    def is_authenticated(self):
        return self.username is not None and self.is_active()

    def is_active(self):
        return self.status == 1

    def is_anounymous(self):
        return self.username is None

    def get_id(self):
        return self.username

    def could_manage_user(self):
        return self.is_admin

    def could_publish(self):
        return self.PV_PUBLISH in self.privileges

    def could_delete(self):
        return self.PV_DELETE in self.privileges

    def could_edit(self):
        return self.PV_EDIT in self.privileges

    def could_comment(self):
        return self.PV_COMMENT in self.privileges

    def validate_password(self, password):
        return password == self.password

    def set_password(self, password):
        self.password = password

    def privileges_text(self):
        return ','.join([self.PRIVILEGES_DIC.get(privilege, 'notext') for privilege in self.privileges])

    def as_dict(self, with_permisson=False, cur_user=None):
        dic = dict(self.to_mongo())
        dic['create_time'] = format_datetime(self.created_at, '%Y-%m-%d %H:%M:%S')
        dic['update_time'] = format_datetime(self.updated_at, '%Y-%m-%d %H:%M:%S')
        dic['delete_time'] = format_datetime(self.deleted_at, '%Y-%m-%d %H:%M:%S')
