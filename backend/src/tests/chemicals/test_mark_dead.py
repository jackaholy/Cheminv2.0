from database import db
from models import Inventory
import json

def test_mark_dead_success(client):
    """
    Test marking a valid inventory item as dead.
    """
    # Arrange: Ensure the inventory item exists and is alive
    inventory_id = 1001  # Example ID for an alive inventory item
    bottle = db.session.query(Inventory).filter_by(Inventory_ID=inventory_id).first()
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
    assert bottle.Is_Dead

def test_mark_dead_missing_inventory_id(client):
    """
    Test that the API returns an error when inventory_id is missing.
    """
    response = client.post(
        "/api/chemicals/mark_dead",
        data=json.dumps({}),  # No inventory_id provided
        content_type="application/json",
    )
    assert response.status_code == 400
    data = response.json
    assert "error" in data and data["error"] == "Missing inventory_id"

def test_mark_dead_invalid_inventory_id(client):
    """
    Test that the API returns an error when an invalid inventory_id is provided.
    """
    response = client.post(
        "/api/chemicals/mark_dead",
        data=json.dumps({"inventory_id": 9999}),  # Non-existent inventory_id
        content_type="application/json",
    )
    assert response.status_code == 400
    data = response.json
    assert "error" in data and data["error"] == "Invalid inventory_id"

def test_mark_dead_already_dead(client):
    """
    Test marking an inventory item that is already marked as dead.
    """
    # Arrange: Ensure the inventory item exists and is already dead
    inventory_id = 1002  # Example ID for a dead inventory item
    bottle = db.session.query(Inventory).filter_by(Inventory_ID=inventory_id).first()
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
    assert bottle.Is_Dead

def test_mark_dead_invalid_payload_type(client):
    """
    Test that the API returns an error when the payload is not a valid JSON object.
    """
    response = client.post(
        "/api/chemicals/mark_dead",
        data="invalid_payload",  # Not a JSON object
        content_type="application/json",
    )
    assert response.status_code == 400

def test_mark_dead_non_integer_inventory_id(client):
    """
    Test that the API returns an error when inventory_id is not an integer.
    """
    response = client.post(
        "/api/chemicals/mark_dead",
        data=json.dumps({"inventory_id": "not_an_integer"}),  # Invalid type
        content_type="application/json",
    )
    assert response.status_code == 400
    data = response.json
    assert "error" in data and data["error"] == "Invalid inventory_id"

def test_mark_dead_no_authentication(client):
    """
    Test that the API returns an error when the user is not authenticated.
    """
    # Simulate an unauthenticated request
    client.logout()  # Assuming a logout method exists in the test client
    response = client.post(
        "/api/chemicals/mark_dead",
        data=json.dumps({"inventory_id": 1001}),
        content_type="application/json",
    )
    assert response.status_code == 401  # Unauthorized

def test_mark_dead_no_editor_permissions(client):
    """
    Test that the API returns an error when the user does not have editor permissions.
    """
    # Simulate a user with insufficient permissions
    client.login_as_visitor()  # Assuming a method to log in as a visitor
    response = client.post(
        "/api/chemicals/mark_dead",
        data=json.dumps({"inventory_id": 1001}),
        content_type="application/json",
    )
    assert response.status_code == 403  # Forbidden
