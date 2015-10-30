#!/usr/bin/env python
# -*- coding: utf-8 -*-
from mongoengine import *
from config import BlogConfig
from flask.ext.mongoengine import Document  # 覆盖mongoengine的Document，使用pagination功能


__author__ = 'fleago'

blog_connect = connect(BlogConfig.mongodb_blog_name, alias=BlogConfig.mongodb_blog_alias,
                       host='mongodb://' + BlogConfig.mongodb_host)
