from database import db
from models import Storage_Class

def test_update_storage_class_success(client):
    """
    Test updating a storage class successfully.
    """
    # Fetch an existing storage class
    storage_class = db.session.query(Storage_Class).filter_by(Storage_Class_Name="Flammable").first()
    assert storage_class is not None

    # Send PUT request with valid data
    response = client.put(
        f"/api/storage_classes/{storage_class.Storage_Class_ID}",
        json={"name": "Updated Storage Class"},
    )
    assert response.status_code == 200

    # Parse the JSON response
    data = response.json
    assert data["message"] == "Storage class updated successfully"

    # Verify the storage class name is updated in the database
    updated_storage_class = db.session.query(Storage_Class).filter_by(Storage_Class_ID=storage_class.Storage_Class_ID).first()
    assert updated_storage_class.Storage_Class_Name == "Updated Storage Class"

def test_update_storage_class_missing_name(client):
    """
    Test updating a storage class with missing name.
    """
    # Fetch an existing storage class
    storage_class = db.session.query(Storage_Class).filter_by(Storage_Class_Name="Flammable").first()
    assert storage_class is not None

    # Send PUT request without a name
    response = client.put(
        f"/api/storage_classes/{storage_class.Storage_Class_ID}",
        json={},
    )
    assert response.status_code == 400

    # Parse the JSON response
    data = response.json
    assert data["error"] == "Storage class name is required"

def test_update_storage_class_not_found(client):
    """
    Test updating a non-existent storage class.
    """
    # Send PUT request for a non-existent storage class ID
    response = client.put(
        "/api/storage_classes/99999",
        json={"name": "Non-Existent Storage Class"},
    )
    assert response.status_code == 404

    # Parse the JSON response
    data = response.json
    assert data["error"] == "Storage class not found"
