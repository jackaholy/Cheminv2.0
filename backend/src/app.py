"""
ChemInv 2.0 - Main application entry point.

Initializes the Flask app with appropriate configuration based on the environment.
Sets up logging, authentication, database, CORS, blueprints, and routes.
Supports development, testing, and production deployment modes.
"""

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
from csv_export import csv_export
from msds import msds
from database import db, init_db
from oidc import init_oidc, oidc
from storage_class import storage_class
from logging_config import configure_logging

load_dotenv()


def create_app(config=ProdConfig):
    """
    Create and configure the Flask application.

    :param config: The configuration class to use (default is ProdConfig).
    :return: Configured Flask app instance.
    """
    app = Flask(
        __name__,
        static_url_path="",
        static_folder="../frontend/build",
        template_folder="../frontend/build",
    )
    logger = configure_logging(app)
    app.config.from_object(config)
    init_db(app)
    init_oidc(app)
    # app.config.setdefault("OIDC_COOKIE_SECURE", False)

    cors = CORS(app)

    @app.route("/api/health")
    def health():
        """
        Health check endpoint.

        :return: A simple "OK" string to indicate the app is running.
        """
        return "OK"

    @app.route("/")
    # Important: The auth redirect must occur in the browser, not a fetch request.
    # The apis need to be protected, but can't actually redirect to the login page.
    @oidc.require_login
    def index():
        """
        Main entry point of the frontend application, requires login.

        :return: Renders the frontends index.html template.
        """
        return render_template("index.html")

    app.register_blueprint(chemicals)
    app.register_blueprint(locations)
    app.register_blueprint(manufacturers)
    app.register_blueprint(search)
    app.register_blueprint(users)
    app.register_blueprint(csv_export)
    app.register_blueprint(msds)
    app.register_blueprint(storage_class)
    return app


"""
Determine which environment config to use and start the Flask app.
In production, the app is served via Waitress; otherwise, Flask's built-in server is used.
"""
if __name__ == "__main__":
    if os.getenv("CHEMINV_ENVIRONMENT") == "development":
        app = create_app(DevConfig)
        app.run(host="0.0.0.0", port=5000)
    elif os.getenv("CHEMINV_ENVIRONMENT") == "testing":
        from testdata import init_test_data

        app = create_app(TestingConfig)
        init_test_data(app)
        app.run(host="0.0.0.0", port=5000)
    elif os.getenv("CHEMINV_ENVIRONMENT") == "production":
        app = create_app(ProdConfig)
        waitress.serve(app, host="0.0.0.0", port=5000)
    else:
        raise ValueError(
            "CHEMINV_ENVIRONMENT must be set to 'development', 'testing' or 'production'. Please edit your .env file."
        )
