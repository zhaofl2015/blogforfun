#!/usr/bin/env python
# -*- coding: utf-8 -*-
from mongoengine import connect
from config import BlogConfig


__author__ = 'fleago'

blog_connect = connect(BlogConfig.mongodb_blog_name, alias=BlogConfig.mongodb_blog_alias,
                       host='mongodb://' + BlogConfig.mongodb_host)
