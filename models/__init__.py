#!/usr/bin/env python
# -*- coding: utf-8 -*-
from mongoengine import *
from mongoengine import signals
from config import BlogConfig
from gridfs import GridFS
from bson import ObjectId
from flask.ext.mongoengine import Document  # 覆盖mongoengine的Document，使用pagination功能


__author__ = 'fleago'

import es_model
import user_models

blog_connect = connect(BlogConfig.mongodb_blog_name, alias=BlogConfig.mongodb_blog_alias,
                       host='mongodb://' + BlogConfig.mongodb_host)
resource_gfs_connect = connect(BlogConfig.mongodb_resource_name, alias=BlogConfig.mongodb_resource_alias, host="mongodb://" + BlogConfig.mongodb_gfs_resource_host)
resource_db = resource_gfs_connect[BlogConfig.mongodb_resource_name]
resource_gfs = GridFS(resource_db)