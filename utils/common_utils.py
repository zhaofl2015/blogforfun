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


def to_datetime(dt_str, format='%Y-%m-%d %H:%M:%S'):
    """
    """
    # noinspection PyBroadException
    try:
        dt = datetime.strptime(dt_str, format)
        return dt
    except:
        return None


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
    """清除所有的html标签"""
    dr = re.compile(r'<[^>]+>', re.S)
    dd = dr.sub('', content)
    return dd


def keep_only_words(content):
    """清除html标签，且清除所有的转义符"""
    if isinstance(content, str):
        content = content.decode('utf8')
    content = clean_all_html(content)
    content = content.replace('&nbsp;', ' ')
    content = content.replace('&quot;', '\"')
    content = content.replace('&#39;', '\'')
    return content


def get_next_month(month_str):
    """
    month str 格式 2016-02
    :param month_str:
    :return:
    """
    year, month = month_str.split('-')
    if int(month) == 12:
        return '%d-%02d' % (int(year) + 1, 1)
    else:
        return '%d-%02d' % (int(year), int(month) + 1)
