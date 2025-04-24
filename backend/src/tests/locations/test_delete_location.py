import pytest
from database import db
from models import Location, Sub_Location, Inventory

def test_delete_location_success(client):
    """
    Test deleting a location with valid ID.
    """
    location = db.session.query(Location).first()
    assert location is not None

    response = client.delete(f"/api/locations/{location.Location_ID}")
    assert response.status_code == 200

    data = response.json
    assert data["message"] == "Location and associated data deleted successfully"

    # Verify the location is deleted from the database
    deleted_location = db.session.query(Location).filter_by(Location_ID=location.Location_ID).first()
    assert deleted_location is None


def test_delete_location_not_found(client):
    """
    Test deleting a non-existent location.
    """
    response = client.delete("/api/locations/99999")
    assert response.status_code == 404

    data = response.json
    assert data["message"] == "Location not found"


def test_delete_location_with_sublocations(client):
    """
    Test deleting a location with associated sublocations and inventory.
    """
    location = db.session.query(Location).first()
    assert location is not None

    # Add a sublocation and inventory to the location
    sublocation = Sub_Location(Sub_Location_Name="Test Sublocation", Location_ID=location.Location_ID)
    db.session.add(sublocation)
    db.session.commit()

    # Ensure a valid Chemical_Manufacturer_ID is provided
    chemical_manufacturer_id = 1  # Replace with a valid ID from your database setup
    inventory = Inventory(
        Sub_Location_ID=sublocation.Sub_Location_ID,
        Sticker_Number="12345",
        Chemical_Manufacturer_ID=chemical_manufacturer_id
    )
    db.session.add(inventory)
    db.session.commit()

    response = client.delete(f"/api/locations/{location.Location_ID}")
    assert response.status_code == 200

    data = response.json
    assert data["message"] == "Location and associated data deleted successfully"

    # Verify the location, sublocation, and inventory are deleted
    deleted_location = db.session.query(Location).filter_by(Location_ID=location.Location_ID).first()
    assert deleted_location is None

    deleted_sublocation = db.session.query(Sub_Location).filter_by(Sub_Location_ID=sublocation.Sub_Location_ID).first()
    assert deleted_sublocation is None

    deleted_inventory = db.session.query(Inventory).filter_by(Sub_Location_ID=sublocation.Sub_Location_ID).first()
    assert deleted_inventory is None

