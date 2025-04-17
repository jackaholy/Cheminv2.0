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
from marshmallow import ValidationError
from schemas import AddBottleSchema, AddChemicalSchema, MarkManyDeadSchema, UpdateInventorySchema

chemicals = Blueprint("chemicals", __name__)

@chemicals.route("/api/add_bottle", methods=["POST"])
@oidc.require_login
@require_editor
def add_bottle():
    """
    API endpoint to add a new chemical bottle to the inventory.

    Requires the user to be logged in and have editor permissions.

    Expects JSON payload conforming to AddBottleSchema, which should include:
    - sticker_number: Unique identifier for the bottle
    - chemical_id: ID of the chemical
    - manufacturer_id: ID of the manufacturer
    - product_number: Manufacturer's product number
    - sub_location_id: ID of the sub-location within the lab/storage
    - msds: (optional) Whether to include a generated MSDS URL

    Returns:
        JSON response with success message and inventory ID,
        or error message with HTTP 400 on validation or duplication error.
    """
    try:
        data = AddBottleSchema().load(request.json)
    except ValidationError as err:
        return jsonify({"error": err.messages}), 400

    sticker_number_claimed = db.session.query(Inventory).filter(
        Inventory.Sticker_Number == data["sticker_number"]
    ).first()
    if sticker_number_claimed:
        return jsonify({"error": "Sticker number already exists"}), 400

    # Get the current user's username from the session
    current_username = session["oidc_auth_profile"].get("preferred_username")

    # Generate MSDS URL if requested
    msds = get_msds_url() if data.get("msds") else None

    # Look for an existing Chemical_Manufacturer association
    chemical_manufacturer = (
        db.session.query(Chemical_Manufacturer)
        .filter(
            Chemical_Manufacturer.Chemical_ID == data["chemical_id"],
            Chemical_Manufacturer.Manufacturer_ID == data["manufacturer_id"],
        )
        .first()
    )

    # If it doesn't exist, create and save a new one
    if not chemical_manufacturer:
        chemical_manufacturer = Chemical_Manufacturer(
            Chemical_ID=data["chemical_id"],
            Manufacturer_ID=data["manufacturer_id"],
            Product_Number=data["product_number"],
        )
        db.session.add(chemical_manufacturer)
        db.session.commit()

    # Create and save the new inventory record
    inventory = Inventory(
        Sticker_Number=data["sticker_number"],
        Chemical_Manufacturer_ID=chemical_manufacturer.Chemical_Manufacturer_ID,
        Product_Number=data["product_number"],
        Sub_Location_ID=data["sub_location_id"],
        Last_Updated=datetime.now(),
        Who_Updated=current_username,
        Is_Dead=False,
        MSDS=msds,
    )
    db.session.add(inventory)
    db.session.commit()

    # Return success response with the new inventory ID
    return {
        "message": "Bottle added successfully",
        "inventory_id": inventory.Inventory_ID,
    }


@chemicals.route("/api/product-search", methods=["GET"])
@oidc.require_login
def product_search():
    """
    This endpoint allows clients to search for product numbers in the inventory
    based on a query string provided as a URL parameter. The search is performed
    in a case-insensitive manner.

    Query Parameters:
        query (str): The product number or partial product number to search for.
                    Defaults to an empty string if not provided.

    Returns:
        Response: A JSON array of unique product numbers that match the query.
                If the query is empty, an empty list is returned.
    """
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
    """
    Adds a new chemical to the database.

    This endpoint is protected and requires the user to be logged in and have editor privileges.
    It accepts a JSON payload with details about the chemical, including its name, formula, 
    product number, storage class, and manufacturer.

    JSON Payload:
        chemical_name (str): The name of the chemical.
        chemical_formula (str): The formula of the chemical.
        product_number (str): The product number associated with the chemical.
        storage_class_id (int): The ID of the storage class for the chemical.
        manufacturer_id (int): The ID of the manufacturer of the chemical.

    Returns:
        dict: A success message and the ID of the newly added chemical.
    """
    try:
        data = AddChemicalSchema().load(request.json)
    except ValidationError as err:
        return jsonify({"error": err.messages}), 400

    # Check for duplicate sticker number
    if "sticker_number" in data:
        duplicate_sticker = (
            db.session.query(Inventory)
            .filter(Inventory.Sticker_Number == data["sticker_number"])
            .first()
        )
        if duplicate_sticker:
            return jsonify({"error": "Sticker number already exists"}), 400

    # Check if a different chemical with the same product number and manufacturer exists
    existing_chemical_manufacturer = (
        db.session.query(Chemical_Manufacturer)
        .filter(
            Chemical_Manufacturer.Product_Number == data["product_number"],
            Chemical_Manufacturer.Manufacturer_ID == data["manufacturer_id"]
        )
        .join(Chemical)
        .first()
    )
    if existing_chemical_manufacturer:
        return jsonify({"error": "A different chemical with the same product number and manufacturer already exists"}), 400

    chemical = Chemical(
        Chemical_Name=data["chemical_name"],
        Alphabetical_Name=data["chemical_name"],
        Chemical_Formula=data["chemical_formula"],
        Storage_Class_ID=data["storage_class_id"],
    )
    chemical_manufacturer = Chemical_Manufacturer(
        Chemical=chemical, Manufacturer_ID=data["manufacturer_id"], Product_Number=data["product_number"]
    )
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
    This endpoint retrieves all storage classes from the database and returns 
    them as a list of dictionaries, where each dictionary contains the 
    storage class name and its corresponding ID.

    :return: A JSON response containing a list of dictionaries. Each dictionary 
            has the following structure:
            {
                "name": <Storage_Class_Name>,
                "id": <Storage_Class_ID>
            }
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
    Look up chemical details by product number.

    Query Parameters:
        product_number (str): The product number to search for.

    Returns:
        JSON containing:
            - chemical_id (int): The unique ID of the chemical.
            - manufacturer (dict): Details of the manufacturer, including:
                - name (str): Manufacturer's name.
                - id (int): Manufacturer's unique ID.
            - product_number (str): The product number of the chemical.

        If no match is found or the product_number is missing, returns HTTP 404 with an empty JSON object.
    """
    product_number = request.args.get("product_number")
    if not product_number:  # Ensure product_number is provided
        return jsonify({}), 404

    # Query for the chemical manufacturer by product number
    query_result = (
        db.session.query(Chemical_Manufacturer)
        .filter(Chemical_Manufacturer.Product_Number.ilike(product_number))
        .first()
    )
    if not query_result:  # Return 404 if no match is found
        return jsonify({}), 404

    # Build response with chemical and manufacturer details
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
@oidc.require_login
def chemical_name_lookup():
    """
    API Endpoint: /api/chemicals/chemical_name_lookup (GET)

    Description:
    This API endpoint retrieves the details of a chemical based on its name. 
    It queries the database for the chemical's ID, name, formula, and associated storage class.

    Query Parameters:
    - chemical_name (str): The name of the chemical to look up.

    Returns:
    - 200 OK: A JSON object containing the following details of the chemical:
        - chemical_id (int): The unique identifier of the chemical.
        - chemical_name (str): The name of the chemical.
        - chemical_formula (str): The chemical formula of the chemical.
        - storage_class (str): The name of the storage class associated with the chemical.
    - 404 Not Found: An empty JSON object if no chemical is found with the given name.
    - 400 Bad Request: An error message if `chemical_name` is missing.
    """
    chemical_name = request.args.get("chemical_name")

    if not chemical_name:  # Check if chemical_name is provided
        return jsonify({"error": "Missing chemical_name"}), 400

    chemical_name = chemical_name.strip()
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
@require_editor
def mark_dead():
    """
    API to mark a chemical bottle as dead.

    This endpoint allows users with editor permissions to mark a specific chemical bottle
    in the inventory as "dead," indicating it is no longer in use.

    JSON Payload:
        inventory_id (int): The ID of the inventory record to mark as dead.

    Returns:
        - 200 OK: A success message indicating the chemical has been marked as dead.
        - 400 Bad Request: An error message if `inventory_id` is missing or invalid.
    """
    inventory_id = request.json.get("inventory_id")

    if not inventory_id:
        return jsonify({"error": "Missing inventory_id"}), 400

    if not isinstance(inventory_id, int):
        return jsonify({"error": "Invalid inventory_id"}), 400
    bottle = db.session.query(Inventory).filter_by(Inventory_ID=inventory_id).first()
    if not bottle:
        return jsonify({"error": "Bottle not found"}), 404

    bottle.Is_Dead = True
    db.session.commit()
    return {"message": "Chemical marked as dead"}

@chemicals.route("/api/chemicals/mark_many_dead", methods=["POST"])
@oidc.require_login
@require_editor
def mark_many_dead():
    """
    Marks multiple chemicals as dead in the inventory for a specified sub-location.

    This endpoint expects a JSON payload with a `sub_location_id` and a list of 
    `inventory_id` values. It updates the `Is_Dead` status of the specified chemicals 
    in the database.

    Returns:
        - 400 Bad Request: If validation fails or inventory IDs are not in the sub-location.
        - 200 OK: A success message with the count of chemicals marked as dead.

    JSON Payload:
        {
            "sub_location_id": int,  # ID of the sub-location to filter chemicals
            "inventory_id": list     # List of inventory IDs to mark as dead
        }

    Response:
        - Success: {"message": "<count> chemicals marked as dead"}
        - Error: {"error": "<error_message>"}
    """
    schema = MarkManyDeadSchema()
    try:
        data = schema.load(request.json)
    except ValidationError as err:
        return jsonify({"error": err.messages}), 400

    sub_location_id = data["sub_location_id"]
    inventory_ids = data["inventory_id"]

    # Query inventory records for the specified sub-location and inventory IDs
    bottles_to_check = db.session.query(Inventory).filter(
        Inventory.Sub_Location_ID == sub_location_id,
        Inventory.Inventory_ID.in_(inventory_ids)
    ).all()

    if len(bottles_to_check) != len(inventory_ids):
        return jsonify({"error": "Some inventory IDs are not in the specified sub-location"}), 400

    # Mark the bottles as dead
    for bottle in bottles_to_check:
        bottle.Is_Dead = True

    db.session.commit()
    return {"message": f"{len(bottles_to_check)} chemicals marked as dead"}


@chemicals.route("/api/chemicals/mark_alive", methods=["POST"])
@oidc.require_login
@require_editor
def mark_alive():
    """
    Marks a chemical as alive by updating its status in the database.

    This API endpoint is used to update the `Is_Dead` status of a chemical
    in the inventory to `False`, indicating that the chemical is active or
    usable. The endpoint requires the `inventory_id` of the chemical to be
    provided in the request body.

    Decorators:

    Request Body:
        inventory_id (int): The unique identifier of the chemical in the inventory.

    Returns:
        dict: A JSON object containing a success message.

    """
    inventory_id = request.json.get("inventory_id")

    if not inventory_id:
        return jsonify({"error": "Missing inventory_id"}), 400

    if not isinstance(inventory_id, int):
        return jsonify({"error": "Invalid inventory_id"}), 400
    bottle = db.session.query(Inventory).filter_by(Inventory_ID=inventory_id).first()
    if not bottle:
        return jsonify({"error": "Bottle not found"}), 404
    
    bottle = db.session.query(Inventory).filter_by(Inventory_ID=inventory_id).first()
    bottle.Is_Dead = False
    db.session.commit()
    return {"message": "Chemical marked as alive"}


@chemicals.route("/api/chemicals/by_sublocation", methods=["GET"])
@oidc.require_login
def get_chemicals_by_sublocation():
    """
    API Endpoint: /api/chemicals/by_sublocation (GET)

    This endpoint retrieves a list of chemicals associated with a specific sublocation.

    Parameters:
        - sub_location_id (int, required): The ID of the sublocation for which to retrieve chemicals.

    Returns:
        - 400 Bad Request: If the `sub_location_id` parameter is missing or invalid.
            Example response:
                "error": "sub_location_id is required"

        - 200 OK: A JSON array containing details of chemicals in the specified sublocation.
            Example response:
            [
                    "name": "Chemical Name",
                    "product_number": "Product Number",
                    "manufacturer": "Manufacturer Name",
                    "sticker_number": "Sticker Number"
                },
                ...

    Notes:
        - The endpoint requires the user to be logged in (OIDC authentication).
        - Chemicals marked as "dead" (Is_Dead == True) are excluded from the results.
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
    This endpoint retrieves information about a chemical's inventory, sublocation, 
    and location based on the provided sticker number. It requires the user to be 
    logged in via OIDC.

    Returns:
        - 400 Bad Request: If the `sticker_number` parameter is missing.
        - 404 Not Found: If no inventory item matches the provided sticker number.
        - 200 OK: A JSON object containing the following details:
            - inventory_id: The ID of the inventory item.
            - sub_location_id: The ID of the sublocation where the item is stored.
            - location_name: The name of the location (building and room).
            - sub_location_name: The name of the sublocation.

    Query Parameters:
        sticker_number (str): The sticker number of the chemical to look up.

    Example Response (200 OK):
        {
            "inventory_id": 123,
            "sub_location_id": 456,
            "location_name": "Building A Room 101",
            "sub_location_name": "Shelf 3"
        }
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
@require_editor
def update_location():
    """
    Updates the location of a chemical bottle in the inventory.

    This endpoint is used to update the sub-location of a specific chemical bottle
    in the inventory database. The user must be logged in and have editor privileges
    to access this endpoint.

    Route:
        POST /api/chemicals/update_chemical_location

    Request JSON Parameters:
        inventory_id (int): The ID of the inventory item (chemical bottle) to update.
        new_sub_location_id (int): The ID of the new sub-location to assign to the bottle.

    Returns:
        JSON: A success message indicating that the location has been updated.
    """
    inventory_id = request.json.get("inventory_id")
    new_sub_location_id = request.json.get("new_sub_location_id")

    # Validate inventory_id
    bottle = db.session.query(Inventory).filter_by(Inventory_ID=inventory_id).first()
    if not bottle:
        return jsonify({"error": "Invalid inventory_id"}), 400

    # Validate new_sub_location_id
    sub_location = db.session.query(Sub_Location).filter_by(Sub_Location_ID=new_sub_location_id).first()
    if not sub_location:
        return jsonify({"error": "Invalid new_sub_location_id"}), 400

    # Update the sub-location
    bottle.Sub_Location_ID = new_sub_location_id
    db.session.commit()
    return jsonify({"message": "Location updated"})


@chemicals.route("/api/update_chemical/<int:chemical_id>", methods=["PUT"])
@oidc.require_login
@require_editor
def update_chemical(chemical_id):
    """
    Updates the details of an existing chemical in the database.

    Endpoint:
    PUT /api/update_chemical/<int:chemical_id>

    Args:
    chemical_id (int): The unique identifier of the chemical to be updated.

    Request Body (JSON):
    {
        "chemical_name" (optional, str): The new name of the chemical.
        "chemical_formula" (optional, str): The new formula of the chemical.
        "storage_class_id" (optional, int): The new storage class ID for the chemical.
    }

    Returns:
    Response (JSON):
        - On success:
            {
                "message": "Chemical updated successfully"
            }
            HTTP Status Code: 200
        - On failure (e.g., chemical not found):
            {
                "error": "Chemical not found"
            }
            HTTP Status Code: 404


    """    # Validate the incoming request against the schema`
    data = request.json
    chemical = db.session.query(Chemical).filter_by(Chemical_ID=chemical_id).first()

    if not chemical:
        return jsonify({"error": "Chemical not found"}), 404

    chemical.Chemical_Name = data.get("chemical_name", chemical.Chemical_Name)
    chemical.Chemical_Formula = data.get("chemical_formula", chemical.Chemical_Formula)
    chemical.Storage_Class_ID = data.get("storage_class_id", chemical.Storage_Class_ID)

    db.session.commit()
    return jsonify({"message": "Chemical updated successfully"})


@chemicals.route("/api/delete_chemical/<int:chemical_id>", methods=["DELETE"])
@oidc.require_login
@require_editor
def delete_chemical(chemical_id):
    """
    API Endpoint: Delete a Chemical

    This endpoint allows an authorized user to permanently delete a chemical 
    from the database, along with all related records in the Chemical_Manufacturer 
    and Inventory tables.

    Args:
        chemical_id (int): The ID of the chemical to be deleted.

    Returns:
        Response: A JSON response with a success message and HTTP status 200 
                if the deletion is successful.
                A JSON response with an error message and HTTP status 404 
                if the chemical is not found.

    Database Operations:
        - Queries the Chemical table to find the chemical by its ID.
        - Retrieves all related Chemical_Manufacturer IDs.
        - Deletes all Inventory records associated with the retrieved 
        Chemical_Manufacturer IDs.
        - Deletes all Chemical_Manufacturer records associated with the chemical.
        - Deletes the chemical record itself.
    """
    chemical = db.session.query(Chemical).filter_by(Chemical_ID=chemical_id).first()

    if not chemical:
        return jsonify({"error": "Chemical not found"}), 404

    # Get all related Chemical_Manufacturer IDs
    chemical_manufacturer_ids = db.session.query(Chemical_Manufacturer.Chemical_Manufacturer_ID).filter_by(Chemical_ID=chemical_id).all()

    # Flatten the list of tuples
    chemical_manufacturer_ids = [cm_id[0] for cm_id in chemical_manufacturer_ids]

    # Delete related Inventory records
    db.session.query(Inventory).filter(Inventory.Chemical_Manufacturer_ID.in_(chemical_manufacturer_ids)).delete(synchronize_session=False)

    # Delete related Chemical_Manufacturer records
    db.session.query(Chemical_Manufacturer).filter_by(Chemical_ID=chemical_id).delete(synchronize_session=False)

    # Delete the chemical itself
    db.session.delete(chemical)
    db.session.commit()
    return jsonify({"message": "Chemical deleted successfully"})


@chemicals.route("/api/update_inventory/<int:inventory_id>", methods=["PUT"])
@oidc.require_login
@require_editor
def update_inventory(inventory_id):
    """
    Update an inventory record in the database.
    This endpoint allows an authenticated and authorized user to update an inventory record
    identified by its `inventory_id`. The user must provide the updated data in JSON format.
    Args:
        inventory_id (int): The ID of the inventory record to be updated.
    Request JSON:
        sticker_number (str, optional): The new sticker number for the inventory.
        product_number (str, optional): The new product number for the inventory.
        sub_location_id (int, optional): The new sub-location ID for the inventory.
        manufacturer_id (int, optional): The ID of the new manufacturer for the chemical.
            If provided, a new `Chemical_Manufacturer` record will be created if it does not exist.
    Returns:
        Response: A JSON response indicating the success or failure of the operation.
            - On success: {"message": "Inventory updated successfully"} with HTTP status 200.
            - On failure: {"error": "Inventory not found"} with HTTP status 404.
    Note: 
        Updating product number for a chemical will also update all associated inventory records.
    """
    try:
        data = UpdateInventorySchema().load(request.json)
    except ValidationError as err:
        return jsonify({"error": err.messages}), 400

    inventory = db.session.query(Inventory).filter_by(Inventory_ID=inventory_id).first()
    
    if not inventory:
        return jsonify({"error": "Inventory not found"}), 404

    # Check for duplicate sticker number
    if "sticker_number" in data:
        duplicate_sticker = (
            db.session.query(Inventory)
            .filter(Inventory.Sticker_Number == data["sticker_number"], Inventory.Inventory_ID != inventory_id)
            .first()
        )
        if duplicate_sticker:
            return jsonify({"error": "Sticker number already exists"}), 400

    # Check for duplicate product number
    if "product_number" in data:
        duplicate_product = (
            db.session.query(Inventory)
            .join(Chemical_Manufacturer)
            .filter(
                Inventory.Product_Number == data["product_number"],
                Inventory.Inventory_ID != inventory_id,
                ~(
                    (Chemical_Manufacturer.Chemical_ID == inventory.Chemical_Manufacturer.Chemical_ID) &
                    (Chemical_Manufacturer.Manufacturer_ID == inventory.Chemical_Manufacturer.Manufacturer_ID)
                )
            )
            .first()
        )
        if duplicate_product:
            return jsonify({"error": "Product number already exists for a different chemical or manufacturer"}), 400

    # Update basic fields
    product_number = data.get("product_number", inventory.Product_Number)
    inventory.Product_Number = product_number
    inventory.Sticker_Number = data.get("sticker_number", inventory.Sticker_Number)
    inventory.Sub_Location_ID = data.get("sub_location_id", inventory.Sub_Location_ID)
    
    # Update chemical manufacturer if manufacturer changed
    if "manufacturer_id" in data:
        chemical_id = inventory.Chemical_Manufacturer.Chemical_ID
        manufacturer_id = data["manufacturer_id"]
        
        # Find or create Chemical_Manufacturer record
        chem_man = (
            db.session.query(Chemical_Manufacturer)
            .filter_by(Chemical_ID=chemical_id, Manufacturer_ID=manufacturer_id)
            .first()
        )
        if chem_man and data.get("product_number") is not None and chem_man.Product_Number != data.get("product_number"):
            chem_man.Product_Number = product_number
            # Update all associated inventory records
            db.session.query(Inventory).filter_by(Chemical_Manufacturer_ID=chem_man.Chemical_Manufacturer_ID).update(
                {"Product_Number": product_number}
            )
        
        if not chem_man:
            chem_man = Chemical_Manufacturer(
                Chemical_ID=chemical_id,
                Manufacturer_ID=manufacturer_id,
                Product_Number=product_number
            )
            db.session.add(chem_man)
            db.session.flush()  # Ensure chem_man is persisted before using its ID
        
        inventory.Chemical_Manufacturer_ID = chem_man.Chemical_Manufacturer_ID
        inventory.Chemical_Manufacturer_ID = chem_man.Chemical_Manufacturer_ID
    
    # Update timestamp and user
    inventory.Last_Updated = datetime.now()
    inventory.Who_Updated = session["oidc_auth_profile"].get("preferred_username")
    
    db.session.commit()
    return jsonify({"message": "Inventory updated successfully"})