from database import db
from models import Inventory, Chemical_Manufacturer
import json
from datetime import datetime, timedelta
from database import db

def test_add_bottle_success(client):
    """
    Test a valid call to /api/add_bottle.
    This test checks:
      - API returns 200 with proper message and inventory_id.
      - Inventory record is created in the database with the correct values.
      - The Chemical_Manufacturer association is created if not already existing.
      - `msds` field processing works as expected for a truthy value.
      - The updated_by field contains the preferred_username.
      - The Last_Updated timestamp is recent.
    """
    payload = {
        "sticker_number": 1005,
        "chemical_id": 1,
        "manufacturer_id": 1,
        "sub_location_id": 1,
        "product_number": "A123",
        "msds": True
    }

    # Count existing Chemical_Manufacturer associations before the call
    previous_assoc = db.session.query(Chemical_Manufacturer).filter_by(
        Chemical_ID=payload["chemical_id"],
        Manufacturer_ID=payload["manufacturer_id"]
    ).count()

    response = client.post("/api/add_bottle", 
                           data=json.dumps(payload),
                           content_type="application/json")
    # Expect a 200 response
    assert response.status_code == 200
    data = response.json
    assert "message" in data and data["message"] == "Bottle added successfully"
    assert "inventory_id" in data
    inventory_id = data["inventory_id"]
    assert isinstance(inventory_id, int)

    # Verify that the inventory record exists in the database
    inv = db.session.query(Inventory).filter_by(Inventory_ID=inventory_id).first()
    assert inv is not None
    assert inv.Sticker_Number == payload["sticker_number"]
    # The product number should match
    assert inv.Product_Number == payload["product_number"]
    # Sub_Location_ID should match
    assert inv.Sub_Location_ID == payload["sub_location_id"]
    # The "Who_Updated" field should match the logged-in username
    assert inv.Who_Updated == "anne-admin@example.com"
    # Since msds is True, we expect that get_msds_url() was triggered and returned a non-null value
    assert inv.MSDS is not None

    # The Last_Updated timestamp should be recent (within the last minute)
    now = datetime.now().date()
    assert now - inv.Last_Updated < timedelta(minutes=1)

    # Verify that the Chemical_Manufacturer association exists or was created
    assoc = db.session.query(Chemical_Manufacturer).filter_by(
        Chemical_ID=payload["chemical_id"],
        Manufacturer_ID=payload["manufacturer_id"]
    ).first()
    assert assoc is not None
    # If there was no previous association, the new one should now be in place
    new_assoc_count = db.session.query(Chemical_Manufacturer).filter_by(
        Chemical_ID=payload["chemical_id"],
        Manufacturer_ID=payload["manufacturer_id"]
    ).count()
    assert new_assoc_count == previous_assoc + 1 or new_assoc_count == previous_assoc

    # Verify that the Inventory record references the correct Chemical_Manufacturer_ID
    assert inv.Chemical_Manufacturer_ID == assoc.Chemical_Manufacturer_ID

def test_add_bottle_no_msds(client):
    """
    Test posting data with msds flag as False.
    This should create an Inventory record with msds set to None.
    """
    payload = {
        "sticker_number": 1010,
        "chemical_id": 3,
        "manufacturer_id": 1,
        "sub_location_id": 2,
        "product_number": "E002",
        "msds": False
    }
    response = client.post("/api/add_bottle", 
                           data=json.dumps(payload),
                           content_type="application/json")
    assert response.status_code == 200
    data = response.json
    inventory_id = data["inventory_id"]
    inv = db.session.query(Inventory).filter_by(Inventory_ID=inventory_id).first()
    assert inv is not None
    # Since msds is False, we expect msds to be None.
    assert inv.MSDS is None

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
        "sub_location_id": 1,
        "product_number": "A124",
        "msds": False
    }
    response = client.post("/api/add_bottle",
                           data=json.dumps(payload),
                           content_type="application/json")
    # Expect a 400 error response due to missing required field; adjust as needed.
    assert response.status_code == 400, "Should return 400 for missing required fields"

def test_add_bottle_invalid_types(client):
    """
    Test that sending data with invalid types (e.g., a non-numeric sticker_number)
    fails. This test assumes the backend will eventually validate input types.
    """
    payload = {
        "sticker_number": "not_a_number",
        "chemical_id": 1,
        "manufacturer_id": 1,
        "sub_location_id": 1,
        "product_number": "A125",
        "msds": True
    }
    response = client.post("/api/add_bottle",
                           data=json.dumps(payload),
                           content_type="application/json")
    # Expecting a 400 error response due to an invalid type.
    assert response.status_code == 400, "Should return 400 for invalid input types"

def test_add_bottle_duplicate_sticker_number(client):
    """
    Test that the endpoint returns an error when attempting to add a bottle with a sticker number
    that is already assigned to an existing Inventory record.
    """
    # Define a payload with a unique sticker number
    payload = {
        "sticker_number": 14564,  # example sticker number
        "chemical_id": 1,
        "manufacturer_id": 1,
        "sub_location_id": 2,
        "product_number": "W001",
        "msds": False
    }
    
    # First, add a bottle with the given sticker number
    response1 = client.post("/api/add_bottle", 
                            data=json.dumps(payload),
                            content_type="application/json")
                            
    assert response1.status_code == 200, "Initial bottle add should succeed"
    
    # Attempt to add another bottle with the same sticker number
    response2 = client.post("/api/add_bottle",
                            data=json.dumps(payload),
                            content_type="application/json")
    # The API should now return an error status (e.g., 400) due to a duplicate sticker number.
    assert response2.status_code == 400, "Should return 400 when the sticker number is already taken"
