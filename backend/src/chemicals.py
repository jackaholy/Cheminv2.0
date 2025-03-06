from flask import Blueprint, request, jsonify
from sqlalchemy import func

from models import (
    Chemical,
    Inventory,
    Chemical_Manufacturer,
    Storage_Class,
    Manufacturer,
)
from database import db

chemicals = Blueprint("chemicals", __name__)


@chemicals.route("/api/add_chemical", methods=["POST"])
def add_chemical():
    chemical_name = request.json.get("chemical_name")
    chemical_formula = request.json.get("chemical_formula")
    storage_class = request.json.get("storage_class")
    order_more = request.json.get("order_more")
    order_description = request.json.get("order_description")
    who_requested = request.json.get("who_requested")
    date_requested = request.json.get("date_requested")
    who_ordered = request.json.get("who_ordered")
    date_ordered = request.json.get("date_ordered")
    minimum_on_hand = request.json.get("minimum_on_hand")

    chemical = Chemical(
        Chemical_Name=chemical_name,
        Chemical_Formula=chemical_formula,
        Storage_Class_ID=storage_class,
        Order_More=order_more,
        Order_Description=order_description,
        Who_Requested=who_requested,
        When_Requested=date_requested,
        Who_Ordered=who_ordered,
        When_Ordered=date_ordered,
        Minimum_On_Hand=minimum_on_hand,
    )
    db.session.add(chemical)
    db.session.commit()
    return {"message": "Chemical added successfully"}


@chemicals.route("/api/get_chemicals", methods=["GET"])
def get_chemicals():
    """
    API to get chemical details from the database.
    :return: A list of chemicals
    """
    chemicals_data = (
        db.session.query(
            Chemical.Chemical_ID,
            Chemical.Chemical_Name,
            Chemical.Chemical_Formula,
            func.count(Inventory.Inventory_ID).label("quantity"),
        )
        .outerjoin(
            Chemical_Manufacturer,
            Chemical.Chemical_ID == Chemical_Manufacturer.Chemical_ID,
        )
        .outerjoin(
            Inventory,
            Chemical_Manufacturer.Chemical_Manufacturer_ID
            == Inventory.Chemical_Manufacturer_ID,
        )
        .group_by(Chemical.Chemical_ID)
        .all()
    )

    chemical_list = [
        {
            "id": chem.Chemical_ID,
            "chemical_name": chem.Chemical_Name,
            "formula": chem.Chemical_Formula,
            "quantity": chem.quantity,
        }
        for chem in chemicals_data
    ]

    return jsonify(chemical_list)


@chemicals.route("/api/chemicals/product_number_lookup", methods=["GET"])
def product_number_lookup():
    """
    API to get chemical details based on the product number.
    :return: Details for the chemical with the given product number.
    """
    product_number = request.args.get("product_number")
    query_result = (
        db.session.query(
            Chemical.Chemical_Name,
            Chemical.Chemical_Formula,
            Storage_Class.Storage_Class_Name,
            Manufacturer.Manufacturer_Name,
            Chemical_Manufacturer.Product_Number,
        )
        .join(
            Chemical_Manufacturer,
            Chemical.Chemical_ID == Chemical_Manufacturer.Chemical_ID,
        )
        .join(
            Storage_Class, Chemical.Storage_Class_ID == Storage_Class.Storage_Class_ID
        )
        .join(
            Manufacturer,
            Chemical_Manufacturer.Manufacturer_ID == Manufacturer.Manufacturer_ID,
        )
        .filter(Chemical_Manufacturer.Product_Number == product_number)
        .first()
    )
    if not query_result:
        return jsonify({}), 404
    chemicals_data = {
        "chemical_name": query_result[0],
        "chemical_formula": query_result[1],
        "storage_class": query_result[2],
        "manufacturer": query_result[3],
        "product_number": query_result[4],
    }
    return jsonify(chemicals_data)


@chemicals.route("/api/chemicals/mark_dead", methods=["POST"])
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
