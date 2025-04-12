from flask_oidc import OpenIDConnect
import os
from dotenv import load_dotenv

load_dotenv()
oidc = OpenIDConnect()


def init_oidc(app):
    # Minimal OIDC configuration using environment variables.
    # When the issuer supports discovery, Flask‑OIDC will automatically retrieve the metadata
    # from: <OIDC_ISSUER> + "/.well-known/openid-configuration"
    app.config["OIDC_CLIENT_SECRETS"] = {
        "web": {
            "client_id": os.environ.get("CHEMINV_OIDC_CLIENT_ID"),
            "client_secret": os.environ.get("CHEMINV_OIDC_CLIENT_SECRET"),
            "issuer": os.environ.get(
                "CHEMINV_OIDC_ISSUER"
            ),  # e.g. "https://your-idp.example.com"
            "redirect_uris": [os.environ.get("CHEMINV_OIDC_REDIRECT_URI")],
        }
    }

    # Additional settings
    app.config["OIDC_SCOPES"] = "openid email profile"
    #app.config.setdefault("OIDC_COOKIE_SECURE", False)

    oidc.init_app(app)
