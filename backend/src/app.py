
from flask import g, Flask, jsonify, request
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
from models import db, Chemical, Location
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



@app.route('/api/locations', methods=['GET'])
def get_locations():
    query = request.args.get("query")
    if query: 
        locations = db.session.query(Location).filter(Location.Building.like("%"+query+"%") | Location.Room.like("%"+query+"%")).all()
    else:
        locations = db.session.query(Location).all()
    return [
        {
            "location_id": location.Location_ID,
            "building": location.Building,
            "room": location.Room,
            "sub_locations": [
                {
                    "sub_location_id": sub_location.Sub_Location_ID,
                    "sub_location_name": sub_location.Sub_Location_Name
                }
                for sub_location in location.Sub_Locations
            ]
        } for location in locations
    ]

@app.route('/api/add_chemical', methods=['POST'])
def add_chemical():
    chemical_name = request.json.get("chemical_name")
    chemical_formula = request.json.get("chemical_formula")
    storage_class = request.json.get("storage_class")
    order_more =  request.json.get("order_more")
    order_description = request.json.get("order_description")
    who_requested = request.json.get("who_requested")
    date_requested = request.json.get("date_requested")
    who_ordered = request.json.get("who_ordered")
    date_ordered = request.json.get("date_ordered")
    minimum_on_hand = request.json.get("minimum_on_hand")

    chemical = Chemical(
        Chemical_Name=chemical_name,
        Chemical_Formula=chemical_formula,
        Storage_Class_ID=storage_class,
        Order_More=order_more,
        Order_Description=order_description,
        Who_Requested=who_requested,
        When_Requested=date_requested,
        Who_Ordered=who_ordered,
        When_Ordered=date_ordered,
        Minimum_On_Hand=minimum_on_hand
    )
    db.session.add(chemical)
    db.session.commit()
    return {"message": "Chemical added successfully"}


if __name__ == '__main__':
    if os.getenv("CHEMINV_ENVIRONMENT") == "development":
        app.run(debug=True, host="0.0.0.0", port=5000)
    else:
        waitress.serve(app, host="0.0.0.0", port=5000)
