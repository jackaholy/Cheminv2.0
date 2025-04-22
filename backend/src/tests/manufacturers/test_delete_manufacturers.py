from database import db
from models import Manufacturer


def test_delete_manufacturers_success(client):
    """
    Test deleting manufacturers with valid IDs.
    """
    # Fetch existing manufacturers from test data
    manufacturer1 = db.session.query(Manufacturer).filter_by(Manufacturer_Name="Fisher Scientific").first()
    manufacturer2 = db.session.query(Manufacturer).filter_by(Manufacturer_Name="Sigma-Aldrich").first()

    # Store Manufacturer_IDs before deletion
    manufacturer1_id = manufacturer1.Manufacturer_ID
    manufacturer2_id = manufacturer2.Manufacturer_ID

    # Send DELETE request with valid IDs
    response = client.delete(
        "/api/delete_manufacturers",
        json={"ids": [manufacturer1_id, manufacturer2_id]},
    )
    assert response.status_code == 200

    # Parse the JSON response
    data = response.json
    assert data["message"] == "Manufacturers deleted successfully."

    # Verify the manufacturers are deleted from the database
    assert db.session.query(Manufacturer).filter_by(Manufacturer_ID=manufacturer1_id).first() is None
    assert db.session.query(Manufacturer).filter_by(Manufacturer_ID=manufacturer2_id).first() is None

def test_delete_manufacturers_no_ids(client):
    """
    Test deleting manufacturers without providing IDs.
    """
    # Send DELETE request without IDs
    response = client.delete(
        "/api/delete_manufacturers",
        json={},
        headers={"Authorization": "Bearer valid_token"},  # Mock valid token
    )
    assert response.status_code == 400

    # Parse the JSON response
    data = response.json
    assert data["message"] == "No manufacturer IDs provided."

def test_delete_manufacturers_invalid_ids(client):
    """
    Test deleting manufacturers with invalid IDs.
    """
    # Send DELETE request with non-existent IDs
    response = client.delete(
        "/api/delete_manufacturers",
        json={"ids": [9999, 8888]},  # IDs that don't exist
        headers={"Authorization": "Bearer valid_token"},  # Mock valid token
    )
    assert response.status_code == 200

    # Parse the JSON response
    data = response.json
    assert data["message"] == "Manufacturers deleted successfully."

    # Verify no manufacturers were deleted (since none existed with those IDs)
    remaining_manufacturers = db.session.query(Manufacturer).all()
    assert len(remaining_manufacturers) > 0  # Ensure other manufacturers still exist
