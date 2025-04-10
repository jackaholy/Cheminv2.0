from datetime import datetime
from flask import Blueprint, request, jsonify, session
from msds import get_msds_url
from oidc import oidc
from permission_requirements import require_editor
from sqlalchemy.orm import joinedload
import re

from models import (
    Chemical,
    Inventory,
    Chemical_Manufacturer,
    Storage_Class,
    Manufacturer,
    Sub_Location,
    Location,
    User,
)
from database import db

chemicals = Blueprint("chemicals", __name__)


@chemicals.route("/api/add_bottle", methods=["POST"])
@oidc.require_login
@require_editor
def add_bottle():
    sticker_number = request.json.get("sticker_number")
    chemical_id = request.json.get("chemical_id")
    manufacturer_id = request.json.get("manufacturer_id")
    location_id = request.json.get("location_id")
    sub_location_id = request.json.get("sub_location_id")
    product_number = request.json.get("product_number")
    msds = request.json.get("msds")

    current_username = session["oidc_auth_profile"].get("preferred_username")
    print(msds)
    if msds:
        msds = get_msds_url()
    else:
        msds = None
    print(msds)
    chemical_manufacturer = (
        db.session.query(Chemical_Manufacturer)
        .filter(
            Chemical_Manufacturer.Chemical_ID == chemical_id,
            Chemical_Manufacturer.Manufacturer_ID == manufacturer_id,
        )
        .first()
    )
    if not chemical_manufacturer:
        chemical_manufacturer = Chemical_Manufacturer(
            Chemical_ID=chemical_id,
            Manufacturer_ID=manufacturer_id,
            Product_Number=product_number,
        )
        db.session.add(chemical_manufacturer)
        db.session.commit()

    inventory = Inventory(
        Sticker_Number=sticker_number,
        Chemical_Manufacturer_ID=chemical_manufacturer.Chemical_Manufacturer_ID,
        Product_Number=product_number,
        Sub_Location_ID=sub_location_id,
        Last_Updated=datetime.now(),
        Who_Updated=current_username,
        Is_Dead=False,
        MSDS=msds,
    )
    db.session.add(inventory)
    db.session.commit()
    return {
        "message": "Bottle added successfully",
        "inventory_id": inventory.Inventory_ID,
    }


@chemicals.route("/api/product-search", methods=["GET"])
def product_search():
    # Get the query parameter; default to an empty string if not provided.
    query = request.args.get("query", "")

    # If query is empty, return an empty list immediately.
    if not query:
        return jsonify([])

    # Perform a case-insensitive search using the "ilike" operator.
    results = (
        db.session.query(Inventory)
        .filter(Inventory.Product_Number.ilike(f"%{query}%"))
        .all()
    )

    # Extract product numbers, making sure to only return non-null values.
    product_numbers = [item.Product_Number for item in results if item.Product_Number]
    product_numbers = list(set(product_numbers))
    return jsonify(product_numbers)


@chemicals.route("/api/add_chemical", methods=["POST"])
@oidc.require_login
@require_editor
def add_chemical():
    chemical_name = request.json.get("chemical_name")
    chemical_formula = request.json.get("chemical_formula")
    product_number = request.json.get("product_number")
    storage_class_id = request.json.get("storage_class_id")
    manufacturer_id = request.json.get("manufacturer_id")

    current_username = session["oidc_auth_profile"].get("preferred_username")
    user = db.session.query(User).filter_by(User_Name=current_username).first()

    manufacturer = (
        db.session.query(Manufacturer)
        .filter_by(Manufacturer_ID=manufacturer_id)
        .first()
    )
    storage_class = (
        db.session.query(Storage_Class)
        .filter(Storage_Class.Storage_Class_ID == storage_class_id)
        .first()
    )
    # order_more = request.json.get("order_more")
    # order_description = request.json.get("order_description")
    # who_requested = request.json.get("who_requested")
    # date_requested = request.json.get("date_requested")
    # who_ordered = request.json.get("who_ordered")
    date_ordered = datetime.now()

    # minimum_on_hand = request.json.get("minimum_on_hand")

    chemical = Chemical(
        Chemical_Name=chemical_name,
        Alphabetical_Name=chemical_name,
        Chemical_Formula=chemical_formula,
        Storage_Class_ID=storage_class,
        # Manufacturer=manufacturer,
        Storage_Class=storage_class,
        # When_Ordered=date_ordered,
        # Order_More=order_more,
        # Order_Description=order_description,
        # Who_Requested=who_requested,
        # When_Requested=date_requested,
        # Who_Ordered=u,
        # When_Ordered=date_ordered,
        # Minimum_On_Hand=minimum_on_hand,
    )
    chemical_manufacturer = Chemical_Manufacturer(
        Chemical=chemical, Manufacturer=manufacturer, Product_Number=product_number
    )
    chemical.Storage_Class = storage_class
    db.session.add(chemical)
    db.session.add(chemical_manufacturer)
    db.session.commit()
    return {
        "message": "Chemical added successfully",
        "chemical_id": chemical.Chemical_ID,
    }


@chemicals.route("/api/storage_classes", methods=["GET"])
def get_storage_classes():
    """
    API to get storage classes from the database.
    :return: A list of storage classes
    """
    storage_classes = db.session.query(Storage_Class).all()
    return jsonify(
        [
            {"name": sc.Storage_Class_Name, "id": sc.Storage_Class_ID}
            for sc in storage_classes
        ]
    )


@chemicals.route("/api/get_chemicals", methods=["GET"])
@oidc.require_login
def get_chemicals():
    """
    API to get chemical details from the database.
    :return: A list of chemicals
    """
    chemicals = (
        db.session.query(Chemical)
        .options(
            joinedload(Chemical.Storage_Class),
            joinedload(Chemical.Chemical_Manufacturers)
            .joinedload(Chemical_Manufacturer.Inventory)
            .joinedload(Inventory.Sub_Location)
            .joinedload(Sub_Location.Location),
            joinedload(Chemical.Chemical_Manufacturers).joinedload(
                Chemical_Manufacturer.Manufacturer
            ),
        )
        .all()
    )

    chemical_list = [chem.to_dict() for chem in chemicals]
    # chemical_list = filter(lambda x: x["quantity"] > 0, chemical_list)
    chemical_list = sorted(
        chemical_list,
        key=lambda x: (
            x["quantity"] == 0,
            re.sub(r"[^a-zA-Z]", "", x["chemical_name"]).lower(),
        ),
    )
    return jsonify(chemical_list)


@chemicals.route("/api/chemicals/product_number_lookup", methods=["GET"])
@oidc.require_login
def product_number_lookup():
    """
    API to get chemical details based on the product number.
    :param product_number: The product number of the chemical.
    :return: Details for the chemical with the given product number.
    """
    product_number = request.args.get("product_number")
    if product_number == "":
        return jsonify({}), 404
    query_result = (
        db.session.query(Chemical_Manufacturer)
        .filter(Chemical_Manufacturer.Product_Number.ilike(product_number))
        .first()
    )
    if not query_result:
        return jsonify({}), 404
    chemicals_data = {
        "chemical_id": query_result.Chemical.Chemical_ID,
        "manufacturer": {
            "name": query_result.Manufacturer.Manufacturer_Name,
            "id": query_result.Manufacturer.Manufacturer_ID,
        },
        "product_number": query_result.Product_Number,
    }
    return jsonify(chemicals_data)


@chemicals.route("/api/chemicals/chemical_name_lookup", methods=["GET"])
def chemical_name_lookup():
    """
    API to get chemical details based on the chemical name.
    :return: Details for the chemical with the given chemical name.
    """
    chemical_name = request.args.get("chemical_name")
    query_result = (
        db.session.query(
            Chemical.Chemical_ID,
            Chemical.Chemical_Name,
            Chemical.Chemical_Formula,
            Storage_Class.Storage_Class_Name,
        )
        .join(
            Storage_Class, Chemical.Storage_Class_ID == Storage_Class.Storage_Class_ID
        )
        .filter(Chemical.Chemical_Name == chemical_name)
        .first()
    )
    if not query_result:
        return jsonify({}), 404
    chemicals_data = {
        "chemical_id": query_result[0],
        "chemical_name": query_result[1],
        "chemical_formula": query_result[2],
        "storage_class": query_result[3],
    }
    return jsonify(chemicals_data)


@chemicals.route("/api/chemicals/mark_dead", methods=["POST"])
@oidc.require_login
def mark_dead():
    """
    API to mark a chemical as dead.
    :return: Message indicating the chemical has been marked as dead.
    """
    inventory_id = request.json.get("inventory_id")

    if not inventory_id:
        return jsonify({"error": "Missing inventory_id"}), 400

    bottle = db.session.query(Inventory).filter_by(Inventory_ID=inventory_id).first()
    bottle.Is_Dead = True
    db.session.commit()
    return {"message": "Chemical marked as dead"}

@chemicals.route("/api/chemicals/mark_many_dead", methods=["POST"])
@oidc.require_login
def mark_many_dead():
    """
    API to mark multiple chemicals as dead.
    :return: Message indicating the chemicals that have been marked as dead.
    """
    sub_location_id = request.json.get("sub_location_id")
    inventory_ids = request.json.get("inventory_id")

    if not sub_location_id or not isinstance(sub_location_id, int):
        return jsonify({"error": "Missing or invalid sub_location_id"}), 400
    if not inventory_ids or not isinstance(inventory_ids, list):
        return jsonify({"error": "Missing or invalid inventory_id"}), 400

    # Get all chemicals in the specified sublocation
    bottles_to_check = db.session.query(Inventory).filter(
        Inventory.Sub_Location_ID == sub_location_id,
        Inventory.Is_Dead == False
    ).all()

    if len(bottles_to_check) == 0:
        return jsonify({"error": "No chemicals marked as dead"}), 400

    # Remove the ones that are not accounted for
    bottles_not_found = [
        bottle for bottle in bottles_to_check
        if bottle.Sticker_Number in inventory_ids
    ]

    for bottle in bottles_not_found:
        bottle.Is_Dead = True

    db.session.commit()
    return {"message": f"{len(bottles_not_found)} chemicals marked as dead"}


@chemicals.route("/api/chemicals/mark_alive", methods=["POST"])
@oidc.require_login
def mark_alive():
    """
    API to mark a chemical as alive.
    :return: Message indicating the chemical has been marked as alive.
    """
    inventory_id = request.json.get("inventory_id")
    bottle = db.session.query(Inventory).filter_by(Inventory_ID=inventory_id).first()
    bottle.Is_Dead = False
    db.session.commit()
    return {"message": "Chemical marked as alive"}


@chemicals.route("/api/chemicals/by_sublocation", methods=["GET"])
@oidc.require_login
def get_chemicals_by_sublocation():
    """
    API to get chemicals by sublocation.
    :return: A list of chemicals.
    """
    sub_location_id = request.args.get("sub_location_id", type=int)

    if not sub_location_id:
        return jsonify({"error": "sub_location_id is required"}), 400


    # Query inventory records for the specified sublocation
    inventory_records = (
        db.session.query(Inventory)
        .join(Chemical_Manufacturer)
        .join(Chemical)
        .join(Sub_Location)
        .join(Location)
        .filter(Inventory.Sub_Location_ID == sub_location_id,
                Inventory.Is_Dead == False  # Filter out dead chemicals
                )
        .all()
    )

    # Build the response with relevant details
    chemical_list = [
        {
            "name": record.Chemical_Manufacturer.Chemical.Chemical_Name,
            "product_number": record.Chemical_Manufacturer.Product_Number,
            "manufacturer": record.Chemical_Manufacturer.Manufacturer.Manufacturer_Name,
            "sticker_number": record.Sticker_Number,
        }
        for record in inventory_records
    ]

    return jsonify(chemical_list)


@chemicals.route("/api/chemicals/sticker_lookup", methods=["GET"])
@oidc.require_login
def sticker_lookup():
    """
    Look up a chemical's current sublocation by sticker number.
    """
    sticker_number = request.args.get("sticker_number")

    if not sticker_number:
        return jsonify({"error": "Missing sticker_number"}), 400

    bottle = (
        db.session.query(Inventory)
        .filter_by(Sticker_Number=sticker_number)
        .join(Sub_Location)
        .join(Location)
        .first()
    )

    if not bottle:
        return jsonify({"error": "Sticker not found"}), 404

    return jsonify({
        "inventory_id": bottle.Inventory_ID,
        "sub_location_id": bottle.Sub_Location.Sub_Location_ID,
        "location_name": bottle.Sub_Location.Location.Building + " " + bottle.Sub_Location.Location.Room,
        "sub_location_name": bottle.Sub_Location.Sub_Location_Name
    })


@chemicals.route("/api/chemicals/update_chemical_location", methods=["POST"])
@oidc.require_login
def update_location():
    inventory_id = request.json.get("inventory_id")
    new_sub_location_id = request.json.get("new_sub_location_id")

    bottle = db.session.query(Inventory).filter_by(Inventory_ID=inventory_id).first()
    bottle.Sub_Location_ID = new_sub_location_id
    db.session.commit()
    return jsonify({"message": "Location updated"})