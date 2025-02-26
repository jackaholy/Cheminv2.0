import os

import waitress
from dotenv import load_dotenv
from flask import Flask
from flask_cors import CORS
from flask_oidc import OpenIDConnect

from chemicals import chemicals
from locations import locations
from search import search
from database import init_db

print("Initializing app")
load_dotenv()

app = Flask(__name__)
init_db(app)
app.config['SECRET_KEY'] = os.getenv("CHEMINV_SECRET_KEY")

# Minimal OIDC configuration using environment variables.
# When the issuer supports discovery, Flask‑OIDC will automatically retrieve the metadata
# from: <OIDC_ISSUER> + "/.well-known/openid-configuration"
app.config['OIDC_CLIENT_SECRETS'] = {
    "web": {
        "client_id": os.environ.get("CHEMINV_OIDC_CLIENT_ID"),
        "client_secret": os.environ.get("CHEMINV_OIDC_CLIENT_SECRET"),
        "issuer": os.environ.get("CHEMINV_OIDC_ISSUER"),  # e.g. "https://your-idp.example.com"
        "redirect_uris": [
            os.environ.get("CHEMINV_OIDC_REDIRECT_URI")
        ]
    }
}

# Additional settings
app.config['OIDC_SCOPES'] = "openid email profile"
app.config.setdefault("OIDC_COOKIE_SECURE", False)


oidc = OpenIDConnect(app)
cors = CORS(app)

app.register_blueprint(chemicals)
app.register_blueprint(locations)
app.register_blueprint(search)








if __name__ == '__main__':
    if os.getenv("CHEMINV_ENVIRONMENT") == "development":
        app.run(debug=True, host="0.0.0.0", port=5000)
    else:
        waitress.serve(app, host="0.0.0.0", port=5000)
