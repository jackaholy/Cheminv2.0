import pytest
from database import db
from models import Location

def test_update_location_success(client):
    """
    Test updating a location with valid input.
    """
    location = db.session.query(Location).first()
    assert location is not None

    response = client.put(
        f"/api/locations/{location.Location_ID}",
        json={"building": "Updated Building", "room": "303"},
    )
    assert response.status_code == 200

    data = response.json
    assert data["message"] == "Location updated successfully"

    # Verify the location is updated in the database
    updated_location = db.session.query(Location).filter_by(Location_ID=location.Location_ID).first()
    assert updated_location.Building == "Updated Building"
    assert updated_location.Room == "303"


def test_update_location_not_found(client):
    """
    Test updating a non-existent location.
    """
    response = client.put(
        "/api/locations/99999",
        json={"building": "Non-Existent Building", "room": "404"},
    )
    assert response.status_code == 404

    data = response.json
    assert data["message"] == "Location not found"


def test_update_location_invalid_input(client):
    """
    Test updating a location with invalid input.
    """
    location = db.session.query(Location).first()
    assert location is not None

    response = client.put(
        f"/api/locations/{location.Location_ID}",
        json={"building": 123, "room": None},
    )
    assert response.status_code == 400
    assert response.json == {"errors":{"building":["Not a valid string."],"room":["Field may not be null."]},"message":"Validation errors"}


def test_update_location_partial_update(client):
    """
    Test updating a location with partial input.
    """
    location = db.session.query(Location).first()
    assert location is not None

    response = client.put(
        f"/api/locations/{location.Location_ID}",
        json={"building": "Partially Updated Building"},
    )
    assert response.status_code == 400
    assert response.json == {"errors":{"room":["Missing data for required field."]},"message":"Validation errors"}
