import os
import sys
import logging

import waitress
from dotenv import load_dotenv
from flask import Flask
from flask_cors import CORS
from flask_oidc import OpenIDConnect

from config import ProdConfig, TestingConfig, DevConfig
from chemicals import chemicals
from locations import locations
from manufacturers import manufacturers
from search import search
from users import users
from csv_export import csv_export
from database import db, init_db

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)
logging.getLogger().addHandler(logging.StreamHandler(sys.stdout))

load_dotenv()


def create_app(config=ProdConfig):
    logger.info("Starting application")
    app = Flask(__name__)
    app.config.from_object(config)
    init_db(app)

    # app.config.setdefault("OIDC_COOKIE_SECURE", False)

    oidc = OpenIDConnect(app)
    cors = CORS(app)

    @app.route("/api/health")
    def health():
        return "OK"

    app.register_blueprint(chemicals)
    app.register_blueprint(locations)
    app.register_blueprint(manufacturers)
    app.register_blueprint(search)
    app.register_blueprint(users)
    app.register_blueprint(csv_export)
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
