from flask import g, Flask, jsonify
from flask_cors import CORS
from sqlalchemy import URL, Table
from sqlalchemy.exc import DatabaseError, OperationalError
from sqlalchemy.orm import DeclarativeBase
from flask_sqlalchemy import SQLAlchemy
from flask_oidc import OpenIDConnect
import os
from dotenv import load_dotenv
import time
import waitress
from authlib.integrations.flask_oauth2 import current_token

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
app.config['OIDC_RESOURCE_SERVER_ONLY'] = True
app.config['OIDC_CLIENT_SECRETS'] = {
    "web": {
        "client_id": os.environ.get("CHEMINV_OIDC_CLIENT_ID"),

        # This seems really bad. We should make certain this is secure
        "client_secret": os.environ.get("CHEMINV_OIDC_CLIENT_SECRET"),
        "token_endpoint_auth_method": "none",

        "issuer": os.environ.get("CHEMINV_OIDC_ISSUER"),  # e.g. "https://your-idp.example.com"
        "redirect_uris": [
            os.environ.get("CHEMINV_OIDC_REDIRECT_URI")
        ],
    }
}
# Additional settings
app.config['OIDC_SCOPES'] = "openid email profile"
app.config.setdefault("OIDC_COOKIE_SECURE", False)

db = SQLAlchemy(app)
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


# There's probably a better way to do this: https://stackoverflow.com/questions/39955521/sqlalchemy-existing-database-query
class Base(DeclarativeBase):
    pass


with app.app_context():
    class Chemical(Base):
        __table__ = Table('Chemical', Base.metadata, autoload_with=db.engine)


@app.route('/')
def hello_world():
    return 'Hello World!'


@app.route('/api/example')
@oidc.accept_token(scopes=['profile'])
def get_example():
    return {
        "message": "Hello " + current_token["name"]
    }


@app.route('/api/get_chemicals>')
@oidc.accept_token(scopes=['profile'])
def get_chemicals():
    chemicals = db.session.query(Chemical).all()
    chemical_list = [{
        "sticker_number": chem.Chemical_ID,
        "name": chem.Chemial_Name,
        "alphabetical_name": chem.Alphabetical_Name,
        "formula": chem.Chemical_Formula,
        # "location": chem.Location,
        # "sub_location": chem.Sub_Location,
        # "product_number": chem.Product_Number,
        # "manufacturer": chem.Chemical_Manufacturer,
        # "storage_class": chem.Storage_Class,
        # "msds": chem.MSDS,
        # "last_updated": chem.Last_Updated,
        # "quantity": chem.Quantity,
        # "dead_status": chem.Status,
    } for chem in chemicals]

    return jsonify(chemical_list)


@app.route('/chemicals')
@oidc.require_login
def get_users():
    return "You signed in as " + g.oidc_user.name + "<br/>" + "<br/>".join(
        [chemical.Chemical_Name for chemical in db.session.query(Chemical).all()])


if __name__ == '__main__':
    if os.getenv("CHEMINV_ENVIRONMENT") == "development":
        app.run(debug=True, host="0.0.0.0", port=5000)
    else:
        waitress.serve(app, host="0.0.0.0", port=5000)
