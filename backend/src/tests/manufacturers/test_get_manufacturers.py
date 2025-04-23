from database import db
from models import Manufacturer, Chemical_Manufacturer, Inventory

def test_get_manufacturers_active(client):
    """
    Test the /api/manufacturers endpoint with the active=true query parameter.
    """
    # Send GET request to the API endpoint with active=true
    response = client.get("/api/manufacturers?active=true")
    assert response.status_code == 200

    # Parse the JSON response
    data = response.json

    # Assert that only active manufacturers are returned
    assert len(data) > 0
    for manufacturer in data:
        manufacturer_id = manufacturer["id"]
        # Ensure the manufacturer is associated with active inventory
        active_inventory = db.session.query(Inventory).join(Chemical_Manufacturer).filter(
            Chemical_Manufacturer.Manufacturer_ID == manufacturer_id,
            Inventory.Is_Dead == False
        ).first()
        assert active_inventory is not None

    # Check alphabetical sorting
    names = [manufacturer["name"].lower() for manufacturer in data]
    assert names == sorted(names)

def test_get_manufacturers_all(client):
    """
    Test the /api/manufacturers endpoint with the active=false query parameter.
    """
    # Send GET request to the API endpoint with active=false
    response = client.get("/api/manufacturers?active=false")
    assert response.status_code == 200

    # Parse the JSON response
    data = response.json

    # Assert that all manufacturers are returned
    all_manufacturers = db.session.query(Manufacturer).all()
    assert len(data) == len(all_manufacturers)

    # Check that all manufacturers are included in the response
    returned_ids = {manufacturer["id"] for manufacturer in data}
    expected_ids = {manufacturer.Manufacturer_ID for manufacturer in all_manufacturers}
    assert returned_ids == expected_ids

    # Check alphabetical sorting
    names = [manufacturer["name"].lower() for manufacturer in data]
    assert names == sorted(names)

def test_get_manufacturers_default(client):
    """
    Test the /api/manufacturers endpoint without specifying the active query parameter.
    """
    # Send GET request to the API endpoint without active parameter
    response = client.get("/api/manufacturers")
    assert response.status_code == 200

    # Parse the JSON response
    data = response.json

    # Assert that the default behavior (active=true) is applied
    assert len(data) > 0
    for manufacturer in data:
        manufacturer_id = manufacturer["id"]
        # Ensure the manufacturer is associated with active inventory
        active_inventory = db.session.query(Inventory).join(Chemical_Manufacturer).filter(
            Chemical_Manufacturer.Manufacturer_ID == manufacturer_id,
            Inventory.Is_Dead == False
        ).first()
        assert active_inventory is not None

    # Check alphabetical sorting
    names = [manufacturer["name"].lower() for manufacturer in data]
    assert names == sorted(names)
