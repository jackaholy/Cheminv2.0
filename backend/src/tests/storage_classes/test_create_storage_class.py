from database import db
from models import Storage_Class

def test_create_storage_class_success(client):
    """
    Test creating a storage class successfully.
    """
    # Send POST request with valid data
    response = client.post(
        "/api/storage_classes/",
        json={"name": "New Storage Class"},
    )
    assert response.status_code == 201

    # Parse the JSON response
    data = response.json
    assert data["message"] == "Storage class created successfully"

    # Verify the storage class exists in the database
    storage_class = db.session.query(Storage_Class).filter_by(Storage_Class_Name="New Storage Class").first()
    assert storage_class is not None

def test_create_storage_class_missing_name(client):
    """
    Test creating a storage class with missing name.
    """
    # Send POST request without a name
    response = client.post(
        "/api/storage_classes/",
        json={},
    )
    assert response.status_code == 400

    # Parse the JSON response
    data = response.json
    assert data["error"] == "Storage class name is required"

def test_create_storage_class_duplicate_name(client):
    """
    Test creating a storage class with a duplicate name.
    """
    # Add a storage class to the database
    existing_storage_class = Storage_Class(Storage_Class_Name="Duplicate")
    db.session.add(existing_storage_class)
    db.session.commit()

    # Send POST request with duplicate name
    response = client.post(
        "/api/storage_classes/",
        json={"name": "Duplicate"},
    )
    assert response.status_code == 400

    # Parse the JSON response
    data = response.json
    assert data["error"] == "Storage class already exists"
