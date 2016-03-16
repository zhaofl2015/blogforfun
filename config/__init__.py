# -*- coding: utf-8 -*-
from __future__ import unicode_literals
import os
import pyaml

__author__ = 'fleago'

config_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'database.yaml')
yaml = pyaml.yaml.safe_load(open(config_path))

class BlogConfig(object):
    """配置"""

    SALT = 'justforfun'
    yaml = yaml
    stage = yaml['stage']

    root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

    mongodb_blog_name = 'simpleblog'
    mongodb_user_name = 'simpleuser'

    mongodb_blog_alias = mongodb_blog_name
    mongodb_user_name = mongodb_user_name

    mongodb_resource_name = "simpleblog"
    mongodb_resource_alias = mongodb_resource_name

    mongodb_gfs_resource_host = yaml[stage]['mongo-gfs']['host']
    mongodb_host = yaml[stage]['mongo']['host']


class BlogConst(object):
    """定义常量类"""

    pass
