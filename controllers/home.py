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
from utils.es_utils import es_query, es_extract_info, es_extract_id
from . import *  # 从__init__中导入所有的文件
from models.blog_model import Blog, BlogTag
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


@home_app.route('/blogs', methods=['GET'])
def blogs():
    if request.method == 'GET':
        page = request.args.get('page', 1, int)
        per_page = 10
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
        total = len(blogs)
        blogs = blogs[per_page * (page - 1): per_page * page]
    else:
        pass

    monthes = get_all_month()

    return render_template('home/blog.html', blogs=blogs, monthes=monthes, total=total, per_page=per_page, page=page)


@home_app.route('/search-blog', methods=['POST'])
def search_blog():
    """根据传入的信息，进行搜搜"""
    keyword = request.form.get('keyword', '').strip()
    if not keyword:
        return jsonify(success=False, error='请输入关键字')

    res_ids = list()
    ret_title = es_query(title=keyword)
    timed_out, took, total, id_list = es_extract_id(ret_title)
    res_ids.extend(id_list)

    ret_content = es_query(content=keyword)
    timed_out, took, total, id_list = es_extract_id(ret_content)
    res_ids.extend(id_list)

    res_ids = list(set(res_ids))

    blogs = list()

    for _id in res_ids:
        blog = Blog.objects.with_id(ObjectId(_id))
        if blog:
            blogs.append(blog.as_dict())

    total = len(blogs)
    page = request.form.get('page', 1, int)
    per_page = 10

    monthes = get_all_month()

    blogs = blogs[per_page * (page - 1): per_page * page]

    return render_template('home/blog.html', blogs=blogs, monthes=monthes, total=total, per_page=per_page, page=page)


@home_app.route('/blog/<string:id>', methods=['GET'])
def show_blog(id):
    blog = Blog.objects.with_id(ObjectId(id))
    if not blog:
        return jsonify(success=False, error='不存在该日志')
    if (blog.visible in [Blog.VISIBLE_LOGIN, Blog.VISIBLE_OWNER] and current_user.is_authenticated is False) \
        or (blog.visible == Blog.VISIBLE_OWNER and current_user.id != blog.author):
        return abort(403)

    prev, next = Blog.get_prev_next(unicode(blog.id), current_user)
    monthes = get_all_month()
    return render_template('home/blog_detail.html', blog=blog.as_dict(), prev=prev, next=next, monthes=monthes)


@home_app.route('/blog-edit', methods=['GET', 'POST'])
@login_required
def blog_edit():
    if request.method == 'GET':
        tags = get_tags()
        tags = map(lambda x: x['name'], tags)
        blog = None
        _id = request.args.get('id', '')
        if _id:
            blog = Blog.objects.with_id(_id)
            for tag in blog.tags:
                if tag in tags:
                    tags.remove(tag)
        tag_list = tags
        tags = json.dumps(tags)
        if blog:
            return render_template('home/blog_edit2.html', blog=blog, data=json.dumps(blog.as_dict()), tags=tags,
                                   tag_list=tag_list)
        else:
            return render_template('home/blog_edit2.html', blog=None, data=json.dumps({}), tags=tags, tag_list=tag_list)
    else:
        _id = request.form.get('id', '').strip()
        if _id:
            blog = Blog.objects.with_id(_id)
        else:
            blog = Blog()
        title = request.form.get('title', '').strip()
        content = request.form.get('content', '').strip()
        visible = request.form.get('visible', 1, int)
        tags = request.form.getlist('tags[]')
        blog.title = title
        blog.content = content
        blog.author = current_user.id
        blog.visible = visible
        blog.tags = tags
        if _id:
            blog.update_time = now_lambda()
        else:
            blog.create_time = now_lambda()
            blog.update_time = blog.create_time
        try:
           blog.save()
        except ValidationError, e:
            return jsonify(success=False, error='save failed %s' % e)

        # 保存tag
        for tag in tags:
            blog_tag = BlogTag.objects(name=tag).first()
            if not blog_tag:
                blog_tag = BlogTag(name=tag, count=1, last_use_time=now_lambda(), create_time=now_lambda())
                blog_tag.save()
            else:
                blog_tag.update_time = now_lambda()
                blog_tag.last_use_time = now_lambda()
                blog_tag.count += 1
                blog_tag.save()
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
    res_list = list(res_list)
    res_list.sort(reverse=True)
    return res_list


def get_tags():
    res_list = list()
    for item in BlogTag.objects(delete_time=None).order_by('-count'):
        res_list.append(item.as_dict())
    return res_list
    # return jsonify()


@home_app.context_processor
def go_for_play():
    return dict(gogogo='1+2=3? You got it! in home app')

@home_app.context_processor
def go_for_var():
    def say_hello(username='Nobody'):
        return 'hello %s' % username
    return dict(say_hello=say_hello)