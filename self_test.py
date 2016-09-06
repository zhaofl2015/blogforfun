# -*- coding: utf-8 -*-
from __future__ import unicode_literals

import json
import os

import datetime
import elasticsearch
import pyaml
import pymongo
from pymongo import MongoClient

from models.blog_model import Blog
from models.user_models import BlogUser
from utils.common_utils import now_lambda, clean_all_html, keep_only_words, format_datetime
from mongoengine import *

__author__ = 'fleago'

from mongoengine import connect
from config import BlogConfig

class TestList(Document):
    username = ListField(StringField(), default=None)

    meta = {
        'collection' : 'test_list',
        'db_alias' : BlogConfig.mongodb_blog_alias,
        'strict' : False
    }


def test_user():
    '''添加admin账号'''

    # user = BlogUser()
    # user.username = 'admin'
    # user.password = 'admin'
    # user.nickname = 'fleago'
    # user.email = 'fleago.163.com'
    #
    # user.is_admin = True
    # user.privileges = [BlogUser.PV_PUBLISH, BlogUser.PV_DELETE, BlogUser.PV_COMMENT, BlogUser.PV_EDIT]
    # user.status = 1
    # user.last_login_time = now_lambda()
    # user.created_at = now_lambda()
    #
    #
    # user.save()
    user = BlogUser.objects().first()
    print BlogUser.objects().count()
    print user.username, user.password, user.nickname, user.username
    # print BlogUser.objects(username='admin').first().username

def test_list():
    tl = TestList.objects().first()
    if not tl:
        tl = TestList()
        tl.save()
    # tl.username = ['a', 'b']
    tl.username = []
    tl.save()
    t2 = TestList()
    t2.save()


def test_prev_next():
    print Blog.get_prev_next('56c462de59acd1470c262e04')


def test_update_return():
    root = os.path.dirname(os.path.abspath(__file__))
    config_path = os.path.join(root, 'config', 'database.yaml')
    yaml = pyaml.yaml.safe_load(open(config_path))
    config = yaml[yaml['stage']]
    client = MongoClient(config['mongo']['host'])
    test = client['simpleblog']['test']
    ret = test.update({'x': 'z'}, {'$set': {'x': '1'}})
    print ret
    try:
        ret = test.find({'x': 2}).next()
        print ret
    except StopIteration:
        print 'no info'
    a = test.find_one({'x': '1'}, sort=[('x', pymongo.ASCENDING)])
    print a


def test_chrome():
    from selenium import webdriver

    browser = webdriver.Chrome('C:\Program Files (x86)\Google\Chrome\Application\chrome.exe')
    browser.get('http://www.baidu.com/')


def put_info_into_es():
    root = os.path.dirname(os.path.abspath(__file__))
    config_path = os.path.join(root, 'config', 'database.yaml')
    yaml = pyaml.yaml.safe_load(open(config_path))
    config = yaml[yaml['stage']]
    client = MongoClient(config['mongo']['host'])
    blogtb = client['simpleblog']['simpleblog']

    es = ES.connect_host()
    for blog in blogtb.find():
        # print blog['title'], keep_only_words(blog['content'])
        try:
            data = {
                'id': unicode(blog['_id']),
                'content': keep_only_words(blog['content']),
                'author': unicode(blog['author']),
                'title': blog['title'],
                'create_time': format_datetime(blog['create_time'], '%Y-%m-%d'),
                # 'create_time': format_datetime(blog['create_time'], '%Y/%m/%d %H:%M:%S'),
                'update_time': format_datetime(blog['update_time'], '%Y-%m-%d'),
                # 'update_time': format_datetime(blog['update_time'], '%Y/%m/%d %H:%M:%S'),
                'visible': blog['visible'],
            }
        except Exception, e:
            print blog['title']
            print e
            continue
        # print format_datetime(blog['create_time'], '%Y/%m/%d %H:%M:%S')
        es.index('simpleblog', 'blogpost', body=json.dumps(data), id=unicode(blog['_id']))


class ES(object):
    @classmethod
    def connect_host(cls):
        hosts = [{'host': 'localhost', 'port': 9200}]
        es = elasticsearch.Elasticsearch(hosts,
                                         sniff_on_start=True,
                                         sniff_on_connection_fail=True,
                                         sniffer_timeout=600)
        return es


def es_query(title="", start=None, end=None, reverse=False, limit_cnt=20, content=''):
    es = ES.connect_host()
    now = datetime.datetime.now()
    if reverse:
        order = "desc"
    else:
        order = "asc"
    if not start:
        start = now - datetime.timedelta(weeks=2000)
    if not end:
        end = now
    range_body = {
        "range": {
            "create_time": {
                "gte": start,
                "lte": end
            }
        }
    }
    and_list = [range_body]
    title_body = {
        "term": {
            "title": title
        }
    }
    content_body = {
        "term": {
            "content": content
        }
    }
    if title:
        and_list.append(title_body)
    if content:
        and_list.append(content_body)
    q_body = {
        "size": limit_cnt,
        "sort": [
            {
                "create_time": {
                    "order": order
                }
            }
        ],
        "query": {
            "filtered": {
                "query": {"matchAll": {}},
                "filter": {
                    "and": and_list
                }
            }
        }
    }
    res = es.search(body=q_body)
    print json.dumps(res)
    ret = []
    for hit in res["hits"]["hits"]:
        value = {}
        src = hit["_source"]
        if src:
            try:
                the_time = src["create_time"]
                if len(the_time) < 20:
                    value["create_time"] = datetime.datetime.strptime(the_time, "%Y-%m-%d")
                else:
                    value["create_time"] = datetime.datetime.strptime(the_time, "%Y-%m-%dT%H:%M:%S.%f")
                ret.append(value)
            except Exception as e:
                print str(e)
                ret = []
                print "Query xxxxx data failed!"
    return ret


if __name__ == '__main__':
    # put_info_into_es()
    es_query(title='elasticsearch')
    pass