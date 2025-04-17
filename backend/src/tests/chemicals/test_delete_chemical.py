from database import db
from models import Chemical, Chemical_Manufacturer, Inventory
import json

def test_delete_chemical_success(client):
    """
    Test deleting a valid chemical with associated records.
    """
    # Arrange: Ensure a chemical exists with associated records
    chemical = db.session.query(Chemical).first()
    chemical_id = chemical.Chemical_ID
    assert chemical is not None

    # Act: Send the request to delete the chemical
    response = client.delete(f"/api/delete_chemical/{chemical_id}")

    # Assert: Check the response and database state
    assert response.status_code == 200
    data = response.json
    assert "message" in data and data["message"] == "Chemical deleted successfully"

    # Verify the chemical and associated records are deleted
    assert db.session.query(Chemical).filter_by(Chemical_ID=chemical_id).first() is None
    assert db.session.query(Chemical_Manufacturer).filter_by(Chemical_ID=chemical_id).count() == 0
    assert db.session.query(Inventory).filter(Inventory.Chemical_Manufacturer_ID.in_(
        [cm.Chemical_Manufacturer_ID for cm in db.session.query(Chemical_Manufacturer).filter_by(Chemical_ID=chemical_id)]
    )).count() == 0

def test_delete_chemical_not_found(client):
    """
    Test deleting a chemical that does not exist.
    """
    # Act: Send the request with a non-existent chemical ID
    response = client.delete("/api/delete_chemical/9999")  # Assuming 9999 doesn't exist

    # Assert: Check the response
    assert response.status_code == 404
    data = response.json
    assert "error" in data and data["error"] == "Chemical not found"

def test_delete_chemical_with_no_associated_records(client):
    """
    Test deleting a chemical that has no associated manufacturers or inventory.
    """
    # Arrange: Use an existing chemical with no associated records
    chemical = db.session.query(Chemical).filter_by(Chemical_Name="Water").first()
    chemical_id = chemical.Chemical_ID
    assert chemical is not None

    # Act: Send the request to delete the chemical
    response = client.delete(f"/api/delete_chemical/{chemical_id}")

    # Assert: Check the response and database state
    assert response.status_code == 200
    data = response.json
    assert "message" in data and data["message"] == "Chemical deleted successfully"
    assert db.session.query(Chemical).filter_by(Chemical_ID=chemical_id).first() is None

def test_delete_chemical_with_partial_associations(client):
    """
    Test deleting a chemical with some associated records (e.g., manufacturers but no inventory).
    """
    # Arrange: Use an existing chemical with a manufacturer but no inventory
    chemical = db.session.query(Chemical).filter_by(Chemical_Name="Methanol").first()
    chemical_id = chemical.Chemical_ID
    assert chemical is not None

    # Act: Send the request to delete the chemical
    response = client.delete(f"/api/delete_chemical/{chemical_id}")

    # Assert: Check the response and database state
    assert response.status_code == 200
    data = response.json
    assert "message" in data and data["message"] == "Chemical deleted successfully"
    assert db.session.query(Chemical).filter_by(Chemical_ID=chemical_id).first() is None
    assert db.session.query(Chemical_Manufacturer).filter_by(Chemical_ID=chemical_id).count() == 0

def test_delete_chemical_with_invalid_method(client):
    """
    Test accessing the delete endpoint with an invalid HTTP method.
    """
    # Act: Send a GET request to the delete endpoint
    response = client.get("/api/delete_chemical/1")

    # Assert: Check the response
    assert response.status_code == 404 

def test_delete_chemical_with_associated_inventory_only(client):
    """
    Test deleting a chemical with inventory but no manufacturers.
    """
    # Arrange: Use an existing chemical with inventory but no manufacturers
    chemical = db.session.query(Chemical).filter_by(Chemical_Name="Water").first()
    chemical_id = chemical.Chemical_ID
    assert chemical is not None

    # Act: Send the request to delete the chemical
    response = client.delete(f"/api/delete_chemical/{chemical_id}")

    # Assert: Check the response and database state
    assert response.status_code == 200
    data = response.json
    assert "message" in data and data["message"] == "Chemical deleted successfully"
    assert db.session.query(Chemical).filter_by(Chemical_ID=chemical_id).first() is None
    assert db.session.query(Inventory).filter_by(Chemical_Manufacturer_ID=None).count() == 0

def test_delete_chemical_with_associated_sublocation_inventory(client):
    """
    Test deleting a chemical with associated sub-location inventory records.
    """
    # Arrange: Use an existing chemical with associated inventory
    chemical = db.session.query(Chemical).filter_by(Chemical_Name="Ethanol").first()
    chemical_id = chemical.Chemical_ID
    assert chemical is not None

    # Verify associated inventory exists
    inventory_count = db.session.query(Inventory).filter(
        Inventory.Chemical_Manufacturer_ID.in_(
            [cm.Chemical_Manufacturer_ID for cm in db.session.query(Chemical_Manufacturer).filter_by(Chemical_ID=chemical_id)]
        )
    ).count()
    assert inventory_count > 0

    # Act: Send the request to delete the chemical
    response = client.delete(f"/api/delete_chemical/{chemical_id}")

    # Assert: Check the response and database state
    assert response.status_code == 200
    data = response.json
    assert "message" in data and data["message"] == "Chemical deleted successfully"

    # Verify the chemical and associated inventory are deleted
    assert db.session.query(Chemical).filter_by(Chemical_ID=chemical_id).first() is None
    assert db.session.query(Inventory).filter(
        Inventory.Chemical_Manufacturer_ID.in_(
            [cm.Chemical_Manufacturer_ID for cm in db.session.query(Chemical_Manufacturer).filter_by(Chemical_ID=chemical_id)]
        )
    ).count() == 0
