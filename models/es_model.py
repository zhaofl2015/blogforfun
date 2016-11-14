# -*- coding: utf-8 -*-
from __future__ import unicode_literals

import elasticsearch

__author__ = 'fanglei.zhao'


class ES(object):
    @classmethod
    def connect_host(cls):
        hosts = [{'host': 'localhost', 'port': 9200}]
        es = elasticsearch.Elasticsearch(hosts,
                                         sniff_on_start=True,
                                         sniff_on_connection_fail=True,
                                         sniffer_timeout=600,
                                         timeout=60)
        return es