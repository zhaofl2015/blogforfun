# -*- coding: utf-8 -*-
from __future__ import unicode_literals
from datetime import datetime
import os
from flask import url_for
import re

__author__ = 'fleago'

INTERNAL_CACHE = dict()

def now_lambda():
    return datetime.now()

def format_datetime(dt, format='%Y-%m-%d %H:%M:%S'):
    if not dt:
        return ''
    return dt.strftime(format)

def version_url(endpoint, **values):
    """给css、js的url后面加上最后修改时间。
    缓存了修改时间，所以如果有修改，重启才能清空缓存"""
    filename = values['filename']
    modify_time = INTERNAL_CACHE.get(filename)
    if not modify_time:
        full_path = get_path_by_root_path(os.path.join(endpoint, filename))
        if os.path.exists(full_path):
            modify_time = int(os.path.getmtime(full_path))
            INTERNAL_CACHE[full_path] = modify_time
    return url_for(endpoint, v=modify_time, **values)

def get_path_by_root_path(path_name):
    # 根据项目根目录定位，支持从不同目录启动脚本
    return os.path.abspath(os.path.join(os.path.dirname(os.path.dirname(__file__)), path_name))


def clean_all_html(content):
    dr = re.compile(r'<[^>]+>', re.S)
    dd = dr.sub('', content)
    return dd