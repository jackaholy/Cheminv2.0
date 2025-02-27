import os

import waitress
from dotenv import load_dotenv
from flask import Flask, render_template
from flask_cors import CORS
from flask_oidc import OpenIDConnect

from chemicals import chemicals
from locations import locations
from search import search
from users import users
from database import init_db
from oidc import init_oidc, oidc

print("Initializing app")
load_dotenv()

app = Flask(
    __name__,
    static_url_path="",
    static_folder="../frontend/build",
    template_folder="../frontend/build",
)
init_db(app)
init_oidc(app)
app.config["SECRET_KEY"] = os.getenv("CHEMINV_SECRET_KEY")


cors = CORS(app)


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
app.register_blueprint(search)
app.register_blueprint(users)

if __name__ == "__main__":
    if os.getenv("CHEMINV_ENVIRONMENT") == "development":
        app.run(debug=True, host="0.0.0.0", port=5000)
    else:
        waitress.serve(app, host="0.0.0.0", port=5000)
