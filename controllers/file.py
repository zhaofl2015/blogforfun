# -*- coding: utf-8 -*-
from __future__ import unicode_literals

import base64
import re
import urllib2

import flask
from werkzeug.datastructures import FileStorage

from config import BlogConfig, BlogConst
from controllers.uploader import Uploader
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
    return "http://%s/file/view/%s" % ('127.0.0.1:5002', unicode(filename))


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
    filename = filename.split('.')[0]
    f = get_gfs_file(resource_gfs, filename=filename)
    if not f:
        abort(404)
    return flask.Response(f.readchunk(), mimetype=f.content_type)


@file_op_app.route('/file/ueditor/upload', methods=['GET', 'POST'])
def ueditor_upload():
    """ueditor接口"""
    mimetype = 'application/json'
    result = {}
    action = request.args.get('action')

    # 解析JSON格式的配置文件
    with open('static/ueditor/php/config.json') as fp:
        try:
            # 删除 `/**/` 之间的注释
            CONFIG = json.loads(re.sub(r'\/\*.*\*\/', '', fp.read()))
        except:
            CONFIG = {}

    # 初始化时，返回配置文件给客户端
    if action == 'config':
        result = CONFIG
    # 上传文件
    elif action in ('uploadimage', 'uploadvideo', 'uploadfile'):
        # 图片、文件、视频上传
        # if action == 'uploadimage':
        #     fileName = CONFIG.get('imageFieldName')

        if len(request.files) > 1:
            result = {'state': '不支持多个文件同时上传'}
        else:
            f = request.files.values()[0]
            file_id = save_gfs_file(resource_gfs, f)
            f.close()
            result = {
                "state": "SUCCESS",
                "url": resource_gfs_url(file_id),
                "title": f.filename,
                "original": f.filename,
                # "type": "." + f.filename.split('.')[-1],
                # "size": 7819
            }
    # 涂鸦图片上传
    elif action == 'uploadscrawl':
        base64data = request.form['upfile']  # 这个表单名称以配置文件为准
        img = base64.b64decode(base64data)
        buff = StringIO()
        buff.write(img)
        buff.seek(0)
        # tricky save_gfs_file only accept FileStorage object or something like
        file_storage = FileStorage(filename='', content_type='image/png', content_length=buff.len, stream=buff)
        file_id = save_gfs_file(resource_gfs, file_storage)
        file_storage.close()
        result = {
            "state": "SUCCESS",
            "url": resource_gfs_url(file_id),
            "title": file_id,
            "original": file_id
        }
    # 抓取远程图片
    elif action == 'catchimage':
        sources = request.form.getlist('source[]')
        _list = []
        for source in sources:
            f = urllib2.urlopen(urllib2.Request(source, headers={'User-agent': 'Mozilla/5.0'}))
            buff = StringIO()
            buff.write(f.read())
            buff.seek(0)
            # tricky save_gfs_file only accept FileStorage object or something like
            file_storage = FileStorage(headers=f.headers, stream=buff)
            file_id = save_gfs_file(resource_gfs, file_storage)
            f.close()
            file_storage.close()
            _list.append({
                "url": resource_gfs_url(file_id),
                "source": source,
                "state": "SUCCESS"
            })
        result = {
            "state": "SUCCESS",
            "list": _list
        }
    else:
        result = {'state': '不能识别的action: %s' % action}

    # todo: 回调参数， 这个不知道有没有用到，从别处拷过来的
    if 'callback' in request.args:
        callback = request.args.get('callback')
        if re.match(r'^[\w_]+$', callback):
            result = '%s(%s)' % (callback, result)
            mimetype = 'application/javascript'
            res = make_response(result)
            res.mimetype = mimetype
            res.headers['Access-Control-Allow-Origin'] = '*'
            res.headers['Access-Control-Allow-Headers'] = 'X-Requested-With,X_Requested_With'
            return res
        else:
            result = {'state': 'callback参数不合法'}

    # return jsonify(result)
    # return json.dumps(result)
    result = json.dumps(result)
    # print result
    res = make_response(result)
    res.mimetype = 'application/json'
    res.headers['Access-Control-Allow-Origin'] = '*'
    res.headers['Access-Control-Allow-Headers'] = 'X-Requested-With,X_Requested_With'
    return res



@file_op_app.route('/upload', methods=['GET', 'POST', 'OPTIONS'])
def upload_web():
    """UEditor文件上传接口

    config 配置文件
    result 返回结果
    """
    mimetype = 'application/json'
    result = {}
    action = request.args.get('action')

    # 解析JSON格式的配置文件
    with open('static/ueditor/php/config.json') as fp:
        try:
            # 删除 `/**/` 之间的注释
            CONFIG = json.loads(re.sub(r'\/\*.*\*\/', '', fp.read()))
        except:
            CONFIG = {}

    if action == 'config':
        # 初始化时，返回配置文件给客户端
        result = CONFIG

    elif action in ('uploadimage', 'uploadfile', 'uploadvideo'):
        # 图片、文件、视频上传
        if action == 'uploadimage':
            fieldName = CONFIG.get('imageFieldName')
            config = {
                "pathFormat": CONFIG['imagePathFormat'],
                "maxSize": CONFIG['imageMaxSize'],
                "allowFiles": CONFIG['imageAllowFiles']
            }
        elif action == 'uploadvideo':
            fieldName = CONFIG.get('videoFieldName')
            config = {
                "pathFormat": CONFIG['videoPathFormat'],
                "maxSize": CONFIG['videoMaxSize'],
                "allowFiles": CONFIG['videoAllowFiles']
            }
        else:
            fieldName = CONFIG.get('fileFieldName')
            config = {
                "pathFormat": CONFIG['filePathFormat'],
                "maxSize": CONFIG['fileMaxSize'],
                "allowFiles": CONFIG['fileAllowFiles']
            }

        if fieldName in request.files:
            field = request.files[fieldName]
            uploader = Uploader(field, config, 'static')
            result = uploader.getFileInfo()
        else:
            result['state'] = '上传接口出错'

    elif action in ('uploadscrawl'):
        # 涂鸦上传
        fieldName = CONFIG.get('scrawlFieldName')
        config = {
            "pathFormat": CONFIG.get('scrawlPathFormat'),
            "maxSize": CONFIG.get('scrawlMaxSize'),
            "allowFiles": CONFIG.get('scrawlAllowFiles'),
            "oriName": "scrawl.png"
        }
        if fieldName in request.form:
            field = request.form[fieldName]
            uploader = Uploader(field, config, 'static', 'base64')
            result = uploader.getFileInfo()
        else:
            result['state'] = '上传接口出错'

    elif action in ('catchimage'):
        config = {
            "pathFormat": CONFIG['catcherPathFormat'],
            "maxSize": CONFIG['catcherMaxSize'],
            "allowFiles": CONFIG['catcherAllowFiles'],
            "oriName": "remote.png"
        }
        fieldName = CONFIG['catcherFieldName']

        if fieldName in request.form:
            # 这里比较奇怪，远程抓图提交的表单名称不是这个
            source = []
        elif '%s[]' % fieldName in request.form:
            # 而是这个
            source = request.form.getlist('%s[]' % fieldName)

        _list = []
        for imgurl in source:
            uploader = Uploader(imgurl, config, 'static', 'remote')
            info = uploader.getFileInfo()
            _list.append({
                'state': info['state'],
                'url': info['url'],
                'original': info['original'],
                'source': imgurl,
            })

        result['state'] = 'SUCCESS' if len(_list) > 0 else 'ERROR'
        result['list'] = _list

    else:
        result['state'] = '请求地址出错'

    result = json.dumps(result)

    if 'callback' in request.args:
        callback = request.args.get('callback')
        if re.match(r'^[\w_]+$', callback):
            result = '%s(%s)' % (callback, result)
            mimetype = 'application/javascript'
        else:
            result = json.dumps({'state': 'callback参数不合法'})

    res = make_response(result)
    res.mimetype = mimetype
    res.headers['Access-Control-Allow-Origin'] = '*'
    res.headers['Access-Control-Allow-Headers'] = 'X-Requested-With,X_Requested_With'
    return res
