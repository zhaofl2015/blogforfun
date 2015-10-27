#!/usr/bin/env python
# -*- coding: utf-8 -*-

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

