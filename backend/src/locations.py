from flask import Blueprint, request, jsonify
from permission_requirements import require_editor
from database import db
from oidc import oidc
from models import Inventory, Location, Chemical, Sub_Location

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
    return sorted([
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
    ], key=lambda x: (x["building"], x["room"]))


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


@locations.route("/api/locations/<location_id>", methods=["DELETE"])
@oidc.require_login
@require_editor
def delete_location(location_id):
    """
    Deletes a location from the database.

    Args:
        location_id (int): The ID of the location to delete.

    Returns:
        jsonify: A JSON response indicating the success or failure of the deletion.
                 Returns a 200 status code on success, 404 if the location is not found,
                 and 500 for internal server errors.
    """
    try:
        # Query the database for the location with the given ID
        location = db.session.query(Location).filter(Location.Location_ID == location_id).first()
        if location:
            # Check if there are any inventory records associated with the sublocations
            for sub_location in location.Sub_Locations:
                # Delete inventory records associated with the sublocation
                db.session.query(Inventory).filter(Inventory.Sub_Location_ID == sub_location.Sub_Location_ID).delete()

                # Delete the sublocation itself
                db.session.delete(sub_location)

            # Then, delete the location itself
            db.session.delete(location)
            db.session.commit()  # Commit the changes to persist the deletion
            return jsonify({"message": "Location and associated data deleted successfully"}), 200
        else:
            # If the location does not exist, return a 404 error
            return jsonify({"message": "Location not found"}), 404
    except Exception as e:
        # If any error occurs during the process, rollback the changes
        db.session.rollback()
        return jsonify({"message": "Error deleting location", "error": str(e)}), 500


@locations.route("/api/locations", methods=["POST"])
@oidc.require_login
@require_editor
def create_location():
    """
    Creates a new location in the database.

    Returns:
        jsonify: A JSON response indicating the success or failure of the creation.
    """
    try:
        data = request.get_json()
        room = data.get("room")
        building = data.get("building")

        if not room or not building:
            return jsonify({"message": "Room and building are required."}), 400

        new_location = Location(Room=room, Building=building)
        db.session.add(new_location)
        db.session.commit()

        return jsonify({"message": "Location created successfully", "location_id": new_location.Location_ID}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "Error creating location", "error": str(e)}), 500


@locations.route("/api/locations/<location_id>", methods=["PUT"])
@oidc.require_login
@require_editor
def update_location(location_id):
    """
    Updates an existing location in the database.

    Args:
        location_id (int): The ID of the location to update.

    Returns:
        jsonify: A JSON response indicating the success or failure of the update.
    """
    try:
        data = request.get_json()
        room = data.get("room")
        building = data.get("building")

        if not room or not building:
            return jsonify({"message": "Room and building are required."}), 400

        location = db.session.query(Location).filter(Location.Location_ID == location_id).first()

        if not location:
            return jsonify({"message": "Location not found"}), 404

        location.Room = room
        location.Building = building
        db.session.commit()

        return jsonify({"message": "Location updated successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "Error updating location", "error": str(e)}), 500

@locations.route("/api/sublocations", methods=["GET"])
@oidc.require_login
@require_editor
def get_sublocations():
    """
    Fetches all sublocations as a flat list with their parent location details.

    Returns:
        jsonify: A JSON response containing a flat list of sublocations.
    """
    sublocations = db.session.query(
        Sub_Location.Sub_Location_ID,
        Sub_Location.Sub_Location_Name,
        Location.Building,
        Location.Room
    ).join(Location, Sub_Location.Location_ID == Location.Location_ID).all()

    result = [
        {
            "id": sublocation.Sub_Location_ID,
            "name": sublocation.Sub_Location_Name,
            "building": sublocation.Building,
            "room": sublocation.Room,
        }
        for sublocation in sublocations
    ]

    return jsonify(result), 200

@locations.route("/api/sublocations", methods=["DELETE"])
@oidc.require_login
@require_editor
def delete_sublocations():
    """
    Deletes multiple sublocations from the database.

    Returns:
        jsonify: A JSON response indicating the success or failure of the deletion.
    """
    try:
        data = request.get_json()
        sublocation_ids = data.get("ids")

        if not sublocation_ids:
            return jsonify({"message": "No sublocation IDs provided."}), 400

        # Delete inventory records associated with the sublocations
        db.session.query(Inventory).filter(Inventory.Sub_Location_ID.in_(sublocation_ids)).delete(synchronize_session=False)

        # Delete the sublocations themselves
        db.session.query(Sub_Location).filter(
            Sub_Location.Sub_Location_ID.in_(sublocation_ids)
        ).delete(synchronize_session=False)

        db.session.commit()

        return jsonify({"message": "Sublocations deleted successfully."}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "Error deleting sublocations", "error": str(e)}), 500

@locations.route("/api/sublocations", methods=["POST"])
@oidc.require_login
@require_editor
def create_sublocation():
    """
    Creates a new sublocation in the database.

    Returns:
        jsonify: A JSON response indicating the success or failure of the creation.
    """
    data = request.get_json()
    name = data.get("name")
    location_id = data.get("locationId")

    if not name or not location_id:
        return jsonify({"message": "Name and location ID are required."}), 400

    location = db.session.query(Location).filter(Location.Location_ID == location_id).first()

    if not location:
        return jsonify({"message": "Parent location not found."}), 404

    # Correctly instantiate the Sub_Location model
    new_sublocation = Sub_Location(Sub_Location_Name=name, Location_ID=location_id)
    db.session.add(new_sublocation)
    db.session.commit()

    return jsonify({"message": "Sublocation created successfully", "id": new_sublocation.Sub_Location_ID}), 201

@locations.route("/api/sublocations/<int:sublocation_id>", methods=["PUT"])
@oidc.require_login
@require_editor
def update_sublocation(sublocation_id):
    """
    Updates an existing sublocation in the database.

    Args:
        sublocation_id (int): The ID of the sublocation to update.

    Returns:
        jsonify: A JSON response indicating the success or failure of the update.
    """
    data = request.get_json()
    name = data.get("name")

    if not name:
        return jsonify({"message": "Name is required."}), 400

    sublocation = (
        db.session.query(Sub_Location)
        .filter_by(Sub_Location_ID=sublocation_id)
        .first()
    )

    if not sublocation:
        return jsonify({"message": "Sublocation not found."}), 404

    sublocation.Sub_Location_Name = name
    db.session.commit()

    return jsonify({"message": "Sublocation updated successfully."}), 200
