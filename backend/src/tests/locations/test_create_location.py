import pytest
from database import db
from models import Location

def test_create_location_success(client):
    """
    Test creating a location with valid input.
    """
    response = client.post(
        "/api/locations",
        json={"building": "New Building", "room": "202"},
    )
    assert response.status_code == 201

    data = response.json
    assert data["message"] == "Location created successfully"
    assert "location_id" in data

    # Verify the location exists in the database
    location = db.session.query(Location).filter_by(Building="New Building", Room="202").first()
    assert location is not None


def test_create_location_missing_fields(client):
    """
    Test creating a location with missing fields.
    """
    response = client.post(
        "/api/locations",
        json={"building": "New Building"},
    )
    assert response.status_code == 400

    assert response.json == {"errors":{"room":["Missing data for required field."]},"message":"Validation errors"}


def test_create_location_duplicate(client):
    """
    Test creating a location that already exists.
    """
    # Create the location initially
    client.post(
        "/api/locations",
        json={"building": "Duplicate Building", "room": "101"},
    )
    # Attempt to create the same location again
    response = client.post(
        "/api/locations",
        json={"building": "Duplicate Building", "room": "101"},
    )
    assert response.status_code == 400

    assert response.json == {"message":"Location with the same building and room already exists."}


def test_create_location_invalid_input(client):
    """
    Test creating a location with invalid input types.
    """
    response = client.post(
        "/api/locations",
        json={"building": 123, "room": None},
    )
    assert response.status_code == 400

    assert response.json == {"errors":{"building":["Not a valid string."],"room":["Field may not be null."]},"message":"Validation errors"}
