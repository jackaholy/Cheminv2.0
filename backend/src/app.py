from flask import g, Flask, render_template, session, request, jsonify
from sqlalchemy import URL, Table,  Column, Integer, String, Float, Date, ForeignKey, Boolean, or_
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
from models import db, Chemical, Location, Inventory, Chemical_Manufacturer
from authlib.integrations.flask_oauth2 import current_token
import requests
import json

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

@app.route('/api/search', methods=['POST'])
def search():
    print("Request recieved")
    query = request.json.get("query")
    if not query: 
        return []
    
    query.replace("/","")
    query.replace("%2F","")
    query.replace("%2f","")
    print("Looking up in pubchem")
    response = requests.get(f"https://pubchem.ncbi.nlm.nih.gov/rest/pug/substance/name/{query}/synonyms/json").json()
    all_synonyms = [query]
    if "InformationList" in response:
        print("Synonyms found:")
        for substance in response["InformationList"]["Information"]:
            all_synonyms.extend(substance["Synonym"])
    else: 
        print("No synonyms found")
    all_synonyms =  list(set(all_synonyms))

    # Element symbols match all kinds of things in the database, so we filter them out
    all_synonyms = [synonym for synonym in all_synonyms if len(synonym) > 3]
    print("Querying the database for:")
    #print("\t\n".join(all_synonyms))
    matching_entries = []
    for synonym in all_synonyms:
        synonym_matches = db.session.query(Chemical).filter(
            or_(
            Chemical.Chemical_Name.like("%"+synonym+"%"), 
            Chemical.Alphabetical_Name.like("%"+synonym+"%")
        )).all()
        print("Matches for " + synonym + ":")
        print("\t\n".join([x.Alphabetical_Name for x in synonym_matches]))
        print()
        print()
        matching_entries.extend(synonym_matches)
        unique_entries = set()

        for chemical in matching_entries:
            chemical_manufacturers = db.session.query(Chemical_Manufacturer).filter(
                Chemical_Manufacturer.Chemical_ID == chemical.Chemical_ID
            ).all()

            for chemical_manufacturer in chemical_manufacturers:
                inventory_records = db.session.query(Inventory).filter(
                    Inventory.Product_Number == chemical_manufacturer.Product_Number
                ).all()

                for record in inventory_records:
                    unique_entries.add((
                        chemical.Chemical_Name,
                        chemical_manufacturer.Product_Number,
                        record.Sticker_Number
                    ))

        response_entries = [
            {"name": name, "product_number": product_number, "sticker": sticker}
            for name, product_number, sticker in unique_entries
        ]

    return response_entries
    
if __name__ == '__main__':
    if os.getenv("CHEMINV_ENVIRONMENT") == "development":
        app.run(debug=True, host="0.0.0.0", port=5000)
    else:
        waitress.serve(app, host="0.0.0.0", port=5000)
