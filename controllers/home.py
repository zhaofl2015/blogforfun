#!/usr/bin/env python
# encoding: utf-8


"""
@author: fleago
@license: github Licence 
@contact: fleago@163.com
@site: notyet
@software: PyCharm
@file: home.py
@time: 2015/10/22 23:17
"""

from . import *  # 从__init__中导入所有的文件

home_app = Blueprint('home', __name__)


@home_app.route('/')
@login_required
def home():
    return render_template('home/home.html')

@home_app.route('/test')
def test():
    return 'really, it happend'

@home_app.route('/hello')
def hello():
    # return url_for('.test')
    return redirect(url_for('.test'))

if __name__ == '__main__':
    pass