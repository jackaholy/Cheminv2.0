from datetime import datetime
from flask import Blueprint, request, jsonify, session
from sqlalchemy import func
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
    Location,
    Sub_Location,
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

    current_username = session["oidc_auth_profile"].get("preferred_username")

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
        Sub_Location_ID=sub_location_id,
        Last_Updated=datetime.now(),
        Who_updated=current_username,
        Is_Dead=False,
    )
    db.session.add(inventory)
    db.session.commit()
    return {
        "message": "Bottle added successfully",
        "inventory_id": inventory.Inventory_ID,
    }


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
    chemical_list = filter(lambda x: x["quantity"] > 0, chemical_list)
    chemical_list = sorted(
        chemical_list,
        key=lambda x: re.sub(r"[^a-zA-Z]", "", x["chemical_name"]).lower(),
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
    chemical_id = request.json.get("chemical_id")
    chemical = Chemical.query.get(chemical_id)
    chemical.Is_Dead = True
    db.session.commit()
    return {"message": "Chemical marked as dead"}
