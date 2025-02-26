from flask import g, Flask, render_template, session, request, jsonify
from sqlalchemy import URL, Table, Column, Integer, String, Float, Date, ForeignKey, Boolean, or_
from flask_cors import CORS
from sqlalchemy.exc import DatabaseError, OperationalError
from sqlalchemy.orm import declarative_base, relationship
from flask_sqlalchemy import SQLAlchemy
from flask_oidc import OpenIDConnect
import os
from dotenv import load_dotenv
import time
import waitress
from difflib import SequenceMatcher
from models import db, Chemical, Location, Inventory, Chemical_Manufacturer
from authlib.integrations.flask_oauth2 import current_token
import requests
import json

print("Initializing app")
load_dotenv()


app = Flask(__name__, static_url_path="", static_folder="../frontend/build", template_folder="../frontend/build")
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
# Important: The auth redirect must
# occur in the browser, not a fetch request. 
# The apis need to be protected, but can't actually 
# redirect to the login page.
@oidc.require_login
def index():
    return render_template('index.html')

# NOT IMPLEMENTED!
@app.route('/api/user', methods=['GET'])
def get_user():
    # Will replace in the auth-fixes branch
    return jsonify({"name": "whoever you are", "access": "admin"})

@app.route('/api/users/update_access', methods=['POST'])
def update_access():
    user_id = request.json.get("user_id")
    access = request.json.get("access")

    # TODO: IMPLEMENT THIS! (And make sure user is an admin)

    return {"message": "Access updated successfully"}

@app.route('/api/locations', methods=['GET'])
@oidc.require_login
def get_locations():
    query = request.args.get("query")
    if query:
        locations = db.session.query(Location).filter(
            Location.Building.like("%" + query + "%") | Location.Room.like("%" + query + "%")).all()
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
@oidc.require_login
def add_chemical():
    chemical_name = request.json.get("chemical_name")
    chemical_formula = request.json.get("chemical_formula")
    storage_class = request.json.get("storage_class")
    order_more = request.json.get("order_more")
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


@app.route('/api/get_chemicals', methods=['GET'])
@oidc.require_login
def get_chemicals():
    """
    API to get chemical details from the database.
    :return: A list of chemicals
    """
    chemical_list = []
    # Search through the entire database
    with db.session() as session:
        chemicals = session.query(Chemical).all()
        # Iterate through each table from the database
        for chem in chemicals:
            # Add the appropriate chemical detail to the chemical list
            # We can add more chemical attributes below if needed
            chemical_list.append({
                "chemical_name": chem.Chemical_Name,
                "formula": chem.Chemical_Formula,
                "id": chem.Chemical_ID
            })

    return jsonify(chemical_list)


@app.route('/api/get_chemical_location_data', methods=['GET'])
@oidc.require_login
def get_chemical_location_data():
    """
    API to get location, manufacturer, and other chemical information from the database.
    :return: A list of locations and other chemical details.
    """
    chemical_id = request.args.get("chemical_id")
    location_list = []
    # Search through the entire database
    with db.session() as session:
        chemical = serssion.query(Chemical).filter(Chemical.Chemical_ID == chemical_id).first()
        for manufacturer in chemical.Chemical_Manufacturers:
            for inventory in manufacturer.Inventory:
                # Add the appropriate chemical detail to the chemical list
                # We can add more chemical attributes below if needed
                location_list.append({
                    "location": inventory.Sub_Location.Sub_Location_Name,
                    "sub-location": inventory.Sub_Location.Location.Building + " " + inventory.Sub_Location.Location.Room,
                    "manufacturer": manufacturer.Manufacturer.Manufacturer_Name,
                    "sticker-number": inventory.Sticker_Number
                })

    return jsonify(location_list)


@app.route('/api/search', methods=['GET'])
@oidc.require_login
def search():
    print("Request recieved")
    query = request.args.get("query")
    synonym_search_enabled = request.args.get("synonyms") == "true"
    if not query:
        return []

    query.replace("/", "")
    query.replace("%2F", "")
    query.replace("%2f", "")
    print("Looking up in pubchem")
    all_synonyms = [query]
    if synonym_search_enabled:
        response = requests.get(
            f"https://pubchem.ncbi.nlm.nih.gov/rest/pug/substance/name/{query}/synonyms/json").json()
        if "InformationList" in response:
            print("Synonyms found:")
            for substance in response["InformationList"]["Information"]:
                all_synonyms.extend(substance["Synonym"])

    all_synonyms = list(set(all_synonyms))

    # Element symbols (like FE, H, etc) match all kinds of things in the database, so we try to filter them out
    all_synonyms = [synonym for synonym in all_synonyms if len(synonym) > 3 or synonym == query]
    print("Querying the database for:")
    matching_entries = []
    for synonym in all_synonyms:
        synonym_matches = db.session.query(Chemical).filter(
            or_(
            Chemical.Chemical_Name.like("%"+synonym+"%"), 
            Chemical.Alphabetical_Name.like("%"+synonym+"%"),
            Chemical.Chemical_Formula == synonym
        )).all()
        print("Matches for " + synonym + ":")
        print("\t\n".join([x.Alphabetical_Name for x in synonym_matches]))
        print()
        print()
        matching_entries.extend(synonym_matches)

    unique_entries = set()
    for chemical in matching_entries:            
        unique_entries.add((
            chemical.Chemical_Name,
            chemical.Chemical_Formula
        ))

    response_entries = [
        {"name": name, "symbol": formula}
        for name, formula in unique_entries
    ]
    #                        v This order is significant
    def calculate_similarity(query, entry):
        match = SequenceMatcher(None, query.lower(), entry.lower()).find_longest_match()
        return (
            # Prioritize strings that contain all or most of the query
            match.size, 
            # Prioritize strings that start with the query
            # Irrelevant compounds are usually prefix+query
            match.size - match.b, 
            # If results are "query" and "query with a bunch of other stuff", prioritize the former
            SequenceMatcher(None, query, entry).ratio())

    response_entries.sort(key=lambda x: calculate_similarity(query, x["name"]), reverse=True)
    return response_entries


if __name__ == '__main__':
    if os.getenv("CHEMINV_ENVIRONMENT") == "development":
        app.run(debug=True, host="0.0.0.0", port=5000)
    else:
        waitress.serve(app, host="0.0.0.0", port=5000)
