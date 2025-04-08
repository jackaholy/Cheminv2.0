from flask import Blueprint, request, jsonify
from database import db
from models import Manufacturer, Chemical_Manufacturer, Inventory
from oidc import oidc
from permission_requirements import require_editor
manufacturers = Blueprint("manufacturers", __name__)


@manufacturers.route("/api/manufacturers", methods=["GET"])
def get_manufacturers():
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
    name = request.json.get("name")
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
