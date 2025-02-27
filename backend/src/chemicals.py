
from flask import Blueprint, request, jsonify
from models import Chemical
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
    chemical_list = []
    # Search through the entire database
    with db.session() as session:
        chemicals = session.query(Chemical).all()
        # Iterate through each table from the database
        for chem in chemicals:
            # Add the appropriate chemical detail to the chemical list
            # We can add more chemical attributes below if needed
            chemical_list.append({
                "chemical_name": chem.Chemical_Name,
                "formula": chem.Chemical_Formula,
                "id": chem.Chemical_ID,
                "quantity": get_quantity(chem.Chemical_ID)
            })

    return jsonify(chemical_list)


def get_quantity(chemical_id):
    """
    Search through the database to find the number of instances a chemical appears.
    :param chemical_id: the chemical ID
    :return: quantity: of the chemical passed as an argument
    """
    quantity = 0
    with db.session() as session:
        # Check to see if chemical_ID's match
        chemical = session.query(Chemical).filter(Chemical.Chemical_ID == chemical_id).first()
        if chemical:
            for manufacturer in chemical.Chemical_Manufacturers:
                for inventory in manufacturer.Inventory:
                    quantity += 1

    return quantity