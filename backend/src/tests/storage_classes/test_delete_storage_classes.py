from database import db
from models import Storage_Class, Chemical

def test_delete_storage_classes_success(client):
    """
    Test deleting storage classes successfully.
    """
    # Fetch existing storage classes
    storage_class = db.session.query(Storage_Class).filter_by(Storage_Class_Name="Flammable").first()
    assert storage_class is not None

    # Send DELETE request with valid storage class names
    response = client.delete(
        "/api/storage_classes/",
        json={"storageClasses": ["Flammable"]},
    )
    assert response.status_code == 200

    # Parse the JSON response
    data = response.json
    assert "Successfully deleted" in data["message"]

    # Verify the storage class is deleted
    assert db.session.query(Storage_Class).filter_by(Storage_Class_Name="Flammable").first() is None

def test_delete_storage_classes_unknown(client):
    """
    Test preventing deletion of the 'Unknown' storage class.
    """
    # Send DELETE request with "Unknown" storage class
    response = client.delete(
        "/api/storage_classes/",
        json={"storageClasses": ["Unknown"]},
    )
    assert response.status_code == 400

    # Parse the JSON response
    data = response.json
    assert data["error"] == 'Cannot delete the "Unknown" storage class'

def test_delete_storage_classes_not_found(client):
    """
    Test deleting non-existent storage classes.
    """
    # Send DELETE request with non-existent storage class names
    response = client.delete(
        "/api/storage_classes/",
        json={"storageClasses": ["NonExistent"]},
    )
    assert response.status_code == 404

    # Parse the JSON response
    data = response.json
    assert data["error"] == "No storage classes found to delete"
