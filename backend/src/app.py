import os
import sys
import logging

import waitress
from dotenv import load_dotenv
from flask import Flask, render_template
from flask_cors import CORS

from config import ProdConfig, TestingConfig, DevConfig
from chemicals import chemicals
from locations import locations
from manufacturers import manufacturers
from search import search
from users import users
from database import db, init_db
from oidc import init_oidc, oidc

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)
logging.getLogger().addHandler(logging.StreamHandler(sys.stdout))

load_dotenv()


def create_app(config=ProdConfig):
    logger.info("Starting application")
    app = Flask(
        __name__,
        static_url_path="",
        static_folder="../frontend/build",
        template_folder="../frontend/build",
    )
    app.config.from_object(config)
    init_db(app)
    init_oidc(app)
    # app.config.setdefault("OIDC_COOKIE_SECURE", False)

    cors = CORS(app)

    @app.route("/api/health")
    def health():
        return "OK"

    @app.route("/")
    # Important: The auth redirect must
    # occur in the browser, not a fetch request.
    # The apis need to be protected, but can't actually
    # redirect to the login page.
    @oidc.require_login
    def index():
        return render_template("index.html")

    app.register_blueprint(chemicals)
    app.register_blueprint(locations)
    app.register_blueprint(manufacturers)
    app.register_blueprint(search)
    app.register_blueprint(users)
    return app


if __name__ == "__main__":
    if os.getenv("CHEMINV_ENVIRONMENT") == "development":
        app = create_app(DevConfig)
        app.run(host="0.0.0.0", port=5000)
    elif os.getenv("CHEMINV_ENVIRONMENT") == "testing":
        app = create_app(TestingConfig)
        app.run(host="0.0.0.0", port=5000)
    elif os.getenv("CHEMINV_ENVIRONMENT") == "production":
        app = create_app(ProdConfig)
        waitress.serve(app, host="0.0.0.0", port=5000)
    else:
        raise ValueError(
            "CHEMINV_ENVIRONMENT must be set to 'development', 'testing' or 'production'. Please edit your .env file."
        )
