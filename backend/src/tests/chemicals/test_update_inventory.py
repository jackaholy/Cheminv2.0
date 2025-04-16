from database import db
from models import Inventory, Chemical_Manufacturer
import json


def test_update_inventory_success(client):
    """
    Test updating an inventory record with valid data.
    """
    # Arrange: Get an existing inventory record
    inventory = db.session.query(Inventory).first()
    assert inventory is not None

    new_sticker_number = "NEW12345"
    new_product_number = "NEW-PROD-001"

    # Act: Send the update request
    response = client.put(
        f"/api/update_inventory/{inventory.Inventory_ID}",
        data=json.dumps({
            "sticker_number": new_sticker_number,
            "product_number": new_product_number
        }),
        content_type="application/json",
    )

    # Assert: Check the response and database state
    assert response.status_code == 200
    data = response.json
    assert data == {"message": "Inventory updated successfully"}

    db.session.refresh(inventory)
    assert inventory.Sticker_Number == new_sticker_number
    assert inventory.Product_Number == new_product_number


def test_update_inventory_invalid_inventory_id(client):
    """
    Test updating an inventory record with an invalid inventory ID.
    """
    # Act: Send the update request with a non-existent inventory ID
    response = client.put(
        "/api/update_inventory/9999",
        data=json.dumps({"sticker_number": "INVALID123"}),
        content_type="application/json",
    )

    # Assert: Check the response
    assert response.status_code == 404
    data = response.json
    assert data == {"error": "Inventory not found"}


def test_update_inventory_missing_payload(client):
    """
    Test updating an inventory record with no payload.
    """
    # Arrange: Get an existing inventory record
    inventory = db.session.query(Inventory).first()
    assert inventory is not None
    original_sticker_number = inventory.Sticker_Number
    original_product_number = inventory.Product_Number

    # Act: Send the update request with no payload
    response = client.put(
        f"/api/update_inventory/{inventory.Inventory_ID}",
        data=json.dumps({}),
        content_type="application/json",
    )

    # Assert: Check the response
    assert response.status_code == 200
    data = response.json

    # Verify the inventory record has not been modified
    db.session.refresh(inventory)
    assert inventory.Sticker_Number == original_sticker_number
    assert inventory.Product_Number == original_product_number


def test_update_inventory_change_manufacturer(client):
    """
    Test updating the manufacturer of an inventory record.
    """
    # Arrange: Get an existing inventory record and a different manufacturer
    inventory = db.session.query(Inventory).first()
    assert inventory is not None

    new_manufacturer_id = (
        db.session.query(Chemical_Manufacturer.Manufacturer_ID)
        .filter(Chemical_Manufacturer.Manufacturer_ID != inventory.Chemical_Manufacturer.Manufacturer_ID)
        .first()
    )
    assert new_manufacturer_id is not None

    # Act: Send the update request
    response = client.put(
        f"/api/update_inventory/{inventory.Inventory_ID}",
        data=json.dumps({"manufacturer_id": new_manufacturer_id[0]}),
        content_type="application/json",
    )

    # Assert: Check the response and database state
    assert response.status_code == 200
    data = response.json
    assert data == {"message": "Inventory updated successfully"}

    db.session.refresh(inventory)
    assert inventory.Chemical_Manufacturer.Manufacturer_ID == new_manufacturer_id[0]


def test_update_inventory_non_integer_inventory_id(client):
    """
    Test updating an inventory record with a non-integer inventory ID.
    """
    # Act: Send the update request with a non-integer inventory ID
    response = client.put(
        "/api/update_inventory/not_an_integer",
        data=json.dumps({"sticker_number": "INVALID123"}),
        content_type="application/json",
    )

    # Assert: Check the response
    assert response.status_code == 405


def test_update_inventory_duplicate_sticker_number(client):
    """
    Test updating an inventory record with a duplicate sticker number.
    """
    # Arrange: Get two existing inventory records
    inventory1 = db.session.query(Inventory).first()
    inventory2 = db.session.query(Inventory).filter(Inventory.Inventory_ID != inventory1.Inventory_ID).first()
    assert inventory1 is not None
    assert inventory2 is not None

    # Act: Send the update request with a duplicate sticker number
    response = client.put(
        f"/api/update_inventory/{inventory1.Inventory_ID}",
        data=json.dumps({"sticker_number": inventory2.Sticker_Number}),
        content_type="application/json",
    )

    # Assert: Check the response
    assert response.status_code == 400
    data = response.json
    assert "error" in data


def test_update_inventory_no_changes(client):
    """
    Test updating an inventory record without making any changes.
    """
    # Arrange: Get an existing inventory record
    inventory = db.session.query(Inventory).first()
    assert inventory is not None

    # Act: Send the update request with the same data
    response = client.put(
        f"/api/update_inventory/{inventory.Inventory_ID}",
        data=json.dumps({
            "sticker_number": inventory.Sticker_Number,
            "product_number": inventory.Product_Number,
            "sub_location_id": inventory.Sub_Location_ID
        }),
        content_type="application/json",
    )

    # Assert: Check the response
    assert response.status_code == 200
    data = response.json
    assert data == {"message": "Inventory updated successfully"}
