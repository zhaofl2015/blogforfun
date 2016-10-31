# -*- coding: utf-8 -*-
from __future__ import unicode_literals

import copy
import datetime
import json

import re

__author__ = 'fanglei.zhao'

import models


def es_query(title="", start=None, end=None, reverse=False, limit_cnt=20, content=''):
    es = models.es_model.ES.connect_host()
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
        },
        "highlight": {
            "fields": {
                "title": {},
                "content": {},
            }
        }
    }
    res = es.search(body=q_body)
    # print json.dumps(res)
    # ret = []
    # for hit in res["hits"]["hits"]:
    #     value = {}
    #     src = hit["_source"]
    #     if src:
    #         try:
    #             the_time = src["create_time"]
    #             if len(the_time) < 20:
    #                 value["create_time"] = datetime.datetime.strptime(the_time, "%Y-%m-%d")
    #             else:
    #                 value["create_time"] = datetime.datetime.strptime(the_time, "%Y-%m-%dT%H:%M:%S.%f")
    #             ret.append(value)
    #         except Exception as e:
    #             print str(e)
    #             ret = []
    #             print "Query xxxxx data failed!"
    return res


def es_extract_info(search_res):
    """从查询的结果返回查询list"""
    # data = json.loads(search_res)
    data = search_res
    timed_out = data.get('timed_out', False)
    took = data.get('took', 0)
    total = data.get('hits', {}).get('total', 0)
    item_list = list()
    for item in data.get('hits', {}).get('hits', []):
        item_list.append(item.get('_source', {}))

    return timed_out, took, total, item_list


def es_extract_id(search_res):
    """从结果中抽取id"""
    timed_out, took, total, item_list = es_extract_info(search_res)
    id_list = list()
    for item in item_list:
        id_list.append(item.get('id', ''))

    return timed_out, took, total, id_list


def es_extract_info_with_highlight(search_res):
    """抽取信息，并高亮显示"""
    data = search_res
    timed_out = data.get('timed_out', False)
    took = data.get('took', 0)
    total = data.get('hits', {}).get('total', 0)
    item_list = list()
    for item in data.get('hits', {}).get('hits', []):
        highlight = item.get('highlight', {})
        item = item.get('_source', {})
        item['author'] = models.user_models.BlogUser.get_username_with_id(item['author'])
        for k, v in highlight.iteritems():
            item[k] = re.sub('<em>([^<]*)</em>', '<em><font color="red">\g<1></font></em>', v[0])

        item_list.append(item)

    return timed_out, took, total, item_list
