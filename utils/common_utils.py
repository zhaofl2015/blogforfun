# -*- coding: utf-8 -*-
from __future__ import unicode_literals
import datetime

__author__ = 'fleago'


def now_lambda():
    return datetime.now()

def format_datetime(dt, format='%Y-%m-%d %H:%M:%S'):
    if not dt:
        return ''
    return dt.strftime(format)