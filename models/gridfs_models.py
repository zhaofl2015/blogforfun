# -*- coding: utf-8 -*-
from __future__ import unicode_literals

import models
import hashlib
from bson import ObjectId

from config import BlogConfig

__author__ = 'fleago'


class BaseGridFs(object):
    gfs = None
    collection = None
    _url_path = ''

    @classmethod
    def make_url(cls, filename):
        return "%s/%s/%s" % (BlogConfig.gfs_host, cls._url_path, unicode(filename))

    @classmethod
    def delete(cls, file_id):
        return cls.gfs.delete(file_id)

    @classmethod
    def exists(cls, **kwargs):
        return cls.gfs.exists(**kwargs)

    @classmethod
    def find(cls, **kwargs):
        return cls.gfs.find(kwargs)

    @classmethod
    def find_one(cls, **kwargs):
        return cls.gfs.find_one(kwargs)

    @classmethod
    def get_and_save(cls, save_to_path, **kwargs):
        """获取一个文件并保存到磁盘"""
        gf = cls.find_one(**kwargs)
        if gf:
            f = open(save_to_path, 'wb')
            f.write(gf.read())
            f.close()
            gf.seek(0)
            return gf
        return None

    @classmethod
    def new_file(cls, **kwargs):
        return cls.gfs.new_file(**kwargs)

    @classmethod
    def put(cls, data_or_fp, unique_check=True, contentType='', original_filename='', usage='', _id='', **kwargs):
        """
        保存一个文件

        必填参数：
        contentType        文件的mimetype
        original_filename   文件本身的名字，最好带扩展名
        usage               用途，自己填一个字符串。最好同一个地方出来的，用同一个字符串。

        选填参数：
        unique_check        是否检查MD5唯一性
        """
        assert 'content_type' not in kwargs, 'Please user contentType instead of content_type'
        assert contentType and original_filename and usage, 'BaseGridFs.put parameter absents'
        assert 'content_length' not in kwargs and 'contentLength' not in kwargs, 'Do Not Use These Parameters anymore'

        if unique_check:
            data_or_fp = data_or_fp.read() if hasattr(data_or_fp, 'read') else data_or_fp
            md5 = hashlib.md5(data_or_fp).hexdigest()
            if cls.gfs.exists(md5=md5):
                return False

        _id = ObjectId(_id) if _id else ObjectId()
        filename = unicode(_id)

        return cls.gfs.put(data_or_fp,
                           _id=_id,
                           filename=filename,
                           contentType=contentType,
                           original_filename=original_filename,
                           usage=usage,
                           **kwargs)

    @classmethod
    def put_from_disk(cls, path, **kwargs):
        """把磁盘上的一个文件保存到数据库，见cls.put()"""
        f = open(path, 'rb')
        ret = cls.put(f, **kwargs)
        f.close()
        return ret

    @classmethod
    def replace(cls, data_or_fp, _id, **new_meta):
        """用新数据替换一个文件，保留文件ID和必要的元信息"""
        _id = ObjectId(_id)
        meta = cls.collection.find_one({'_id': _id})
        if meta:
            del meta['length']
            del meta['chunkSize']
            del meta['uploadDate']
            del meta['md5']
            if 'content_length' in meta:
                del meta['content_length']
        else:
            meta = {}
        meta.update(new_meta)

        cls.delete(_id)
        return cls.put(data_or_fp, **meta)

    @classmethod
    def update_meta(cls, _id, **set_meta):
        """
        更新一个文件的元数据
        别忘了写$set
        """
        _id = ObjectId(_id)
        cls.collection.update({'_id': _id}, set_meta)


class ResourceGfs(BaseGridFs):
    gfs = models.resource_gfs
    collection = models.resource_db.fs.files
    _url_path = 'fs-resource'