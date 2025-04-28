import pytest
from database import db
from models import Sub_Location, Inventory

def test_delete_sublocations_success(client):
    """
    Test deleting multiple sublocations with valid IDs.
    """
    sublocation = db.session.query(Sub_Location).first()
    assert sublocation is not None

    sublocation_id = sublocation.Sub_Location_ID  # Retrieve ID before deletion

    response = client.delete(
        "/api/sublocations",
        json={"ids": [sublocation_id]},
    )
    assert response.status_code == 200

    data = response.json
    assert data["message"] == "Sublocations deleted successfully."

    # Verify the sublocation is deleted from the database
    deleted_sublocation = db.session.query(Sub_Location).filter_by(Sub_Location_ID=sublocation_id).first()
    assert deleted_sublocation is None


def test_delete_sublocations_missing_ids(client):
    """
    Test deleting sublocations without providing IDs.
    """
    response = client.delete(
        "/api/sublocations",
        json={},
    )
    assert response.status_code == 400

    data = response.json
    assert data["message"] == "No sublocation IDs provided."


def test_delete_sublocations_non_existent_ids(client):
    """
    Test deleting sublocations with non-existent IDs.
    """
    response = client.delete(
        "/api/sublocations",
        json={"ids": [99999]},
    )
    assert response.status_code == 400 

    assert response.json == {"invalid_ids":[99999],"message":"Some sublocation IDs do not exist."}


def test_delete_sublocations_with_inventory(client):
    """
    Test deleting sublocations that have associated inventory records.
    """
    sublocation = db.session.query(Sub_Location).first()
    assert sublocation is not None

    sublocation_id = sublocation.Sub_Location_ID  # Retrieve ID before deletion

    # Add an inventory record to the sublocation
    inventory = Inventory(
        Sub_Location_ID=sublocation_id, 
        Sticker_Number=12345,  # Ensure Sticker_Number is an integer
        Chemical_Manufacturer_ID=1  # Provide a valid Chemical_Manufacturer_ID
    )
    db.session.add(inventory)
    db.session.commit()

    response = client.delete(
        "/api/sublocations",
        json={"ids": [sublocation_id]},
    )
    assert response.status_code == 200

    data = response.json
    assert data["message"] == "Sublocations deleted successfully."

    # Verify the sublocation and inventory are deleted
    deleted_sublocation = db.session.query(Sub_Location).filter_by(Sub_Location_ID=sublocation_id).first()
    assert deleted_sublocation is None

    deleted_inventory = db.session.query(Inventory).filter_by(Sub_Location_ID=sublocation_id).first()
    assert deleted_inventory is None


def test_delete_sublocations_invalid_input(client):
    """
    Test deleting sublocations with invalid input types.
    """
    response = client.delete(
        "/api/sublocations",
        json={"ids": ["invalid_id"]},  # Provide a non-integer ID
    )
    assert response.status_code == 400

    data = response.json
    assert data["message"] == "Invalid input for sublocation IDs."


def test_delete_sublocations_nonexistent_ids(client):
    """
    Test deleting sublocations with some or all non-existent IDs.
    """
    # Assume 99999 and 88888 do not exist in the database
    response = client.delete(
        "/api/sublocations",
        json={"ids": [99999, 88888]},
    )
    assert response.status_code == 400

    data = response.json
    assert data["message"] == "Some sublocation IDs do not exist."
    assert set(data["invalid_ids"]) == {99999, 88888}
