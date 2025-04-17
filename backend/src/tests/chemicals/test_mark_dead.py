from database import db
from models import Inventory
import json

def test_mark_dead_success(client):
    """
    Test marking a valid inventory item as dead.
    """
    # Arrange: Ensure the inventory item exists and is alive
    bottle = db.session.query(Inventory).first()
    inventory_id = bottle.Inventory_ID
    assert bottle is not None
    assert not bottle.Is_Dead

    # Act: Send the request to mark the item as dead
    response = client.post(
        "/api/chemicals/mark_dead",
        data=json.dumps({"inventory_id": inventory_id}),
        content_type="application/json",
    )

    # Assert: Check the response and database state
    assert response.status_code == 200
    data = response.json
    assert "message" in data and data["message"] == "Chemical marked as dead"

    # Verify the database state
    db.session.refresh(bottle)
    assert bottle.Is_Dead  # Deadness should take effect

def test_mark_dead_missing_inventory_id(client):
    """
    Test that the API returns an error when inventory_id is missing.
    """
    # Arrange: Ensure the initial state of the database
    bottle = db.session.query(Inventory).first()
    initial_is_dead = bottle.Is_Dead

    # Act: Send the request without inventory_id
    response = client.post(
        "/api/chemicals/mark_dead",
        data=json.dumps({}),  # No inventory_id provided
        content_type="application/json",
    )

    # Assert: Check the response and database state
    assert response.status_code == 400
    data = response.json
    assert "error" in data and data["error"] == "Missing inventory_id"

    # Verify the database state remains unchanged
    db.session.refresh(bottle)
    assert bottle.Is_Dead == initial_is_dead

def test_mark_dead_invalid_inventory_id(client):
    """
    Test that the API returns an error when an invalid inventory_id is provided.
    """

    # Act: Send the request with an invalid inventory_id
    response = client.post(
        "/api/chemicals/mark_dead",
        data=json.dumps({"inventory_id": 9999}),  # Non-existent inventory_id
        content_type="application/json",
    )

    # Assert: Check the response and database state
    assert response.status_code == 404
    data = response.json
    assert data == {'error': 'Bottle not found'}


def test_mark_dead_already_dead(client):
    """
    Test marking an inventory item that is already marked as dead.
    """
    # Arrange: Ensure the inventory item exists and is already dead
    bottle = db.session.query(Inventory).filter_by(Is_Dead=True).first()
    inventory_id = bottle.Inventory_ID
    assert bottle is not None
    assert bottle.Is_Dead

    # Act: Send the request to mark the item as dead again
    response = client.post(
        "/api/chemicals/mark_dead",
        data=json.dumps({"inventory_id": inventory_id}),
        content_type="application/json",
    )

    # Assert: Check the response and database state
    assert response.status_code == 200
    data = response.json
    assert "message" in data and data["message"] == "Chemical marked as dead"

    # Verify the database state remains unchanged
    db.session.refresh(bottle)
    assert bottle.Is_Dead  # Deadness should remain unchanged

def test_mark_dead_invalid_payload_type(client):
    """
    Test that the API returns an error when the payload is not a valid JSON object.
    """
    # Arrange: Ensure the initial state of the database
    bottle = db.session.query(Inventory).first()
    initial_is_dead = bottle.Is_Dead

    # Act: Send the request with an invalid payload
    response = client.post(
        "/api/chemicals/mark_dead",
        data="invalid_payload",  # Not a JSON object
        content_type="application/json",
    )

    # Assert: Check the response and database state
    assert response.status_code == 400

    # Verify the database state remains unchanged
    db.session.refresh(bottle)
    assert bottle.Is_Dead == initial_is_dead

def test_mark_dead_non_integer_inventory_id(client):
    """
    Test that the API returns an error when inventory_id is not an integer.
    """
    # Arrange: Ensure the initial state of the database
    bottle = db.session.query(Inventory).first()
    initial_is_dead = bottle.Is_Dead

    # Act: Send the request with a non-integer inventory_id
    response = client.post(
        "/api/chemicals/mark_dead",
        data=json.dumps({"inventory_id": "not_an_integer"}),  # Invalid type
        content_type="application/json",
    )

    # Assert: Check the response and database state
    assert response.status_code == 400
    data = response.json
    assert "error" in data and data["error"] == "Invalid inventory_id"

    # Verify the database state remains unchanged
    db.session.refresh(bottle)
    assert bottle.Is_Dead == initial_is_dead
