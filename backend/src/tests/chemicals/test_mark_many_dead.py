from database import db
from models import Inventory, Sub_Location
import json

def test_mark_many_dead_success(client):
    """
    Test marking multiple valid inventory items as dead.
    """
    # Arrange: Get a valid sublocation and inventory items
    sub_location = db.session.query(Sub_Location).filter_by(Sub_Location_Name="Shelf A").first()
    bottles = db.session.query(Inventory).filter_by(Sub_Location_ID=sub_location.Sub_Location_ID, Is_Dead=False).limit(2).all()
    inventory_ids = [bottle.Sticker_Number for bottle in bottles]

    # Act: Send the request to mark the items as dead
    response = client.post(
        "/api/chemicals/mark_many_dead",
        data=json.dumps({"sub_location_id": sub_location.Sub_Location_ID, "inventory_id": inventory_ids}),
        content_type="application/json",
    )

    # Assert: Check the response and database state
    assert response.status_code == 200
    data = response.json
    assert "message" in data and f"{len(inventory_ids)} chemicals marked as dead" in data["message"]

    # Verify the database state
    for bottle in bottles:
        db.session.refresh(bottle)
        assert bottle.Is_Dead

def test_mark_many_dead_invalid_sublocation(client):
    """
    Test that the API returns an error when an invalid sub_location_id is provided.
    """
    response = client.post(
        "/api/chemicals/mark_many_dead",
        data=json.dumps({"sub_location_id": 9999, "inventory_id": [1001, 1002]}),  # Non-existent sub_location_id
        content_type="application/json",
    )
    assert response.status_code == 400
    data = response.json
    assert "error" in data and "Missing or invalid sub_location_id" in data["error"]

def test_mark_many_dead_invalid_inventory_ids(client):
    """
    Test that the API returns an error when invalid inventory IDs are provided.
    """
    sub_location = db.session.query(Sub_Location).filter_by(Sub_Location_Name="Shelf A").first()
    response = client.post(
        "/api/chemicals/mark_many_dead",
        data=json.dumps({"sub_location_id": sub_location.Sub_Location_ID, "inventory_id": [9999, 8888]}),  # Non-existent inventory IDs
        content_type="application/json",
    )
    assert response.status_code == 400
    data = response.json
    assert "error" in data and "No chemicals marked as dead" in data["error"]

def test_mark_many_dead_mismatched_sublocation(client):
    """
    Test that the API ignores inventory IDs that do not belong to the given sublocation.
    """
    sub_location = db.session.query(Sub_Location).filter_by(Sub_Location_Name="Shelf A").first()
    mismatched_bottle = db.session.query(Inventory).filter(Inventory.Sub_Location_ID != sub_location.Sub_Location_ID).first()

    response = client.post(
        "/api/chemicals/mark_many_dead",
        data=json.dumps({"sub_location_id": sub_location.Sub_Location_ID, "inventory_id": [mismatched_bottle.Sticker_Number]}),
        content_type="application/json",
    )
    assert response.status_code == 400
    data = response.json
    assert "error" in data and "No chemicals marked as dead" in data["error"]

def test_mark_many_dead_already_dead(client):
    """
    Test marking inventory items that are already marked as dead.
    """
    sub_location = db.session.query(Sub_Location).filter_by(Sub_Location_Name="Shelf A").first()
    dead_bottle = db.session.query(Inventory).filter_by(Sub_Location_ID=sub_location.Sub_Location_ID, Is_Dead=True).first()

    response = client.post(
        "/api/chemicals/mark_many_dead",
        data=json.dumps({"sub_location_id": sub_location.Sub_Location_ID, "inventory_id": [dead_bottle.Sticker_Number]}),
        content_type="application/json",
    )
    assert response.status_code == 400
    data = response.json
    assert "error" in data and "No chemicals marked as dead" in data["error"]

def test_mark_many_dead_partial_success(client):
    """
    Test marking a mix of valid and invalid inventory IDs.
    """
    sub_location = db.session.query(Sub_Location).filter_by(Sub_Location_Name="Shelf A").first()
    valid_bottle = db.session.query(Inventory).filter_by(Sub_Location_ID=sub_location.Sub_Location_ID, Is_Dead=False).first()
    invalid_id = 9999  # Non-existent inventory ID

    response = client.post(
        "/api/chemicals/mark_many_dead",
        data=json.dumps({"sub_location_id": sub_location.Sub_Location_ID, "inventory_id": [valid_bottle.Sticker_Number, invalid_id]}),
        content_type="application/json",
    )
    assert response.status_code == 400
    data = response.json
    assert "error" in data and "No chemicals marked as dead" in data["error"]

    # Verify the valid bottle is still alive
    db.session.refresh(valid_bottle)
    assert not valid_bottle.Is_Dead

def test_mark_many_dead_missing_payload(client):
    """
    Test that the API returns an error when the payload is missing.
    """
    response = client.post(
        "/api/chemicals/mark_many_dead",
        data=json.dumps({}),  # Empty payload
        content_type="application/json",
    )
    assert response.status_code == 400
    data = response.json
    assert "error" in data and "Missing or invalid sub_location_id" in data["error"]

def test_mark_many_dead_invalid_payload_format(client):
    """
    Test that the API returns an error when the payload format is invalid.
    """
    response = client.post(
        "/api/chemicals/mark_many_dead",
        data="invalid_payload",  # Not a JSON object
        content_type="application/json",
    )
    assert response.status_code == 400
