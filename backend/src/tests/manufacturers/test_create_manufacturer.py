import pytest
from flask import Flask
from database import db
from models import Manufacturer

def test_create_manufacturer_success(client):
    """
    Test creating a manufacturer with valid input.
    """
    # Send POST request with valid data
    response = client.post(
        "/api/add_manufacturer",
        json={"name": "New Manufacturer"}
    )
    assert response.status_code == 200

    # Parse the JSON response
    data = response.json
    assert data["message"] == "Manufacturer created successfully"
    assert data["name"] == "New Manufacturer"

    # Verify the manufacturer exists in the database
    manufacturer = db.session.query(Manufacturer).filter_by(Manufacturer_Name="New Manufacturer").first()
    assert manufacturer is not None

def test_create_manufacturer_missing_name(client):
    """
    Test creating a manufacturer with missing name in the request body.
    """
    # Send POST request with missing name
    response = client.post(
        "/api/add_manufacturer",
        json={},
    )
    assert response.status_code == 400

    # Parse the JSON response
    data = response.json
    assert data["message"] == "Manufacturer name is required."

def test_create_manufacturer_duplicate_name(client):
    """
    Test creating a manufacturer with a name that already exists.
    """
    # Add a manufacturer to the database
    existing_manufacturer = Manufacturer(Manufacturer_Name="Existing Manufacturer")
    db.session.add(existing_manufacturer)
    db.session.commit()

    # Send POST request with duplicate name
    response = client.post(
        "/api/add_manufacturer",
        json={"name": "Existing Manufacturer"},
    )
    assert response.status_code == 400

    # Parse the JSON response
    data = response.json
    assert data["message"] == "Manufacturer with this name already exists."
