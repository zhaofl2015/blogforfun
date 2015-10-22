#!/usr/bin/env python
# -*- coding: utf-8 -*-

__author__ = 'fleago'

from flask import Flask, g
from flask.ext.script import Manager, Server
from flask.ext.login import current_user, LoginManager
import config

from controllers.home import home_app

app = Flask(__name__)
app.register_blueprint(home_app)

# login配置
login_manager = LoginManager()
login_manager.init_app(app)

# manager配置
manager = Manager(app)
manager.add_command("runserver", Server(threaded=True))

if config.stage == 'production':
    app.debug = False
else:
    app.debug = True

@app.before_request
def before_request():
    pass

@app.teardown_request
def teardown_request(exception):
    pass

if __name__ == '__main__':
    manager.run()




