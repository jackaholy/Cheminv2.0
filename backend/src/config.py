import os
from dotenv import load_dotenv
from sqlalchemy.engine import URL

load_dotenv()


class ProdConfig:
    """
    The default "production" ready setup
    """

    DEBUG = False
    SECRET_KEY = os.getenv("CHEMINV_SECRET_KEY")

    # Minimal OIDC configuration using environment variables.
    # When the issuer supports discovery, Flask‑OIDC will automatically retrieve the metadata
    # from: <OIDC_ISSUER> + "/.well-known/openid-configuration"    # Additional settings
    OIDC_CLIENT_SECRETS = {
        "web": {
            "client_id": os.environ.get("CHEMINV_OIDC_CLIENT_ID"),
            "client_secret": os.environ.get("CHEMINV_OIDC_CLIENT_SECRET"),
            "issuer": os.environ.get(
                "CHEMINV_OIDC_ISSUER"
            ),  # e.g. "https://your-idp.example.com"
            "redirect_uris": [os.environ.get("CHEMINV_OIDC_REDIRECT_URI")],
        }
    }
    OIDC_SCOPES = "openid email profile"

    SQLALCHEMY_DATABASE_URI = URL.create(
        drivername="mysql+pymysql",
        username=os.getenv("MYSQL_USER"),
        password=os.getenv("MYSQL_PASSWORD"),
        host=os.getenv("MYSQL_HOST"),
        database=os.getenv("MYSQL_DATABASE"),
        port=os.getenv("MYSQL_PORT"),
    )


class TestingConfig(ProdConfig):
    """
    Changes to the production setup for testing
    """

    SECRET_KEY = os.getenv("CHEMINV_SECRET_KEY")
    TESTING = True
    SQLALCHEMY_DATABASE_URI = "sqlite:///:memory:"
    DEBUG = True
    OIDC_ENABLED = False
    OIDC_TESTING_PROFILE = {
        "nickname": "Anne Admin",
        "email": "anne-admin@example.com",
        "groups": [],
        "preferred_username": "anne-admin@example.com",
        "name": "Anne Admin",
    }


class DevConfig(ProdConfig):
    """
    Changes to the production setup for development
    """

    DEBUG = True
