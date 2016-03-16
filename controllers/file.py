# -*- coding: utf-8 -*-
from __future__ import unicode_literals

import flask

from config import BlogConfig
from models import resource_gfs

__author__ = 'fleago'

from . import *  # 从__init__中导入所有的文件
from models.blog_model import Blog
from utils.common_utils import now_lambda, format_datetime

file_op_app = Blueprint('file_op', __name__)

@file_op_app.before_request
@login_required
def before_request():
    """统一设置本模块权限"""
    pass


def resource_gfs_url(filename):
    """构建访问xx-resource-file的url"""
    return "%s/file/view/%s" % ('127.0.0.1:5000', unicode(filename))


@file_op_app.route('/file/upload', methods=['POST'])
def upload():
    """上传资源文件"""
    if len(request.files) > 1:
        return jsonify(success=False, error='不支持多个文件上传')

    f = request.files.values()[0]

    file_id = save_gfs_file(resource_gfs, f)
    if file_id:
        url = resource_gfs_url(file_id)
        return jsonify(success=True,
                       filename=f.filename,
                       file_id=file_id,
                       url=url)
    else:
        return jsonify(success=False)


@file_op_app.route('/file/upload', methods=['GET'])
def get_upload():
    '''获得上传的页面'''
    # return render_template('file/small_file.html')
    # return render_template('file/index.html')
    return render_template('file/file_upload.html')
    # return render_template('file/basic-plus.html')
    # return render_template('file/angularjs.html')


def get_gfs_file(gfs, data=None, **gfs_kwargs):
    """
    此函数废弃，请用models.gridfs_models

    gfs: image_gfs或audio_gfs之一

    检查MongoGFS里是否存在指定条件的文件。
    如果存在，返回gridfs file object
    如果不存在，返回None

    如果存在多份，则返回_id最小的那个。
    如果给了文件data，会自动算它的md5。
    """
    print '[WARN]  Please use models.gridfs_models.* instead of get_gfs_file().'

    if data:
        md5 = hashlib.md5(data).hexdigest()
        gfs_kwargs['md5'] = md5
    gfs_files = [gfs_file for gfs_file in gfs.find(gfs_kwargs)]
    if gfs_files:
        gfs_files.sort(key=lambda x: x._id)
        return gfs_files[0]
    return None


@file_op_app.route('/file/download/<string:filename>', methods=['GET'])
def download(filename):
    """下载资源文件"""
    f = get_gfs_file(resource_gfs, filename=filename)
    if not f:
        abort(404)
    download_name = f.original_filename if hasattr(f, 'original_filename') else f.filename
    return send_file(
        f,
        mimetype=f.content_type,
        as_attachment=True,
        add_etags=False,
        attachment_filename=download_name)


@file_op_app.route('/file/view/<string:filename>', methods=['GET'])
def view(filename):
    f = get_gfs_file(resource_gfs, filename=filename)
    if not f:
        abort(404)
    return flask.Response(f.readchunk(), mimetype=f.content_type)
