from flask import Blueprint, request, jsonify
from database import db
from models import Manufacturer

manufacturers = Blueprint("manufacturers", __name__)


@manufacturers.route("/api/manufacturers", methods=["GET"])
def get_manufacturers():
    manufacturer_list = db.session.query(Manufacturer).all()
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
