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
import json

from bs4 import BeautifulSoup
from bson import ObjectId
# from flask.ext.login import current_user

from models.user_models import BlogUser
from utils.common_utils import now_lambda, format_datetime, clean_all_html, keep_only_words
from models.es_model import ES
from . import *


class Blog(Document):
    VISIBLE_ALL = 1
    VISIBLE_LOGIN = 2
    VISIBLE_OWNER = 3

    VISIBLE_TYPE = [
        (VISIBLE_ALL, u'所有人可见'),
        (VISIBLE_LOGIN, u'登录可见'),
        (VISIBLE_OWNER, u'作者可见'),
    ]

    VISIBLE_TYPE_DICT = dict(VISIBLE_TYPE)

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
    tags = ListField(StringField(required=True), default=[])

    meta = {
        'collection': 'simpleblog',
        'db_alias': BlogConfig.mongodb_blog_alias,
        'strict': False
    }

    @classmethod
    def get_blogs_could_view(cls, current_user, count):
        """
        获得一个用户可以查看的blog信息列表
        :param current_user:
        :param count:
        :return:
        """
        res_list = list()
        for item in cls.objects(delete_time=None, visible=cls.VISIBLE_ALL).limit(count):
            res_list.append(item)
        if current_user.is_authenticated:
            for item in cls.objects(Q(delete_time=None) & (Q(visible=cls.VISIBLE_LOGIN)
                                                               | (Q(visible=cls.VISIBLE_OWNER) &
                                                                      Q(author=current_user.id))))\
                    .only('id', 'create_time').all():
                res_list.append(item)
        return res_list

    @classmethod
    def get_prev_next(cls, blog_id, current_user):
        """
        获得前一篇文章的id，根据时间倒叙排序
        blog_id
        :return:
        """
        id_list = []

        for item in cls.objects(delete_time=None, visible=cls.VISIBLE_ALL).only('id', 'create_time').all():
            id_list.append((unicode(item.id), format_datetime(item.create_time)))
        if current_user.is_authenticated:
            for item in cls.objects(Q(delete_time=None) & (Q(visible=cls.VISIBLE_LOGIN)
                                                               | (Q(visible=cls.VISIBLE_OWNER) &
                                                                      Q(author=current_user.id))))\
                    .only('id', 'create_time').all():
                id_list.append((unicode(item.id), format_datetime(item.create_time)))

        id_list.sort(key=lambda x: x[1])
        id_list = map(lambda x: x[0], id_list)

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
        dic['summary'] = clean_all_html(self.content)[:20].lstrip('&nbsp;')
        dic['comment_num'] = len(self.comment) if self.comment else 0
        if with_permisson:
            dic['could_delete'] = True
            dic['could_edit'] = True
        dic['visible_text'] = self.VISIBLE_TYPE_DICT.get(self.visible, '')
        return dic

    @classmethod
    def post_save(cls, sender, document, **kwargs):
        data = {
            'id': unicode(document.id),
            'content': keep_only_words(document.content),
            'author': unicode(document.author),
            'title': document.title,
            'create_time': format_datetime(document.create_time, '%Y-%m-%d'),
            'update_time': format_datetime(document.update_time, '%Y-%m-%d'),
            'visible': document.visible,
            'tags': document.tags
        }

        try:
            es = ES.connect_host()
            es.index('simpleblog', 'blogpost', body=json.dumps(data), id=unicode(document.id))
        except Exception, e:
            print 'es connect failed, %s' % e

    @classmethod
    def pre_save(cls, sender, document, **kwargs):
        soup = BeautifulSoup(document.content)
        for img in soup.find_all('img'):
            img['width'] = '100%'
            img['height'] = '100%'
        document.content = str(soup)


class BlogTag(Document):
    """
        存储blog的tag
    """
    name = StringField(required=True)
    count = IntField(required=True, default=0)
    last_use_time = DateTimeField(required=True)
    create_time = DateTimeField(default=now_lambda())
    update_time = DateTimeField(default=None)
    delete_time = DateTimeField(default=None)

    meta = {
        'collection': 'blogtag',
        'db_alias': BlogConfig.mongodb_blog_alias,
        'strict': False
    }

    def as_dict(self):
        dic = dict(self.to_mongo())
        dic['_id'] = unicode(self.id)
        dic['id'] = unicode(self.id)
        dic['name_count'] = '%s (%d)' % (self.name, self.count)
        dic['last_use_time'] = format_datetime(self.last_use_time)
        dic['create_time'] = format_datetime(self.create_time)
        dic['update_time'] = format_datetime(self.update_time)
        dic['delete_time'] = format_datetime(self.delete_time)
        return dic


signals.post_save.connect(Blog.post_save, sender=Blog)
signals.pre_save.connect(Blog.pre_save, sender=Blog)
