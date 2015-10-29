# -*- coding: utf-8 -*-
from __future__ import unicode_literals
from models.user_models import BlogUser
from utils.common_utils import now_lambda

__author__ = 'fleago'

from mongoengine import connect
from config import BlogConfig



def test_user():
    '''添加admin账号'''

    # user = BlogUser()
    # user.username = 'admin'
    # user.password = 'admin'
    # user.nickname = 'fleago'
    # user.email = 'fleago.163.com'
    #
    # user.is_admin = True
    # user.privileges = [BlogUser.PV_PUBLISH, BlogUser.PV_DELETE, BlogUser.PV_COMMENT, BlogUser.PV_EDIT]
    # user.status = 1
    # user.last_login_time = now_lambda()
    # user.created_at = now_lambda()
    #
    #
    # user.save()
    user = BlogUser.objects().first()
    print BlogUser.objects().count()
    print user.username, user.password, user.nickname, user.username
    # print BlogUser.objects(username='admin').first().username


if __name__ == '__main__':
    test_user()
    pass