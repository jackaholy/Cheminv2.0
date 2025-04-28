from database import db
from models import Chemical, Manufacturer, Storage_Class, Chemical_Manufacturer
import json


def test_add_chemical_success(client):
    """
    Test a valid call to /api/add_chemical.
    This test checks:
      - API returns 200 with proper message and chemical_id.
      - Chemical and Chemical_Manufacturer records are created in the database.
    """
    # Create required dependencies
    manufacturer = Manufacturer(Manufacturer_Name="Test Manufacturer")
    storage_class = Storage_Class(Storage_Class_Name="Test Storage Class")
    db.session.add_all([manufacturer, storage_class])
    db.session.commit()

    payload = {
        "chemical_name": "Test Chemical",
        "chemical_formula": "H2O",
        "product_number": "T123",
        "storage_class_id": storage_class.Storage_Class_ID,
        "manufacturer_id": manufacturer.Manufacturer_ID,
    }

    response = client.post(
        "/api/add_chemical",
        data=json.dumps(payload),
        content_type="application/json",
    )
    assert response.status_code == 200
    data = response.json
    assert "message" in data and data["message"] == "Chemical added successfully"
    assert "chemical_id" in data

    # Verify that the chemical exists in the database
    chemical = (
        db.session.query(Chemical).filter_by(Chemical_ID=data["chemical_id"]).first()
    )
    assert chemical is not None
    assert chemical.Chemical_Name == payload["chemical_name"]
    assert chemical.Chemical_Formula == payload["chemical_formula"]

    # Verify that the Chemical_Manufacturer record exists
    chem_manufacturer = (
        db.session.query(Chemical_Manufacturer)
        .filter_by(
            Chemical_ID=chemical.Chemical_ID,
            Manufacturer_ID=payload["manufacturer_id"],
            Product_Number=payload["product_number"],
        )
        .first()
    )
    assert chem_manufacturer is not None


def test_add_chemical_missing_fields(client):
    """
    Test that missing required fields (e.g., chemical_name) causes an error.
    """
    payload = {
        # "chemical_name": "Test Chemical",  # intentionally omitted
        "chemical_formula": "H2O",
        "product_number": "T123",
        "storage_class_id": 1,
        "manufacturer_id": 1,
    }
    response = client.post(
        "/api/add_chemical",
        data=json.dumps(payload),
        content_type="application/json",
    )
    assert response.status_code == 400
    data = response.json
    assert "error" in data


def test_add_chemical_invalid_storage_class(client):
    """
    Test that providing an invalid storage_class_id causes an error.
    """
    payload = {
        "chemical_name": "Test Chemical",
        "chemical_formula": "H2O",
        "product_number": "T123",
        "storage_class_id": 9999,  # Invalid ID
        "manufacturer_id": 1,
    }
    response = client.post(
        "/api/add_chemical",
        data=json.dumps(payload),
        content_type="application/json",
    )
    assert response.status_code == 400
    data = response.json
    assert "error" in data


def test_add_chemical_invalid_manufacturer(client):
    """
    Test that providing an invalid manufacturer_id causes an error.
    """
    payload = {
        "chemical_name": "Test Chemical",
        "chemical_formula": "H2O",
        "product_number": "T123",
        "storage_class_id": 1,
        "manufacturer_id": 9999,  # Invalid ID
    }
    response = client.post(
        "/api/add_chemical",
        data=json.dumps(payload),
        content_type="application/json",
    )
    assert response.status_code == 400
    data = response.json
    assert "error" in data