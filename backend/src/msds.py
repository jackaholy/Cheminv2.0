from flask import Blueprint, jsonify, request
from sqlalchemy import or_
from oidc import oidc
from permission_requirements import require_editor
from models import Inventory, Chemical, Manufacturer, Chemical_Manufacturer
from database import db

msds = Blueprint("msds", __name__)


def get_msds_url():
    # Grab a random(ish) chemical and go to its MSDS link
    product = (
        db.session.query(Inventory)
        .filter(Inventory.MSDS != None, Inventory.MSDS != "")
        .first()
    )
    return product.MSDS


@msds.route("/api/get_msds_url", methods=["GET"])
@oidc.require_login
def msds_url():
    return jsonify({"url": get_msds_url()})


@msds.route("/api/set_msds_url", methods=["POST"])
@oidc.require_login
@require_editor
def set_msds_url():
    url = request.json.get("url")
    db.session.query(Inventory).filter(
        Inventory.MSDS != None, Inventory.MSDS != ""
    ).update({Inventory.MSDS: url})
    db.session.commit()
    return {"success": True}


@msds.route("/api/get_missing_msds", methods=["GET"])
@oidc.require_login
@require_editor
def get_missing_msds():
    # Query for all inventory items that are missing an MSDS URL
    chemicals_without_msds = (
        db.session.query(
            Inventory.Sticker_Number,
            Chemical.Chemical_Name,
            Manufacturer.Manufacturer_Name,
            Chemical_Manufacturer.Product_Number,
        )
        .join(
            Chemical_Manufacturer,
            Inventory.Chemical_Manufacturer_ID
            == Chemical_Manufacturer.Chemical_Manufacturer_ID,
        )
        .join(Chemical, Chemical_Manufacturer.Chemical_ID == Chemical.Chemical_ID)
        .join(
            Manufacturer,
            Chemical_Manufacturer.Manufacturer_ID == Manufacturer.Manufacturer_ID,
        )
        .filter(or_(Inventory.MSDS == None, Inventory.MSDS == ""))
        .all()
    )

    # Convert to JSON format
    return jsonify(
        [
            {
                "sticker_number": chemical.Sticker_Number,
                "chemical_name": chemical.Chemical_Name,
                "manufacturer_name": chemical.Manufacturer_Name,
                "product_number": chemical.Product_Number,
            }
            for chemical in chemicals_without_msds
        ]
    )
