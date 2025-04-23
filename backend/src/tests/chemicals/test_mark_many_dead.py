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
    sticker_numbers = [bottle.Sticker_Number for bottle in bottles]
    
    # Act: Send the request to mark the items as dead
    response = client.post(
        "/api/chemicals/mark_many_dead",
        data=json.dumps({"sub_location_id": sub_location.Sub_Location_ID, "sticker_numbers": sticker_numbers}),
        content_type="application/json",
    )

    # Assert: Check the response and database state
    assert response.status_code == 200
    data = response.json
    assert "message" in data and f"{len(sticker_numbers)} chemicals marked as dead" in data["message"]

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
        data=json.dumps({"sub_location_id": 9999, "sticker_numbers": [1001, 1002]}),  # Non-existent sub_location_id
        content_type="application/json",
    )
    assert response.status_code == 400
    data = response.json
    assert data ==  {'error': 'Some sticker numbers are not in the specified sub-location'}

def test_mark_many_dead_invalid_inventory_ids(client):
    """
    Test that the API returns an error when invalid sticker numbers are provided.
    """
    sub_location = db.session.query(Sub_Location).filter_by(Sub_Location_Name="Shelf A").first()
    response = client.post(
        "/api/chemicals/mark_many_dead",
        data=json.dumps({"sub_location_id": sub_location.Sub_Location_ID, "sticker_numbers": [9999, 8888]}),  # Non-existent sticker numbers
        content_type="application/json",
    )
    assert response.status_code == 400
    data = response.json
    assert data == {'error': 'Some sticker numbers are not in the specified sub-location'}

def test_mark_many_dead_mismatched_sublocation(client):
    """
    Test that the API ignores sticker numbers that do not belong to the given sublocation.
    """
    sub_location = db.session.query(Sub_Location).filter_by(Sub_Location_Name="Shelf A").first()
    mismatched_bottle = db.session.query(Inventory).filter(Inventory.Sub_Location_ID != sub_location.Sub_Location_ID).first()

    response = client.post(
        "/api/chemicals/mark_many_dead",
        data=json.dumps({"sub_location_id": sub_location.Sub_Location_ID, "sticker_numbers": [mismatched_bottle.Sticker_Number]}),
        content_type="application/json",
    )
    assert response.status_code == 400
    data = response.json
    assert data == {'error': 'Some sticker numbers are not in the specified sub-location'}

def test_mark_many_dead_already_dead(client):
    """
    Test marking inventory items that are already marked as dead.
    The API should treat this as a success since the end state is what was requested.
    """
    sub_location = db.session.query(Sub_Location).filter_by(Sub_Location_Name="Shelf A").first()
    dead_bottle = db.session.query(Inventory).filter_by(Sub_Location_ID=sub_location.Sub_Location_ID, Is_Dead=True).first()

    response = client.post(
        "/api/chemicals/mark_many_dead",
        data=json.dumps({"sub_location_id": sub_location.Sub_Location_ID, "sticker_numbers": [dead_bottle.Sticker_Number]}),
        content_type="application/json",
    )
    assert response.status_code == 200
    data = response.json
    assert "message" in data
    
    # Verify the bottle is still dead
    db.session.refresh(dead_bottle)
    assert dead_bottle.Is_Dead

def test_mark_many_dead_partial_success(client):
    """
    Test marking a mix of valid and invalid sticker numbers.
    """
    sub_location = db.session.query(Sub_Location).filter_by(Sub_Location_Name="Shelf A").first()
    valid_bottle = db.session.query(Inventory).filter_by(Sub_Location_ID=sub_location.Sub_Location_ID, Is_Dead=False).first()
    invalid_id = 9999  # Non-existent inventory ID

    response = client.post(
        "/api/chemicals/mark_many_dead",
        data=json.dumps({"sub_location_id": sub_location.Sub_Location_ID, "sticker_numbers": [valid_bottle.Inventory_ID, invalid_id]}),
        content_type="application/json",
    )
    assert response.status_code == 400
    data = response.json
    assert data == {"error": "Some sticker numbers are not in the specified sub-location"}

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
    assert data == {"error": {"sticker_numbers": ["Missing data for required field."], "sub_location_id": ["Missing data for required field."]}}

    # Verify no changes in the database
    bottles = db.session.query(Inventory).all()
    for bottle in bottles:
        original_state = bottle.Is_Dead
        db.session.refresh(bottle)
        assert bottle.Is_Dead == original_state

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
