import pytest
from flask import Flask
from database import db
from models import Manufacturer


def test_update_manufacturer_success(client):
    """
    Test updating a manufacturer with valid input.
    """
    # Fetch an existing manufacturer
    manufacturer = db.session.query(Manufacturer).filter_by(Manufacturer_Name="Fisher Scientific").first()
    assert manufacturer is not None

    # Send PUT request with valid data
    response = client.put(
        f"/api/manufacturers/{manufacturer.Manufacturer_ID}",
        json={"name": "Fisher Scientific Updated"},
    )
    assert response.status_code == 200

    # Parse the JSON response
    data = response.json
    assert data["message"] == "Manufacturer updated successfully."

    # Verify the manufacturer name is updated in the database
    updated_manufacturer = db.session.query(Manufacturer).filter_by(Manufacturer_ID=manufacturer.Manufacturer_ID).first()
    assert updated_manufacturer.Manufacturer_Name == "Fisher Scientific Updated"


def test_update_manufacturer_missing_name(client):
    """
    Test updating a manufacturer with missing name in the request body.
    """
    # Fetch an existing manufacturer
    manufacturer = db.session.query(Manufacturer).filter_by(Manufacturer_Name="Sigma-Aldrich").first()
    assert manufacturer is not None

    # Send PUT request with missing name
    response = client.put(
        f"/api/manufacturers/{manufacturer.Manufacturer_ID}",
        json={},
    )
    assert response.status_code == 400

    # Parse the JSON response
    data = response.json
    assert data["message"] == "Manufacturer name is required."


def test_update_manufacturer_not_found(client):
    """
    Test updating a manufacturer that does not exist.
    """
    # Send PUT request for a non-existent manufacturer ID
    response = client.put(
        "/api/manufacturers/99999",
        json={"name": "Non-Existent Manufacturer"},
    )
    assert response.status_code == 404

    # Parse the JSON response
    data = response.json
    assert data["message"] == "Manufacturer not found."


def test_update_manufacturer_duplicate_name(client):
    """
    Test updating a manufacturer with a name that already exists.
    """
    # Fetch two existing manufacturers
    manufacturer1 = db.session.query(Manufacturer).filter_by(Manufacturer_Name="Fisher Scientific").first()
    manufacturer2 = db.session.query(Manufacturer).filter_by(Manufacturer_Name="Sigma-Aldrich").first()
    assert manufacturer1 is not None
    assert manufacturer2 is not None

    # Send PUT request with a duplicate name
    response = client.put(
        f"/api/manufacturers/{manufacturer1.Manufacturer_ID}",
        json={"name": manufacturer2.Manufacturer_Name},
    )
    assert response.status_code == 400

    # Parse the JSON response
    data = response.json
    assert data["message"] == "Manufacturer with this name already exists."
