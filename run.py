#!/usr/bin/env python
# -*- coding: utf-8 -*-
from controllers.user import users_app, login_manager
from utils.common_utils import version_url

__author__ = 'fleago'

from flask import Flask, g
from flask.ext.script import Manager, Server
from flask.ext.login import current_user, LoginManager
import config

from controllers.home import home_app

app = Flask(__name__)
app.register_blueprint(home_app)
app.register_blueprint(users_app)
app.config['SECRET_KEY'] = 'simpleblog'

# login配置
# login_manager = LoginManager()
login_manager.init_app(app)
# login_manager.login_view = '/login'
# login_manager.login_message = ' Please log in to access this page.'

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
    pass

@app.teardown_request
def teardown_request(exception):
    pass

if __name__ == '__main__':
    manager.run()




