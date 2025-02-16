from flask import g, Flask
from sqlalchemy import URL, Table,  Column, Integer, String, Float, Date, ForeignKey, Boolean
from flask_cors import CORS
from sqlalchemy import URL, Table
from sqlalchemy.exc import DatabaseError, OperationalError
from sqlalchemy.orm import declarative_base, relationship
from flask_sqlalchemy import SQLAlchemy
from flask_oidc import OpenIDConnect
import os
from dotenv import load_dotenv
import time
import waitress
print("Initializing app")
load_dotenv()

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = URL.create(
    drivername="mysql+pymysql",
    username=os.getenv("MYSQL_USER"),
    password=os.getenv("MYSQL_PASSWORD"),
    host=os.getenv("MYSQL_HOST"),
    database=os.getenv("MYSQL_DATABASE"),
    port=os.getenv("MYSQL_PORT")
)

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



db.init_app(app)
ready = False
while not ready:
    try:
        with app.app_context():
            db.engine.connect()
        ready = True
    except (DatabaseError, OperationalError) as e:
        try:
            print("Database not ready, retrying...")
            print(e)
            time.sleep(1)
            pass
        except KeyboardInterrupt:
            exit()
    except Exception:
        raise
print("Database ready")
oidc = OpenIDConnect(app)
cors = CORS(app)


@app.route('/')
def hello_world():
    return 'Hello World!'
@app.route('/api/example')
def get_example():
    return {
        "message": "Hello! This data came from the backend!"
    }
@app.route('/chemicals')
@oidc.accept_token()
def get_chemicals_example():
    return "<br/>".join([chemical.Chemical_Name for chemical in db.session.query(Chemical).all()])

@app.route('/locations')
#@oidc.accept_token()
def get_location_example():
    return "<br/>".join([location.Building + " " + location.Room + ": " + ",".join([x.Sub_Location_Name for x in location.Sub_Locations]) for location in db.session.query(Location).all()])

if __name__ == '__main__':
    if os.getenv("CHEMINV_ENVIRONMENT") == "development":
        app.run(debug=True, host="0.0.0.0", port=5000)
    else: 
        waitress.serve(app, host="0.0.0.0", port=5000)