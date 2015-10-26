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
from flask import Blueprint, render_template, url_for, redirect

home_app = Blueprint('home', __name__)


@home_app.route('/')
def home():
    return render_template('home/home.html')


if __name__ == '__main__':
    pass