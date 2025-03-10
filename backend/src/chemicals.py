from datetime import datetime
from flask import Blueprint, request, jsonify
from sqlalchemy import func
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
def add_bottle():
    sticker_number = request.json.get("sticker_number")
    chemical_id = request.json.get("chemical_id")
    sub_location_id = request.json.get("sub_location_id")
    location_id = request.json.get("location_id")

    inventory = Inventory(
        Sticker_Number=sticker_number,
        Chemical_ID=chemical_id,
        Sub_Location_ID=sub_location_id,
        Location_ID=location_id,
        Is_Dead=False,
    )
    db.session.add(inventory)
    db.session.commit()
    return {
        "message": "Bottle added successfully",
        "inventory_id": inventory.Inventory_ID,
    }


@chemicals.route("/api/add_chemical", methods=["POST"])
def add_chemical():
    chemical_name = request.json.get("chemical_name")
    chemical_formula = request.json.get("chemical_formula")
    product_number = request.json.get("product_number")
    storage_class_id = request.json.get("storage_class_id")
    manufacturer_id = request.json.get("manufacturer_id")

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
        # Who_Ordered=who_ordered,
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
            Storage_Class.Storage_Class_Name,
            func.count(Inventory.Inventory_ID).label("quantity"),
            Inventory.Inventory_ID.label("inventory_id"),
            Inventory.Sticker_Number.label("sticker"),
            Sub_Location.Sub_Location_Name.label("sub_location"),
            Location.Location_ID.label("location_id"),
            Manufacturer.Manufacturer_Name.label("manufacturer"),
            Chemical_Manufacturer.Product_Number.label("product_number"),
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
        .outerjoin(
            Storage_Class,
            Chemical.Storage_Class_ID == Storage_Class.Storage_Class_ID,
        )
        .outerjoin(
            Sub_Location,
            Inventory.Sub_Location_ID == Sub_Location.Sub_Location_ID,
        )
        .outerjoin(
            Location,
            Sub_Location.Location_ID == Location.Location_ID,
        )
        .outerjoin(
            Manufacturer,
            Chemical_Manufacturer.Manufacturer_ID == Manufacturer.Manufacturer_ID,
        )
        .group_by(
            Chemical.Chemical_ID,
            Inventory.Inventory_ID,
            Storage_Class.Storage_Class_Name,
            Sub_Location.Sub_Location_Name,
            Location.Location_ID,
            Manufacturer.Manufacturer_Name,
            Chemical_Manufacturer.Product_Number,
        )
        .all()
    )

    # Organizing the fetched data into a dictionary of chemicals
    chemical_dict = {}

    for chem in chemicals_data:
        # Create a chemical entry if not already added
        if chem.Chemical_ID not in chemical_dict:
            chemical_dict[chem.Chemical_ID] = {
                "id": chem.Chemical_ID,
                "chemical_name": chem.Chemical_Name,
                "formula": chem.Chemical_Formula,
                "storage_class": chem.Storage_Class_Name,
                "inventory": [],
            }

        # Append inventory information to the correct chemical entry
        chemical_dict[chem.Chemical_ID]["inventory"].append(
            {
                "sticker": chem.sticker,
                "product_number": chem.product_number,
                "sub_location": chem.sub_location,
                "location": chem.location_id,
                "manufacturer": chem.manufacturer,
            }
        )

        chemical_dict[chem.Chemical_ID]["quantity"] = len(
            chemical_dict[chem.Chemical_ID]["inventory"]
        )

    # Converting the dictionary into a list of chemicals
    chemical_list = list(chemical_dict.values())

    return jsonify(chemical_list)


@chemicals.route("/api/chemicals/product_number_lookup", methods=["GET"])
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
        .filter(Chemical_Manufacturer.Product_Number == product_number)
        .first()
    )
    print(query_result)
    if not query_result:
        return jsonify({}), 404
    chemicals_data = {"chemical_id": query_result.Chemical.Chemical_ID}
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
            Chemical.Chemical_Name,
            Chemical.Chemical_Formula,
            Storage_Class.Storage_Class_Name,
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
        .filter(Chemical.Chemical_Name == chemical_name)
        .first()
    )
    if not query_result:
        return jsonify({}), 404
    chemicals_data = {
        "chemical_name": query_result[0],
        "chemical_formula": query_result[1],
        "storage_class": query_result[2],
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
