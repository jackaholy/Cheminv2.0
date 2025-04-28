from database import db
from models import Inventory
import json


def test_get_msds_url(client):
    """
    Test retrieving a random MSDS URL.
    """
    # Act: Send the GET request
    response = client.get("/api/get_msds_url")

    # Assert: Check the response
    assert response.status_code == 200
    data = response.json
    assert "url" in data
    assert data["url"] != ""  # Ensure a non-empty URL is returned


def test_set_msds_url(client):
    """
    Test setting a new MSDS URL for all inventory items with existing MSDS URLs.
    """
    # Arrange: Define the new MSDS URL
    new_url = "https://example.com/new_msds"

    # Act: Send the POST request
    response = client.post(
        "/api/set_msds_url",
        data=json.dumps({"url": new_url}),
        content_type="application/json",
    )

    # Assert: Check the response
    assert response.status_code == 200
    data = response.json
    assert "success" in data and data["success"]

    # Verify the database state
    items = db.session.query(Inventory).filter(Inventory.MSDS == new_url).all()
    assert len(items) > 0  # Ensure at least one item was updated


def test_set_msds_url_missing_url(client):
    """
    Test setting an MSDS URL with missing 'url' in the request payload.
    """
    # Act: Send the POST request without 'url'
    response = client.post(
        "/api/set_msds_url",
        data=json.dumps({}),
        content_type="application/json",
    )

    # Assert: Check the response
    assert response.status_code == 400
    data = response.json
    assert "error" in data
    assert data["error"] == "Missing 'url' in request payload."


def test_add_msds(client):
    """
    Test adding an MSDS URL to a specific inventory item.
    """
    # Arrange: Get an inventory item without an MSDS URL
    item = db.session.query(Inventory).filter(Inventory.MSDS == None).first()
    inventory_id = item.Inventory_ID

    # Act: Send the POST request
    response = client.post(
        "/api/add_msds",
        data=json.dumps({"inventory_id": inventory_id}),
        content_type="application/json",
    )

    # Assert: Check the response
    assert response.status_code == 200
    data = response.json
    assert "success" in data and data["success"]

    # Verify the database state
    db.session.refresh(item)
    assert item.MSDS != None
    assert item.MSDS != ""


def test_add_msds_invalid_inventory_id(client):
    """
    Test adding an MSDS URL with an invalid inventory ID.
    """
    # Act: Send the POST request with an invalid inventory ID
    response = client.post(
        "/api/add_msds",
        data=json.dumps({"inventory_id": -1}),
        content_type="application/json",
    )

    # Assert: Check the response
    assert response.status_code == 404
    data = response.json
    assert "error" in data
    assert data["error"] == "Invalid 'inventory_id'. Item not found."


def test_clear_msds(client):
    """
    Test clearing the MSDS URL for a specific inventory item.
    """
    # Arrange: Get an inventory item with an MSDS URL
    item = db.session.query(Inventory).filter(Inventory.MSDS != None).first()
    inventory_id = item.Inventory_ID

    # Act: Send the POST request
    response = client.post(
        "/api/clear_msds",
        data=json.dumps({"inventory_id": inventory_id}),
        content_type="application/json",
    )

    # Assert: Check the response
    assert response.status_code == 200
    data = response.json
    assert "success" in data and data["success"]

    # Verify the database state
    db.session.refresh(item)
    assert item.MSDS is None


def test_clear_msds_invalid_inventory_id(client):
    """
    Test clearing the MSDS URL with an invalid inventory ID.
    """
    # Act: Send the POST request with an invalid inventory ID
    response = client.post(
        "/api/clear_msds",
        data=json.dumps({"inventory_id": -1}),
        content_type="application/json",
    )

    # Assert: Check the response
    assert response.status_code == 404
    data = response.json
    assert "error" in data
    assert data["error"] == "Invalid 'inventory_id'. Item not found."


def test_get_missing_msds(client):
    """
    Test retrieving all inventory items missing an MSDS URL.
    """
    # Act: Send the GET request
    response = client.get("/api/get_missing_msds")

    # Assert: Check the response
    assert response.status_code == 200
    data = response.json
    assert isinstance(data, list)

    # Verify the database state
    missing_items = db.session.query(Inventory).filter(
        (Inventory.MSDS == None) | (Inventory.MSDS == "")
    ).all()
    assert len(data) == len(missing_items)


def test_get_missing_msds_no_missing_items(client):
    """
    Test retrieving all inventory items missing an MSDS URL when none are missing.
    """
    # Arrange: Ensure all inventory items have MSDS URLs
    db.session.query(Inventory).update({Inventory.MSDS: "https://example.com/msds"})
    db.session.commit()

    # Act: Send the GET request
    response = client.get("/api/get_missing_msds")

    # Assert: Check the response
    assert response.status_code == 200
    data = response.json
    assert isinstance(data, list)
    assert len(data) == 0  # No missing items
