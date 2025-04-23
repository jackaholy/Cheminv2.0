from database import db
from models import Inventory, Sub_Location
import json


def test_update_location_success(client):
    """
    Test updating the location of a valid inventory item.
    """
    # Arrange: Ensure the inventory item and sub-location exist
    bottle = db.session.query(Inventory).first()
    new_sub_location = db.session.query(Sub_Location).filter(Sub_Location.Sub_Location_ID != bottle.Sub_Location_ID).first()
    assert bottle is not None
    assert new_sub_location is not None

    # Act: Send the request to update the location
    response = client.post(
        "/api/chemicals/update_chemical_location",
        data=json.dumps({
            "inventory_id": bottle.Inventory_ID,
            "new_sub_location_id": new_sub_location.Sub_Location_ID
        }),
        content_type="application/json",
    )

    # Assert: Check the response and database state
    assert response.status_code == 200
    data = response.json
    assert data =={'message': 'Location updated'} # Updated assertion

    # Verify the database state
    db.session.refresh(bottle)
    assert bottle.Sub_Location_ID == new_sub_location.Sub_Location_ID


def test_update_location_missing_inventory_id(client):
    """
    Test that the API returns an error when inventory_id is missing.
    """
    # Act: Send the request without inventory_id
    response = client.post(
        "/api/chemicals/update_chemical_location",
        data=json.dumps({"new_sub_location_id": 1}),
        content_type="application/json",
    )

    # Assert: Check the response
    assert response.status_code == 400
    data = response.json
    assert data == {'error': 'Invalid inventory_id'}


def test_update_location_missing_sub_location_id(client):
    """
    Test that the API returns an error when new_sub_location_id is missing.
    """
    # Arrange: Ensure the inventory item exists
    bottle = db.session.query(Inventory).first()
    assert bottle is not None

    # Act: Send the request without new_sub_location_id
    response = client.post(
        "/api/chemicals/update_chemical_location",
        data=json.dumps({"inventory_id": bottle.Inventory_ID}),
        content_type="application/json",
    )

    # Assert: Check the response
    assert response.status_code == 400
    data = response.json
    assert data == {'error': 'Invalid new_sub_location_id'}


def test_update_location_invalid_inventory_id(client):
    """
    Test that the API returns an error when an invalid inventory_id is provided.
    """
    # Act: Send the request with a non-existent inventory_id
    response = client.post(
        "/api/chemicals/update_chemical_location",
        data=json.dumps({"inventory_id": 9999, "new_sub_location_id": 1}),
        content_type="application/json",
    )

    # Assert: Check the response
    assert response.status_code == 400
    data = response.json
    assert data == {'error': 'Invalid inventory_id'}


def test_update_location_invalid_sub_location_id(client):
    """
    Test that the API returns an error when an invalid new_sub_location_id is provided.
    """
    # Arrange: Ensure the inventory item exists
    bottle = db.session.query(Inventory).first()
    assert bottle is not None

    # Act: Send the request with a non-existent new_sub_location_id
    response = client.post(
        "/api/chemicals/update_chemical_location",
        data=json.dumps({"inventory_id": bottle.Inventory_ID, "new_sub_location_id": 9999}),
        content_type="application/json",
    )

    # Assert: Check the response
    assert response.status_code == 400
    data = response.json
    assert data ==  {'error': 'Invalid new_sub_location_id'}


def test_update_location_same_sub_location(client):
    """
    Test updating the location to the same sub-location.
    """
    # Arrange: Ensure the inventory item exists
    bottle = db.session.query(Inventory).first()
    assert bottle is not None

    # Act: Send the request to update the location to the same sub-location
    response = client.post(
        "/api/chemicals/update_chemical_location",
        data=json.dumps({
            "inventory_id": bottle.Inventory_ID,
            "new_sub_location_id": bottle.Sub_Location_ID
        }),
        content_type="application/json",
    )

    # Assert: Check the response
    assert response.status_code == 200
    data = response.json
    assert "message" in data and data["message"] == "Location updated"

    # Verify the database state remains unchanged
    db.session.refresh(bottle)
    assert bottle.Sub_Location_ID == bottle.Sub_Location_ID


def test_update_location_invalid_payload_type(client):
    """
    Test that the API returns an error when the payload is not a valid JSON object.
    """
    # Act: Send the request with an invalid payload
    response = client.post(
        "/api/chemicals/update_chemical_location",
        data="invalid_payload",  # Not a JSON object
        content_type="application/json",
    )

    # Assert: Check the response
    assert response.status_code == 400


def test_update_location_non_integer_ids(client):
    """
    Test that the API returns an error when inventory_id or new_sub_location_id is not an integer.
    """
    # Act: Send the request with non-integer IDs
    response = client.post(
        "/api/chemicals/update_chemical_location",
        data=json.dumps({"inventory_id": "not_an_integer", "new_sub_location_id": "also_not_an_integer"}),
        content_type="application/json",
    )

    # Assert: Check the response
    assert response.status_code == 400
    data = response.json
    assert data == {'error': 'Invalid inventory_id'}
