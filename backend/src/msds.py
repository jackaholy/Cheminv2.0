from flask import Blueprint, jsonify, request
from oidc import oidc
from permission_requirements import require_editor
from models import Inventory
from database import db

msds = Blueprint("msds", __name__)


@msds.route("/api/get_msds_url", methods=["GET"])
@oidc.require_login
def msds_url():
    # Grab a random(ish) chemical and go to its MSDS link
    product = (
        db.session.query(Inventory)
        .filter(Inventory.MSDS != None, Inventory.MSDS != "")
        .first()
    )
    return jsonify({"url": product.MSDS})


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
