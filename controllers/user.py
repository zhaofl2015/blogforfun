# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from config import BlogConfig
from models.user_models import BlogUser
from  . import *
from utils.common_utils import now_lambda

__author__ = 'fleago'


users_app = Blueprint('users', __name__)

login_manager = LoginManager()
login_manager.anonymous_user = BlogUser


@login_manager.user_loader
def load_user(username):
    return BlogUser.objects(username=username).first()


@users_app.route("/login", methods=["GET", "POST"])
def login():
    username = request.form.get('username')
    password = request.form.get('password')
    remember = request.form.get('remember') == 'True'
    if username and password:
        user = load_user(username)
        if (not user) or (not user.validate_password(password)):
            msg = "用户名或者密码错误"
            return render_template("users/login.html", msg=msg)
        login_user(user, remember)
        user.last_login_time = now_lambda()
        user.last_login_ip = request.remote_addr
        user.save()
        url = BlogConfig.stage == 'production' and 'http://online.mode/' or '/'
        return redirect(request.args.get("next") or url)
    return render_template("users/login.html", msg='', stage=BlogConfig.stage)


@users_app.route("/logout")
def logout():
    logout_user()
    return redirect("/login")


@login_manager.unauthorized_handler
def unauthorized():
    return redirect("/login")


def _could_modify(user):
    """判断当前用户是否可以修改user"""
    if not current_user.is_active():
        return False
    if current_user.is_admin:
        return True
    if current_user.id == user.id:
        return True
    return False

class FilterForm(Form):
    username = StringField('用户名', description='用户名')
    nickname = StringField('昵称', description='昵称')
    privilege = SelectField('权限', coerce=int, default=-1, choices=[(-1, '-权限-')] + BlogUser.PRIVILEGES)
    status = SelectField('状态', coerce=int, choices=[(1, '启用'), (0, '禁用')])
    submit = SubmitField('搜索')

@users_app.route('/users', methods=['GET', 'POST'])
@login_required
def index():
    if request.method == 'GET':
        form = FilterForm()
        return render_template('users/index.html', form=form)
    else:
        form = FilterForm(request.form)

        if not form.validate():
            return abort(403)

        query_set = BlogUser.objects(status=form.status.data, username__ne='admin')
        if form.username.data:
            query_set = query_set.filter(username__contains=form.username.data)
        if form.nickname.data:
            query_set = query_set.filter(nickname__contains=form.nickname.data)
        if form.privilege.data != -1:
            query_set = query_set.filter(privileges=form.privilege.data)

        page = request.form.get('page', 1, int)
        per_page = 15
        pagination = query_set.paginate(page=page, per_page=per_page)
        items_dic = list()
        for item in pagination.items:
            item_dic = item.as_json()
            items_dic.append(item_dic)
            item_dic['could_modify'] = current_user.is_admin

    return json.dumps({
        'users': items_dic,
        'page': page,
        'per_page': per_page,
        'total': pagination.total,
    })

class EditForm(Form):
    username = StringField('用户名', validators=[validators.required()])
    password = PasswordField('新密码', validators=[validators.optional()])
    password_confirm = PasswordField('确认密码', validators=[validators.optional()])
    nickname = StringField('昵称')
    email = StringField('邮箱')
    privileges = SelectMultipleField('权限', coerce=int, choices=BlogUser.PRIVILEGES,
                     widget=widgets.ListWidget(prefix_label=False), option_widget=widgets.CheckboxInput())
    status = SelectField('状态', coerce=int, choices=[(1, '启用'), (0, '禁用')])
    submit = SubmitField('保存')

    def __init__(self, *args, **kwargs):
        Form.__init__(self, *args, **kwargs)
        if kwargs['mode'] == 'edit_self':
            del self.username
            del self.privileges
            del self.status



@users_app.route('/users/edit', methods=['GET', 'POST'])
@login_required
def edit():
    user_id = request.args.get('user_id')
    if user_id:
        # 编辑用户
        user = BlogUser.objects.with_id(ObjectId(user_id))
        if not user:
            return '用户不存在'

        if user.id == current_user.id and not current_user.is_admin:
            # 编辑自己
            title = '编辑个人信息'
            mode = 'edit_self'
        elif current_user.is_admin:
            # 只有管理员能编辑其他用户
            title = '编辑用户信息'
            mode = 'edit_other'
        else:
            return '您没有这个权限'
    elif not current_user.is_admin:
        # 只有管理员能建立用户
        return '您没有这个权限'
    else:
        # 新建用户
        title = '新建用户'
        mode = 'create'
        user = BlogUser()

    if request.method == 'GET':
        form = EditForm(obj=user, mode=mode)
    else:
        form = EditForm(request.form, mode=mode)
        if form.validate():
            if form.password.data != form.password_confirm.data:
                flash('两次输入密码不一致')
            elif mode == 'create' and not form.password.data:
                flash('密码不能为空')
            elif mode == 'create' and BlogUser.objects(username=form.username.data).limit(1):
                flash('用户名已被占用')
            # elif form.password.data and (len(form.password.data) < 8 or
            #                              re.match(r'^\d+$', form.password.data) or
            #                              re.match(r'^[a-zA-Z]+$', form.password.data)):
            #     flash('密码需要超过8位，且同时包括字母和数字')
            else:
                user.nickname = form.nickname.data
                user.email = form.email.data
                if mode != 'edit_self':
                    user.username = form.username.data
                    user.privileges = form.privileges.data
                    user.status = form.status.data
                if form.password.data:
                    user.set_password(form.password.data)
                user.save()

                flash('保存成功')
    return render_template('users/edit.html', form=form, title=title)