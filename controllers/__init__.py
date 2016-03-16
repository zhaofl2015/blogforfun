#!/usr/bin/env python
# -*- coding: utf-8 -*-
import hashlib
import imghdr
from PIL import Image
from StringIO import StringIO

__author__ = 'fleago'

import os
from collections import defaultdict
from datetime import datetime, timedelta
from functools import wraps

from bson import ObjectId
from wtforms import Form, widgets, SelectField, SubmitField, validators, DateTimeField, StringField, IntegerField, \
    TextAreaField, FloatField, SelectMultipleField, PasswordField, FileField, BooleanField, DateField, DecimalField, \
    HiddenField, RadioField, TextField, FormField, FieldList

from flask import *

from flask.ext.login import current_user, login_required, LoginManager, login_user, logout_user
from mongoengine import Q, ValidationError, NotUniqueError


def exif_orientation_filter(f):
    """按exif.Orientation旋转图片，只保留图片，不保留图片所带相关信息"""
    if not imghdr.what(f):
        return f.read()

    im = Image.open(f)
    # noinspection PyBroadException
    try:
        exif_data = im._getexif()
        orientation = exif_data.get(0x0112)
    except:
        orientation = None
    if not orientation:
        f.seek(0)
        return f.read()

    if orientation == 2:
        # Vertical Mirror
        mirror = im.transpose(Image.FLIP_LEFT_RIGHT)
    elif orientation == 3:
        # Rotation 180°
        mirror = im.transpose(Image.ROTATE_180)
    elif orientation == 4:
        # Horizontal Mirror
        mirror = im.transpose(Image.FLIP_TOP_BOTTOM)
    elif orientation == 5:
        # Horizontal Mirror + Rotation 90° CCW
        mirror = im.transpose(Image.FLIP_TOP_BOTTOM).transpose(Image.ROTATE_90)
    elif orientation == 6:
        # Rotation 270°
        mirror = im.transpose(Image.ROTATE_270)
    elif orientation == 7:
        # Horizontal Mirror + Rotation 270°
        mirror = im.transpose(Image.FLIP_TOP_BOTTOM).transpose(Image.ROTATE_270)
    elif orientation == 8:
        # Rotation 90°
        mirror = im.transpose(Image.ROTATE_90)
    else:
        mirror = im
    buff = StringIO()
    mirror.save(buff, format=im.format)
    buff.seek(0)
    blob = buff.read()
    buff.close()
    # Image will be auto-closed while exit
    return blob


def save_gfs_file(gfs, file, extras=None):
    """
    此函数废弃，请用models.gridfs_models


    将上传的文件保存到gfs
    """
    print '[WARN]  Please use models.gridfs_models.* instead of save_gfs_file().'

    extras = extras or dict()
    blob = exif_orientation_filter(file)
    md5 = hashlib.md5(blob).hexdigest()
    content_length = file.content_length if file.content_length > 0 else len(blob)
    exist = gfs.find_one({'md5': md5})
    if exist:
        gfs_file_name = exist.filename or str(exist._id)
    else:
        # content_type = file.content_type
        # original_filename = file.filename
        gfs_id = ObjectId()
        gfs_file_name = str(gfs_id)

        params = dict(contentType=file.content_type, original_filename=file.filename, _id=gfs_id, content_length=content_length, filename=gfs_file_name, **extras)
        gfs.put(blob, **params)

    return gfs_file_name