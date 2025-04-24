from flask_oidc import OpenIDConnect
import os
from dotenv import load_dotenv

load_dotenv()

# This file only exists for routes to import this object
oidc = OpenIDConnect()


def init_oidc(app):
    oidc.init_app(app)
