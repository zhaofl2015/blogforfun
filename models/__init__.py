#!/usr/bin/env python
# -*- coding: utf-8 -*-
from mongoengine import connect
from config import Config


__author__ = 'fleago'

blog_connect = connect(Config.mongodb_blog_name, alias=Config.mongodb_blog_alias,
                       host='mongodb://' + Config.mongodb_host)
