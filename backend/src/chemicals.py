
from flask import Blueprint, request, jsonify
from sqlalchemy import func

from models import Chemical, Inventory, Chemical_Manufacturer
from database import db
chemicals = Blueprint('chemicals', __name__)

@chemicals.route('/api/add_chemical', methods=['POST'])
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
        Minimum_On_Hand=minimum_on_hand
    )
    db.session.add(chemical)
    db.session.commit()
    return {"message": "Chemical added successfully"}


@chemicals.route('/api/get_chemicals', methods=['GET'])
def get_chemicals():
    """
    API to get chemical details from the database.
    :return: A list of chemicals
    """
    chemicals_data = db.session.query(
        Chemical.Chemical_ID,
        Chemical.Chemical_Name,
        Chemical.Chemical_Formula,
        func.count(Inventory.Inventory_ID).label("quantity")
    ).outerjoin(Chemical_Manufacturer, Chemical.Chemical_ID == Chemical_Manufacturer.Chemical_ID
    ).outerjoin(Inventory, Chemical_Manufacturer.Chemical_Manufacturer_ID == Inventory.Chemical_Manufacturer_ID
    ).group_by(Chemical.Chemical_ID).all()

    chemical_list = [
        {
            "id": chem.Chemical_ID,
            "chemical_name": chem.Chemical_Name,
            "formula": chem.Chemical_Formula,
            "quantity": chem.quantity
        }
        for chem in chemicals_data
    ]

    return jsonify(chemical_list)