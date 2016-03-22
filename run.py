#!/usr/bin/env python
# -*- coding: utf-8 -*-
from controllers.file import file_op_app
from controllers.user import login_manager
from utils.common_utils import version_url

__author__ = 'fleago'

from flask import Flask, g
from flask.ext.script import Manager, Server
from flask.ext.login import current_user, LoginManager
import config

from controllers.home import home_app
from controllers.user import users_app

app = Flask(__name__)
app.register_blueprint(home_app)
app.register_blueprint(users_app)
app.register_blueprint(file_op_app)
app.config['SECRET_KEY'] = 'simpleblog'

# login配置
login_manager.login_view = 'users.login'
login_manager.init_app(app)

# manager配置
manager = Manager(app)
manager.add_command("runserver", Server(threaded=True))

if config.BlogConfig.stage == 'production':
    app.debug = False
else:
    app.debug = True

@app.before_request
def before_request():
    g.current_user = current_user
    g.make_url = version_url

@app.teardown_request
def teardown_request(exception):
    pass

if __name__ == '__main__':
    manager.run()




