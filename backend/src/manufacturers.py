from flask import Blueprint, request, jsonify
from database import db
from models import Manufacturer, Chemical_Manufacturer, Inventory
from oidc import oidc
from permission_requirements import require_editor
manufacturers = Blueprint("manufacturers", __name__)


@manufacturers.route("/api/manufacturers", methods=["GET"])
@oidc.require_login
def get_manufacturers():
    """
    Handles the GET request to retrieve a list of manufacturers.

    Endpoint:
        /api/manufacturers

    Query Parameters:
        - active (optional): A boolean query parameter ("true" or "false") that determines
        whether to filter manufacturers based on their association with active inventory.
        Defaults to "true".

    Returns:
        - A JSON response containing a sorted list of manufacturers. Each manufacturer is
        represented as a dictionary with the following keys:
            - "name": The name of the manufacturer.
            - "id": The unique identifier of the manufacturer.

    Behavior:
        - If the "active" query parameter is set to "true" (default), the response will
        include only manufacturers associated with active inventory.
        - If the "active" query parameter is set to "false", the response will include all
        manufacturers.
        - The list of manufacturers is sorted alphabetically by name (case-insensitive).
    """
    active = request.args.get("active", "true").lower() == "true"
    query = db.session.query(Manufacturer)

    if active:
        query = query.filter(
            Manufacturer.Manufacturer_ID.in_(
                db.session.query(Chemical_Manufacturer.Manufacturer_ID)
                .join(Inventory)
                .distinct()
            )
        )

    manufacturer_list = query.all()
    return jsonify(
        sorted(
            [
                {
                    "name": man.Manufacturer_Name,
                    "id": man.Manufacturer_ID,
                }
                for man in manufacturer_list
            ],
            key=lambda x: x["name"].lower(),
        )
    )


@manufacturers.route("/api/add_manufacturer", methods=["POST"])
@oidc.require_login
@require_editor
def create_manufacturer():
    """
    Creates a new manufacturer and adds it to the database.

    Endpoint:
        POST /api/add_manufacturer

    Request Body:
        JSON object containing:
            - name (str): The name of the manufacturer to be created.

    Returns:
        JSON response containing:
            - message (str): Confirmation message indicating success.
            - id (int): The unique ID of the newly created manufacturer.
            - name (str): The name of the newly created manufacturer.
    """
    name = request.json.get("name")
    if not name:
        return jsonify({"message": "Manufacturer name is required."}), 400
    if db.session.query(Manufacturer).filter(Manufacturer.Manufacturer_Name == name).first():
        return jsonify({"message": "Manufacturer with this name already exists."}), 400

    new_manufacturer = Manufacturer(Manufacturer_Name=name)
    db.session.add(new_manufacturer)
    db.session.commit()
    return jsonify(
        {
            "message": "Manufacturer created successfully",
            "id": new_manufacturer.Manufacturer_ID,
            "name": new_manufacturer.Manufacturer_Name,
        }
    )


@manufacturers.route("/api/delete_manufacturers", methods=["DELETE"])
@oidc.require_login
@require_editor
def delete_manufacturers():
    """
    Deletes multiple manufacturers from the database.

    Returns:
        jsonify: A JSON response indicating the success or failure of the deletion.
    """
    data = request.get_json()
    manufacturer_ids = data.get("ids")

    if not manufacturer_ids:
        return jsonify({"message": "No manufacturer IDs provided."}), 400

    # Delete related records in Inventory
    db.session.query(Inventory).filter(
        Inventory.Chemical_Manufacturer_ID.in_(
            db.session.query(Chemical_Manufacturer.Chemical_Manufacturer_ID).filter(
                Chemical_Manufacturer.Manufacturer_ID.in_(manufacturer_ids)
            )
        )
    ).delete(synchronize_session=False)

    # Delete related records in Chemical_Manufacturer
    db.session.query(Chemical_Manufacturer).filter(
        Chemical_Manufacturer.Manufacturer_ID.in_(manufacturer_ids)
    ).delete(synchronize_session=False)

    # Delete manufacturers by their IDs
    db.session.query(Manufacturer).filter(
        Manufacturer.Manufacturer_ID.in_(manufacturer_ids)
    ).delete(synchronize_session=False)
    
    db.session.commit()

    return jsonify({"message": "Manufacturers deleted successfully."}), 200


@manufacturers.route("/api/manufacturers/<int:manufacturer_id>", methods=["PUT"])
@oidc.require_login
@require_editor
def update_manufacturer(manufacturer_id):
    """
    Updates an existing manufacturer in the database.

    Args:
        manufacturer_id (int): The ID of the manufacturer to update.

    Returns:
        jsonify: A JSON response indicating the success or failure of the update.
    """
    data = request.get_json()
    name = data.get("name")

    if not name:
        return jsonify({"message": "Manufacturer name is required."}), 400

    manufacturer = db.session.query(Manufacturer).filter(Manufacturer.Manufacturer_ID == manufacturer_id).first()

    if not manufacturer:
        return jsonify({"message": "Manufacturer not found."}), 404

    manufacturer.Manufacturer_Name = name
    db.session.commit()

    return jsonify({"message": "Manufacturer updated successfully."}), 200
