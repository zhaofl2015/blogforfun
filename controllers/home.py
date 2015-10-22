#!/usr/bin/env python
# encoding: utf-8


"""
@version: ??
@author: fleago
@license: github Licence 
@contact: fleago@163.com
@site: notyet
@software: PyCharm
@file: home.py
@time: 2015/10/22 23:17
"""
from flask import Blueprint, render_template

home_app = Blueprint('home', __name__)


@home_app.route('/')
def home():
    return render_template('home/home.html')


class Main():
    def __init__(self):
        pass


if __name__ == '__main__':
    pass