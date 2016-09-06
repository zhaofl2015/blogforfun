# -*- coding: utf-8 -*-
from __future__ import unicode_literals

import datetime
import json

__author__ = 'fanglei.zhao'

from models.es_model import ES


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
