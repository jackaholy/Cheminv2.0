import logging
from flask import Blueprint, jsonify, request
from sqlalchemy import or_
from oidc import oidc
from permission_requirements import require_editor
from models import Inventory, Chemical, Manufacturer, Chemical_Manufacturer
from database import db

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

msds = Blueprint("msds", __name__)


def get_msds_url():
    """
    Grab a random(ish) chemical and go to its MSDS link.
    This is an inelegant hack, but it's easier than a database migration.

    :return: MSDS URL.
    """
    logger.info("Fetching a random MSDS URL.")
    product = (
        db.session.query(Inventory)
        .filter(Inventory.MSDS != None, Inventory.MSDS != "")
        .first()
    )
    if not product:
        logger.warning("No product with an MSDS URL found.")
        return ""
    logger.info(f"Found MSDS URL: {product.MSDS} for product ID: {product.Inventory_ID}")
    return product.MSDS


@msds.route("/api/get_msds_url", methods=["GET"])
@oidc.require_login
def msds_url():
    """
    :return: JSON MSDS URL.
    """
    return jsonify({"url": get_msds_url()})


@msds.route("/api/set_msds_url", methods=["POST"])
@oidc.require_login
@require_editor
def set_msds_url():
    """
    :return: JSON indicating success.
    """
    url = request.json.get("url")
    logger.info(f"Updating MSDS URL to: {url}")
    rows_updated = db.session.query(Inventory).filter(
        Inventory.MSDS != None, Inventory.MSDS != ""
    ).update({Inventory.MSDS: url})
    db.session.commit()
    logger.info(f"Updated MSDS URL for {rows_updated} inventory records.")
    return {"success": True}


@msds.route("/api/add_msds", methods=["POST"])
@oidc.require_login
@require_editor
def add_msds():
    """
    Adds an MSDS URL for a specific inventory record.

    :return: JSON indicating success.
    """
    inventory_id = request.json.get("inventory_id")
    msds_url = get_msds_url()
    logger.info(f"Adding MSDS URL: {msds_url} to inventory ID: {inventory_id}")
    item = (
        db.session.query(Inventory)
        .filter(Inventory.Inventory_ID == inventory_id)
        .first()
    )
    if item:
        item.MSDS = msds_url
        db.session.commit()
        logger.info(f"MSDS URL added to inventory ID: {inventory_id}. URL: {msds_url}")
        return {"success": True}
    else:
        logger.warning(f"Failed to add MSDS URL. Inventory ID {inventory_id} not found.")
        return {"success": False, "error": "Item not found"}


@msds.route("/api/clear_msds", methods=["POST"])
@oidc.require_login
@require_editor
def clear_msds():
    """
    Clear the MSDS URL from a specific inventory record.

    This endpoint accepts a POST request with a JSON body containing an `inventory_id`.
    It sets the `MSDS` field to None for the specified inventory item and commits the change.

    :return: JSON indicating success.
    """
    inventory_id = request.json.get("inventory_id")
    logger.info(f"Clearing MSDS URL for inventory ID: {inventory_id}")
    item = (
        db.session.query(Inventory)
        .filter(Inventory.Inventory_ID == inventory_id)
        .first()
    )
    if item:
        item.MSDS = None
        db.session.commit()
        logger.info(f"Cleared MSDS URL for inventory ID: {inventory_id}")
        return {"success": True}
    else:
        logger.warning(f"Failed to clear MSDS URL. Inventory ID {inventory_id} not found.")
        return {"success": False, "error": "Item not found"}


@msds.route("/api/get_missing_msds", methods=["GET"])
@oidc.require_login
@require_editor
def get_missing_msds():
    """
    Retrieve a list of all inventory items missing an MSDS URL.

    This endpoint returns a JSON list of inventory items where the `MSDS` field is either null or empty.
    Each item in the response includes the sticker number, chemical name, manufacturer name,
    product number, and inventory ID.

    :return: JSON array of inventory items missing MSDS information.
    """
    chemicals_without_msds = (
        db.session.query(
            Inventory.Sticker_Number,
            Inventory.Inventory_ID,
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
    logger.info(f"Found {len(chemicals_without_msds)} items missing MSDS URLs.")
    logger.info(f"Returning {len(chemicals_without_msds)} items missing MSDS URLs.")
    return jsonify(
        [
            {
                "sticker_number": chemical.Sticker_Number,
                "chemical_name": chemical.Chemical_Name,
                "manufacturer_name": chemical.Manufacturer_Name,
                "product_number": chemical.Product_Number,
                "inventory_id": chemical.Inventory_ID,
            }
            for chemical in chemicals_without_msds
        ]
    )
