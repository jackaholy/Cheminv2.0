import pytest
from datetime import date
from models import Chemical, Storage_Class, Inventory, Sub_Location, Location, Chemical_Manufacturer, Manufacturer
from database import db
import json

def test_get_chemicals(client):
    # Send GET request to the API endpoint
    response = client.get("/api/get_chemicals")

    # Assert the response status code
    assert response.status_code == 200

    # Parse the JSON response
    data = response.json

    # Assert the number of chemicals returned
    assert len(data) == 11

    # Check one of the chemicals for expected values
    acetone = next((chem for chem in data if chem["chemical_name"] == "Acetone"), None)
    assert acetone is not None
    assert acetone["formula"] == "C3H6O"
    assert acetone["quantity"] == 1
    assert acetone["storage_class"] == "Flammable"
    assert len(acetone["inventory"]) == 2
    assert any(item["dead"] is False for item in acetone["inventory"])

    # Check a chemical with no inventory
    silver_nitrate = next((chem for chem in data if chem["chemical_name"] == "Silver Nitrate"), None)
    assert silver_nitrate is not None
    assert silver_nitrate["quantity"] == 0
    assert silver_nitrate["inventory"] == []

    # Check for correct classification
    corrosives = [chem for chem in data if chem["storage_class"] == "Corrosive"]
    assert any(chem["chemical_name"] == "Sulfuric Acid" for chem in corrosives)
    assert any(chem["chemical_name"] == "Sodium Hydroxide" for chem in corrosives)
    assert any(chem["chemical_name"] == "Hydrochloric Acid" for chem in corrosives)

    # Check that all chemicals have a formula
    assert all("formula" in chem and chem["formula"] for chem in data)

    # Ensure that no inventory item with dead=True is counted in quantity
    for chem in data:
        live_items = [inv for inv in chem["inventory"] if not inv["dead"]]
        assert len(live_items) == chem["quantity"]

def test_get_storage_classes(client):
    # Send GET request to the API endpoint
    response = client.get("/api/storage_classes")

    # Assert the response status code
    assert response.status_code == 200

    # Parse the JSON response
    data = response.json
        # Assert all expected storage classes are present
    storage_classes = response.json
    assert len(storage_classes) == 6

    # Assert specific storage classes by name and ID
    assert any(sc["id"] == 1 and sc["name"] == "Flammable" for sc in storage_classes)
    assert any(sc["id"] == 2 and sc["name"] == "Corrosive" for sc in storage_classes)
    assert any(sc["id"] == 3 and sc["name"] == "Toxic" for sc in storage_classes)
    assert any(sc["id"] == 4 and sc["name"] == "Reactive" for sc in storage_classes)
    assert any(sc["id"] == 5 and sc["name"] == "Oxidizer" for sc in storage_classes)
    assert any(sc["id"] == 6 and sc["name"] == "Unclassified" for sc in storage_classes)

    # Ensure all storage classes have non-empty names
    assert all("name" in sc and sc["name"] for sc in storage_classes)

    # Ensure IDs are unique
    ids = [sc["id"] for sc in storage_classes]
    assert len(ids) == len(set(ids))


def test_add_bottle_success(client):
    """
    Test posting valid data to the /api/add_bottle endpoint.
    This test assumes:
     - The Chemical_Manufacturer association does not already exist for the given chemical_id and manufacturer_id.
     - The msds field is truthy, which triggers get_msds_url().
    """

    payload = {
        "sticker_number": 1005,
        "chemical_id": 1,
        "manufacturer_id": 1,
        "location_id": 1,
        "sub_location_id": 101,
        "product_number": "A123",
        "msds": True
    }

    response = client.post("/api/add_bottle", 
                           data=json.dumps(payload),
                           content_type="application/json")
    # Expecting a 200 status code and a successful result message.
    assert response.status_code == 200
    data = response.json
    assert "message" in data and data["message"] == "Bottle added successfully"
    assert "inventory_id" in data
    # At this point the inventory_id should be an integer.
    assert isinstance(data["inventory_id"], int)

def test_add_bottle_missing_required_field(client):
    """
    Test that missing required fields (e.g., chemical_id) causes an error.
    Note: The current implementation does not explicitly validate input, so this
    test is expected to fail until validations are added.
    """

    # Do not send 'chemical_id'
    payload = {
        "sticker_number": 1006,
        # "chemical_id": 1,  # intentionally omitted
        "manufacturer_id": 1,
        "location_id": 1,
        "sub_location_id": 102,
        "product_number": "A124",
        "msds": False
    }

    response = client.post("/api/add_bottle",
                           data=json.dumps(payload),
                           content_type="application/json")
    # Depending on how the error is handled in the future, you might expect a 400 response.
    # For now, if the code crashes or returns a different status, adjust the expected value.
    assert response.status_code == 400, "Should return 400 for missing required fields"

def test_add_bottle_invalid_types(client):
    """
    Test that sending data with invalid types (e.g., a non-numeric sticker_number)
    fails. 
    """

    payload = {
        "sticker_number": "not_a_number",
        "chemical_id": 1,
        "manufacturer_id": 1,
        "location_id": 1,
        "sub_location_id": 103,
        "product_number": "A125",
        "msds": True
    }

    response = client.post("/api/add_bottle",
                           data=json.dumps(payload),
                           content_type="application/json")
    # Expecting a 400 error response due to invalid type.
    assert response.status_code == 400, "Should return 400 for invalid input types"
