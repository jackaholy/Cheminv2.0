import logging
from flask import Blueprint, request, jsonify
from permission_requirements import require_editor
from database import db
from oidc import oidc
from models import Inventory, Location, Chemical, Sub_Location
from schemas import CreateLocationSchema, UpdateLocationSchema, CreateSubLocationSchema, UpdateSubLocationSchema

logger = logging.getLogger(__name__)

locations = Blueprint("locations", __name__)


@locations.route("/api/locations", methods=["GET"])
@oidc.require_login
def get_locations():
    logger.info("GET /api/locations called")
    """
    API to get all locations in the database.
    :return: A sorted list of location data.
    """
    # Get optional search query from request arguments
    query = request.args.get("query")
    if query:
        logger.info(f"Query parameter provided: {query}")
        location_list = (
            db.session.query(Location)
            .filter(
                Location.Building.like("%" + query + "%")
                | Location.Room.like("%" + query + "%")
            )
            .all()
        )
    # If no query is provided, retrieve all locations from the database
    else:
        location_list = db.session.query(Location).all()
    # Return a JSON list of locations with their sub-locations and sort them.
    logger.info("Returning sorted list of locations")
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
    logger.info("GET /api/get_chemical_location_data called")
    """
    API to get location, manufacturer, and other chemical information from the database.
    :return: A list of locations and other chemical details.
    """
    chemical_id = request.args.get("chemical_id")
    location_list = []
    try:
        # Search through the entire database
        with db.session() as session:
            logger.info(f"Chemical ID: {chemical_id}")
            chemical = (
                session.query(Chemical).filter(Chemical.Chemical_ID == chemical_id).first()
            )
            # Look at all the manufacturers and their inventory records for a chemical
            for manufacturer in chemical.Chemical_Manufacturers:
                for inventory in manufacturer.Inventory:
                    # Add the appropriate chemical detail to the chemical list
                    # More chemical attributes can be added below if needed
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
        logger.info("Returning chemical location data")
        return jsonify(location_list)
    except Exception as e:
        logger.error(f"Error fetching chemical location data: {e}")
        return jsonify({"message": "Error fetching data", "error": str(e)}), 500


@locations.route("/api/locations/<location_id>", methods=["DELETE"])
@oidc.require_login
@require_editor
def delete_location(location_id):
    logger.info(f"DELETE /api/locations/{location_id} called")
    """
    Deletes a location from the database.

    Args:
        location_id (int): The ID of the location to delete.

    :return: jsonify: A JSON response indicating the success or failure of the deletion.
                Returns a 200 status code on success, 404 if the location is not found,
                and 500 for internal server errors.
    """
    try:
        # Query the database for the location with the given ID
        location = db.session.query(Location).filter(Location.Location_ID == location_id).first()
        if location:
            logger.info(f"Deleting location with ID: {location_id}")
            # Check if there are any inventory records associated with the sublocations
            for sub_location in location.Sub_Locations:
                # Delete inventory records associated with the sublocation
                db.session.query(Inventory).filter(Inventory.Sub_Location_ID == sub_location.Sub_Location_ID).delete()

                # Delete the sublocation itself
                db.session.delete(sub_location)

            # Then, delete the location itself
            db.session.delete(location)
            db.session.commit()  # Commit the changes to persist the deletion
            logger.info("Location and associated data deleted successfully")
            return jsonify({"message": "Location and associated data deleted successfully"}), 200
        else:
            logger.warning(f"Location with ID {location_id} not found")
            # If the location does not exist, return a 404 error
            return jsonify({"message": "Location not found"}), 404
    except Exception as e:
        logger.error(f"Error deleting location: {e}")
        # If any error occurs during the process, rollback the changes
        db.session.rollback()
        return jsonify({"message": "Error deleting location", "error": str(e)}), 500


@locations.route("/api/locations", methods=["POST"])
@oidc.require_login
@require_editor
def create_location():
    logger.info("POST /api/locations called")
    """
    Creates a new location in the database.

    :return: jsonify: A JSON response indicating the success or failure of the creation.
    """
    try:
        data = request.get_json()
        errors = CreateLocationSchema().validate(data)
        if errors:
            return jsonify({"message": "Validation errors", "errors": errors}), 400

        # Check if a location with the same building and room already exists
        existing_location = db.session.query(Location).filter_by(
            Building=data["building"], Room=data["room"]
        ).first()
        if existing_location:
            logger.warning("Location with the same building and room already exists")
            return jsonify({"message": "Location with the same building and room already exists."}), 400

        new_location = Location(Room=data["room"], Building=data["building"])
        db.session.add(new_location)
        db.session.commit()

        logger.info(f"Location created successfully with ID: {new_location.Location_ID}")
        return jsonify({"message": "Location created successfully", "location_id": new_location.Location_ID}), 201
    except Exception as e:
        logger.error(f"Error creating location: {e}")
        db.session.rollback()
        return jsonify({"message": "Error creating location", "error": str(e)}), 500


@locations.route("/api/locations/<location_id>", methods=["PUT"])
@oidc.require_login
@require_editor
def update_location(location_id):
    logger.info(f"PUT /api/locations/{location_id} called")
    """
    Updates an existing location in the database.

    Args:
        location_id (int): The ID of the location to update.

    :return: A JSON response indicating the success or failure of the update.
    """
    try:
        data = request.get_json()
        errors = UpdateLocationSchema().validate(data)
        if errors:
            return jsonify({"message": "Validation errors", "errors": errors}), 400

        # Check if a location with the same building and room already exists
        existing_location = db.session.query(Location).filter_by(
            Building=data["building"], Room=data["room"]
        ).filter(Location.Location_ID != location_id).first()
        if existing_location:
            return jsonify({"message": "Location with the same building and room already exists."}), 400

        location = db.session.query(Location).filter(Location.Location_ID == location_id).first()
        if not location:
            logger.warning(f"Location with ID {location_id} not found")
            return jsonify({"message": "Location not found"}), 404

        location.Room = data["room"]
        location.Building = data["building"]
        db.session.commit()

        logger.info(f"Location with ID {location_id} updated successfully")
        return jsonify({"message": "Location updated successfully"}), 200
    except Exception as e:
        logger.error(f"Error updating location: {e}")
        db.session.rollback()
        return jsonify({"message": "Error updating location", "error": str(e)}), 500


@locations.route("/api/sublocations", methods=["GET"])
@oidc.require_login
@require_editor
def get_sublocations():
    logger.info("GET /api/sublocations called")
    """
    Fetches all sublocations as a flat list with their parent location details.

    :return: jsonify: A JSON response containing a flat list of sublocations.
    """
    # Query the database for sub-location data.
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

    logger.info("Returning list of sublocations")
    return jsonify(result), 200


@locations.route("/api/sublocations", methods=["DELETE"])
@oidc.require_login
@require_editor
def delete_sublocations():
    logger.info("DELETE /api/sublocations called")
    """
    Deletes multiple sublocations from the database.

    :return: A JSON response indicating the success or failure of the deletion.
    """
    try:
        data = request.get_json()
        sublocation_ids = data.get("ids")
        # Check if a sub-location id is provided.
        if not sublocation_ids:
            return jsonify({"message": "No sublocation IDs provided."}), 400

        # Validate that all IDs are integers
        if not all(isinstance(id, int) for id in sublocation_ids):
            return jsonify({"message": "Invalid input for sublocation IDs."}), 400

        # Check if all provided IDs exist in the database
        existing_ids = db.session.query(Sub_Location.Sub_Location_ID).filter(
            Sub_Location.Sub_Location_ID.in_(sublocation_ids)
        ).all()
        existing_ids = {id[0] for id in existing_ids}  # Extract IDs from query results
        invalid_ids = set(sublocation_ids) - existing_ids
        if invalid_ids:
            logger.warning(f"Invalid sublocation IDs: {invalid_ids}")
            return jsonify({"message": "Some sublocation IDs do not exist.", "invalid_ids": list(invalid_ids)}), 400

        # Delete inventory records associated with the sub-locations
        db.session.query(Inventory).filter(Inventory.Sub_Location_ID.in_(sublocation_ids)).delete(synchronize_session=False)

        # Delete the sub-locations themselves
        db.session.query(Sub_Location).filter(
            Sub_Location.Sub_Location_ID.in_(sublocation_ids)
        ).delete(synchronize_session=False)

        db.session.commit()

        logger.info("Sublocations deleted successfully")
        return jsonify({"message": "Sublocations deleted successfully."}), 200
    except Exception as e:
        logger.error(f"Error deleting sublocations: {e}")
        db.session.rollback()
        return jsonify({"message": "Error deleting sublocations", "error": str(e)}), 500


@locations.route("/api/sublocations", methods=["POST"])
@oidc.require_login
@require_editor
def create_sublocation():
    logger.info("POST /api/sublocations called")
    """
    Creates a new sublocation in the database.

    :return: A JSON response indicating the success or failure of the creation.
    """
    try:
        data = request.get_json()
        errors = CreateSubLocationSchema().validate(data)
        if errors:
            return jsonify({"message": "Validation errors", "errors": errors}), 400

        location = db.session.query(Location).filter(Location.Location_ID == data["locationId"]).first()
        if not location:
            return jsonify({"message": "Parent location not found."}), 404

        # Check if a sublocation with the same name already exists for the location
        existing_sublocation = db.session.query(Sub_Location).filter_by(
            Sub_Location_Name=data["name"], Location_ID=data["locationId"]
        ).first()
        if existing_sublocation:
            logger.warning("Sublocation with the same name already exists for this location")
            return jsonify({"message": "Sublocation with the same name already exists for this location."}), 400

        new_sublocation = Sub_Location(Sub_Location_Name=data["name"], Location_ID=data["locationId"])
        db.session.add(new_sublocation)
        db.session.commit()

        logger.info(f"Sublocation created successfully with ID: {new_sublocation.Sub_Location_ID}")
        return jsonify({"message": "Sublocation created successfully", "id": new_sublocation.Sub_Location_ID}), 201
    except Exception as e:
        logger.error(f"Error creating sublocation: {e}")
        db.session.rollback()
        return jsonify({"message": "Error creating sublocation", "error": str(e)}), 500


@locations.route("/api/sublocations/<int:sublocation_id>", methods=["PUT"])
@oidc.require_login
@require_editor
def update_sublocation(sublocation_id):
    logger.info(f"PUT /api/sublocations/{sublocation_id} called")
    """
    Updates an existing sublocation in the database.

    Args:
        sublocation_id (int): The ID of the sublocation to update.

    :return: A JSON response indicating the success or failure of the update.
    """
    try:
        data = request.get_json()
        errors = UpdateSubLocationSchema().validate(data)
        if errors:
            return jsonify({"message": "Validation errors", "errors": errors}), 400

        # Check if a sublocation with the same name already exists for the location
        existing_sublocation = db.session.query(Sub_Location).filter_by(
            Sub_Location_Name=data["name"], Location_ID=data["locationId"]
        ).filter(Sub_Location.Sub_Location_ID != sublocation_id).first()
        if existing_sublocation:
            return jsonify({"message": "Sublocation with the same name already exists for this location."}), 400

        sublocation = db.session.query(Sub_Location).filter_by(Sub_Location_ID=sublocation_id).first()
        if not sublocation:
            logger.warning(f"Sublocation with ID {sublocation_id} not found")
            return jsonify({"message": "Sublocation not found."}), 404

        sublocation.Sub_Location_Name = data["name"]
        db.session.commit()

        logger.info(f"Sublocation with ID {sublocation_id} updated successfully")
        return jsonify({"message": "Sublocation updated successfully."}), 200
    except Exception as e:
        logger.error(f"Error updating sublocation: {e}")
        db.session.rollback()
        return jsonify({"message": "Error updating sublocation", "error": str(e)}), 500
