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

from . import *  # 从__init__中导入所有的文件
from models.blog_model import Blog
from utils.common_utils import now_lambda, format_datetime

home_app = Blueprint('home', __name__)


@home_app.before_request
# @login_required
def before_request():
    """统一设置本模块权限"""
    pass


@home_app.route('/')
@login_required
def home():
    return render_template('home/home.html')


@home_app.route('/test')
def test():
    return 'really, it happend'


@home_app.route('/hello')
def hello():
    # return url_for('.test')
    return redirect(url_for('.test'))


@home_app.route('/about')
def about():
    return 'you are such a handsome guy' + current_user.username


@home_app.route('/blogs')
def blogs():
    if current_user.is_authenticated is False:
        visible = [Blog.VISIBLE_ALL]
    else:
        visible = [Blog.VISIBLE_ALL, Blog.VISIBLE_LOGIN, Blog.VISIBLE_OWNER]
    blogs = list()
    for item in Blog.objects(delete_time=None, visible__in=visible):
        if item.visible == Blog.VISIBLE_OWNER and item.author != current_user.id:
            continue
        else:
            blogs.append(item.as_dict())
    # blogs = [item.as_dict() for item in Blog.objects(delete_time=None)]
    blogs.sort(key=lambda item: item['create_time'], reverse=True)
    monthes = get_all_month()
    return render_template('home/blog.html', blogs=blogs, monthes=monthes)


@home_app.route('/blog/<string:id>', methods=['GET'])
def show_blog(id):
    blog = Blog.objects.with_id(ObjectId(id))
    if not blog:
        return jsonify(success=False, error='不存在该日志')
    if (blog.visible in [Blog.VISIBLE_LOGIN, Blog.VISIBLE_OWNER] and current_user.is_authenticated is False) \
        or (blog.visible == Blog.VISIBLE_OWNER and current_user.id != blog.author):
        return abort(403)

    prev, next = Blog.get_prev_next(unicode(blog.id))
    monthes = get_all_month()
    return render_template('home/blog_detail.html', blog=blog.as_dict(), prev=prev, next=next, monthes=monthes)


@home_app.route('/blog-edit', methods=['GET', 'POST'])
@login_required
def blog_edit():
    if request.method == 'GET':
        blog = None
        _id = request.args.get('id', '')
        if _id:
            blog = Blog.objects.with_id(_id)
        if blog:
            return render_template('home/blog_edit2.html', blog=blog, data=json.dumps(blog.as_dict()))
        else:
            return render_template('home/blog_edit2.html', blog=None, data=json.dumps({}))
    else:
        _id = request.form.get('id', '').strip()
        if _id:
            blog = Blog.objects.with_id(_id)
        else:
            blog = Blog()
        title = request.form.get('title', '').strip()
        content = request.form.get('content', '').strip()
        visible = request.form.get('visible', 1, int)
        blog.title = title
        blog.content = content
        blog.author = current_user.id
        blog.visible = visible
        if _id:
            blog.update_time = now_lambda()
        else:
            blog.create_time = now_lambda()
        try:
           blog.save()
        except ValidationError, e:
            return jsonify(success=False, error='save failed %s' % e)
        return jsonify(success=True, error='提交成功', blog=blog.reload().as_dict())


@home_app.route('/blog-delete', methods=['POST', 'GET'])
@login_required
def blog_delete():
    _id = request.form.get('id', '')
    if not _id:
        _id = request.args.get('id', '')
        if not _id:
            return jsonify(success=False, error='缺少信息')

    blog = Blog.objects.with_id(ObjectId(_id))
    if not blog:
        return jsonify(success=False, error='不存在该日志')

    blog.delete_time = now_lambda()

    try:
        blog.save()
    except ValidationError, e:
        return jsonify(success=False, error='save failed %s' % e)

    return jsonify(success=True, error='删除成功')


def get_all_month():
    res_list = set()
    for item in Blog.objects(delete_time=None):
        res_list.add(format_datetime(item.create_time, '%Y-%m'))
    return list(res_list)