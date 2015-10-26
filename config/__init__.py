# -*- coding: utf-8 -*-
from __future__ import unicode_literals
import os
import pyaml

__author__ = 'fleago'

config_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'database.yaml')
yaml = pyaml.yaml.safe_load(open(config_path))

class Config(object):
    """配置"""

    SALT = 'justforfun'
    yaml = yaml
    stage = yaml['stage']

    root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

    mongodb_blog_name = 'simpleblog'
    mongodb_user_name = 'simpleuser'

    mongodb_blog_alias = mongodb_blog_name
    mongodb_user_name = mongodb_user_name

    mongodb_host = yaml[stage]['mongo']['host']
