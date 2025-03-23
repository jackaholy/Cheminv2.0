from flask import Blueprint, request, jsonify
from database import db
from models import Manufacturer, Chemical_Manufacturer, Inventory

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
    return sorted(
        [
            {
                "name": man.Manufacturer_Name,
                "id": man.Manufacturer_ID,
            }
            for man in manufacturer_list
        ],
        key=lambda x: x["name"].lower(),
    )


@manufacturers.route("/api/add_manufacturer", methods=["POST"])
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
