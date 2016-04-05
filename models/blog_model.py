#!/usr/bin/env python
# encoding: utf-8


"""
@author: fleago
@license: github Licence 
@contact: fleago@163.com
@site: notyet
@software: PyCharm
@file: blog_model.py
@time: 2015/10/25 21:35
"""
from bson import ObjectId
from models.user_models import BlogUser
from utils.common_utils import now_lambda, format_datetime, clean_all_html
from . import *


class Blog(Document):
    VISIBLE_ALL = 1
    VISIBLE_LOGIN = 2
    VISIBLE_OWNER = 3

    VISIBLE_TYPE = [
        (VISIBLE_ALL, '所有人可见'),
        (VISIBLE_LOGIN, '登录可见'),
        (VISIBLE_OWNER, '作者可见'),
    ]

    title = StringField(required=True)
    comment = ListField(StringField())
    content = StringField(default='')
    author = ObjectIdField()
    create_time = DateTimeField(default=now_lambda())
    update_time = DateTimeField(default=None)
    delete_time = DateTimeField(default=None)
    last_comment_time = DateTimeField(default=None)
    view_count = IntField(default=0)
    last_view_time = DateTimeField(default=None)
    last_view_ip = StringField(default=None)
    last_view_user = ObjectIdField()
    visible = IntField(choices=VISIBLE_TYPE, default=VISIBLE_ALL)

    meta = {
        'collection' : 'simpleblog',
        'db_alias' : BlogConfig.mongodb_blog_alias,
        'strict' : False
    }

    @classmethod
    def get_prev_next(cls, blog_id):
        '''
        获得前一篇文章的id，根据时间倒叙排序
        :return:
        '''
        id_list = []
        for item in cls.objects(delete_time=None).order_by("create_time").only('id').all():
            id_list.append(unicode(item.id))
        # print id_list
        try:
            ind = id_list.index(blog_id)
        except ValueError:
            ind = -1
        if ind == -1 or len(id_list) <= 1:
            return None, None
        elif ind == 0:
            return None, id_list[1]
        elif ind == len(id_list) - 1:
            return id_list[-2], None
        else:
            return id_list[ind - 1], id_list[ind + 1]

    def as_dict(self, with_permisson=True):
        dic = dict(self.to_mongo())
        dic['_id'] = unicode(self.id)
        dic['id'] = unicode(self.id)
        try:
            dic['author'] = BlogUser.objects.with_id(ObjectId(self.author)).username
        except AttributeError:
            dic['author'] = unicode(self.author)
        dic['last_view_user'] = unicode(self.last_view_user)
        dic['create_time'] = format_datetime(self.create_time)
        dic['update_time'] = format_datetime(self.update_time)
        dic['delete_time'] = format_datetime(self.delete_time)
        dic['last_comment_time'] = format_datetime(self.last_comment_time)
        dic['summary'] = clean_all_html(self.content)[:20]
        dic['comment_num'] = len(self.comment) if self.comment else 0
        if with_permisson:
            dic['could_delete'] = True
            dic['could_edit'] = True
        # dic['visible_text'] = self.get_visible_display()
        return dic


if __name__ == '__main__':
    pass