from flask import Blueprint, request, jsonify
from database import db
from oidc import oidc
from models import Location, Chemical

locations = Blueprint("locations", __name__)


@locations.route("/api/locations", methods=["GET"])
@oidc.require_login
def get_locations():
    query = request.args.get("query")
    if query:
        location_list = (
            db.session.query(Location)
            .filter(
                Location.Building.like("%" + query + "%")
                | Location.Room.like("%" + query + "%")
            )
            .all()
        )
    else:
        location_list = db.session.query(Location).all()
    return [
        {
            "location_id": location.Location_ID,
            "building": location.Building,
            "room": location.Room,
            "sub_locations": [
                {
                    "sub_location_id": sub_location.Sub_Location_ID,
                    "sub_location_name": sub_location.Sub_Location_Name,
                }
                for sub_location in location.Sub_Locations
            ],
        }
        for location in location_list
    ]


@locations.route("/api/get_chemical_location_data", methods=["GET"])
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
        chemical = (
            session.query(Chemical).filter(Chemical.Chemical_ID == chemical_id).first()
        )

        for manufacturer in chemical.Chemical_Manufacturers:
            for inventory in manufacturer.Inventory:
                # Add the appropriate chemical detail to the chemical list
                # We can add more chemical attributes below if needed
                location_list.append(
                    {
                        "location": inventory.Sub_Location.Sub_Location_Name,
                        "sub-location": inventory.Sub_Location.Location.Building
                        + " "
                        + inventory.Sub_Location.Location.Room,
                        "manufacturer": manufacturer.Manufacturer.Manufacturer_Name,
                        "sticker-number": inventory.Sticker_Number,
                    }
                )

    return jsonify(location_list)
