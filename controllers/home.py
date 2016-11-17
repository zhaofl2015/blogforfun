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
import random

from models.es_model import ES
from utils.es_utils import es_query, es_extract_info, es_extract_id, es_extract_info_with_highlight
from . import *  # 从__init__中导入所有的文件
from models.blog_model import Blog, BlogTag
from utils.common_utils import now_lambda, format_datetime, to_datetime, get_next_month

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

    return render_template('home/blog.html', blogs=blogs, monthes=monthes, total=total, per_page=per_page, page=page,
                           keyword='', tags=get_tags_cloud(), blog_count=get_blog_count(), next_page_url='blogs')


@home_app.route('/search-blog', methods=['POST'])
def search_blog():
    """根据传入的信息，进行搜搜"""
    keyword = request.form.get('keyword', '').strip()
    if not keyword:
        # return jsonify(success=False, error='请输入关键字')
        flash(u'请输入关键字', category='error')
        # abort(404)

    res_list = list()
    ret_title = es_query(title=keyword)
    timed_out, took, total, item_list = es_extract_info_with_highlight(ret_title)
    res_list.extend(item_list)
    res_ids = set(es_extract_id(ret_title)[3])

    ret_content = es_query(content=keyword)
    timed_out, took, total, item_list = es_extract_info_with_highlight(ret_content)
    for item in item_list:
        if item['id'] not in res_ids:
            res_list.append(item)
            res_ids.add(item['id'])

    total = len(res_list)
    page = request.form.get('page', 1, int)
    per_page = 10

    blogs = res_list[per_page * (page - 1): per_page * page]

    return render_template('home/blog_search.html', blogs=blogs, total=total, per_page=per_page, page=page,
                           keyword=keyword, tags=get_tags_cloud(), blog_count=get_blog_count(), next_page_url='search-blog')


@home_app.route('/blog-category/<string:tag_name>', methods=['GET'])
def get_category_blogs(tag_name):
    """返回某个分类的blog"""
    page = request.args.get('page', 1, int)
    per_page = 10
    if current_user.is_authenticated is False:
        visible = [Blog.VISIBLE_ALL]
    else:
        visible = [Blog.VISIBLE_ALL, Blog.VISIBLE_LOGIN, Blog.VISIBLE_OWNER]
    blogs = list()
    for item in Blog.objects(delete_time=None, visible__in=visible, tags=tag_name):
        if item.visible == Blog.VISIBLE_OWNER and item.author != current_user.id:
            continue
        else:
            blogs.append(item.as_dict())
    blogs.sort(key=lambda item: item['create_time'], reverse=True)
    total = len(blogs)
    blogs = blogs[per_page * (page - 1): per_page * page]
    monthes = get_all_month()
    return render_template('home/blog.html', blogs=blogs, monthes=monthes, total=total, per_page=per_page, page=page,
                           keyword='', tags=get_tags_cloud(), blog_count=get_blog_count(), next_page_url='blog-category/%s' % tag_name)


@home_app.route('/blog-archive/<string:month>', methods=['GET'])
def get_archive_blogs(month):
    """返回某一月的blog"""
    page = request.args.get('page', 1, int)
    per_page = 10
    if current_user.is_authenticated is False:
        visible = [Blog.VISIBLE_ALL]
    else:
        visible = [Blog.VISIBLE_ALL, Blog.VISIBLE_LOGIN, Blog.VISIBLE_OWNER]
    blogs = list()
    for item in Blog.objects(delete_time=None, visible__in=visible,
                             create_time__gte=to_datetime(month + '-01 00:00:00', '%Y-%m-%d %H:%M:%S'),
                             create_time__lt=to_datetime(get_next_month(month) + '-01 00:00:00', '%Y-%m-%d %H:%M:%S')):
        if item.visible == Blog.VISIBLE_OWNER and item.author != current_user.id:
            continue
        else:
            blogs.append(item.as_dict())

    blogs.sort(key=lambda item: item['create_time'], reverse=True)
    total = len(blogs)
    blogs = blogs[per_page * (page - 1): per_page * page]
    monthes = get_all_month()
    return render_template('home/blog.html', blogs=blogs, monthes=monthes, total=total, per_page=per_page, page=page,
                           keyword='', tags=get_tags_cloud(), blog_count=get_blog_count(), next_page_url='blog-archive/%s' % month)


@home_app.route('/blog/<string:id>', methods=['GET'])
def show_blog(id):
    blog = Blog.objects.with_id(ObjectId(id))
    if not blog:
        return jsonify(success=False, error='不存在该日志')
    if (blog.visible in [Blog.VISIBLE_LOGIN, Blog.VISIBLE_OWNER] and current_user.is_authenticated is False) \
        or (blog.visible == Blog.VISIBLE_OWNER and current_user.id != blog.author):
        return abort(403)

    # 增加观看量
    Blog.objects(id=ObjectId(id)).update(inc__view_count=1)
    # 设置上个观察者的ip
    Blog.objects(id=ObjectId(id)).update(set__last_view_ip=request.remote_addr)
    # 设置上个观看者的用户id
    Blog.objects(id=ObjectId(id)).update(set__last_view_user=current_user.id if current_user.is_active and current_user.is_anounymous is False else None)
    # 设置上次观看的时间
    Blog.objects(id=ObjectId(id)).update(set__last_view_time=now_lambda())

    prev, next = Blog.get_prev_next(unicode(blog.id), current_user)
    monthes = get_all_month()
    return render_template('home/blog_detail.html', blog=blog.as_dict(), prev=prev, next=next, monthes=monthes, tags=get_tags_cloud())


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

    # 更新实际使用的tag的数量，之前的数量已经不准确
    es = ES.connect_host()
    ret = es.search('simpleblog', 'blogpost', {
        'aggs': {
            'all_tags': {
                'terms': {
                    'field': 'tags',
                    'size': 0
                }
            }
        }
    }, size=1000)

    name_count = dict([(b['key'], b['doc_count']) for b in ret['aggregations']['all_tags']['buckets']])

    for item in res_list:
        if item['name'] in name_count:
            item['count'] = name_count.get(item['name'])
            item['name_count'] = '%s (%d)' % (item['name'], item['count'])
        else:
            item['count'] = 0
            item['name_count'] = '%s (%d)' % (item['name'], 0)

    return res_list


def get_tags_cloud():
    """根据标签数据构造标签云"""
    tags = get_tags()
    tags.sort(key=lambda x: x['last_use_time'], reverse=True)
    for item in tags:
        item.update({'css_type': 'tagc%d' % random.randint(1, 3), 'url': '/blog-category/%s' % item.get('name')})
    # tags = [item.update({'css_type': 'tagc%d' % random.randint(1, 3), 'url': '/blog-category/%s' % item.get('name')}) for item in tags]
    return tags


def get_blog_count():
    """
    获得自己的博客数量
    user_id 是ObjectId
    """
    if not current_user.is_active:
        return 0
    count = Blog.objects(author=current_user.id, delete_time=None).count()
    return count


@home_app.context_processor
def go_for_play():
    return dict(gogogo='1+2=3? You got it! in home app')


@home_app.context_processor
def go_for_var():
    def say_hello(username='Nobody'):
        return 'hello %s' % username
    return dict(say_hello=say_hello)