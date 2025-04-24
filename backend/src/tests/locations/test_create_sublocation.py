import pytest
from database import db
from models import Location, Sub_Location


def test_create_sublocation_success(client):
    """
    Test creating a sublocation with valid input.
    """
    location = db.session.query(Location).first()
    assert location is not None

    response = client.post(
        "/api/sublocations",
        json={"name": "New Sublocation", "locationId": location.Location_ID},
    )
    assert response.status_code == 201

    data = response.json
    assert data["message"] == "Sublocation created successfully"
    assert "id" in data

    # Verify the sublocation exists in the database
    sublocation = (
        db.session.query(Sub_Location)
        .filter_by(Sub_Location_Name="New Sublocation")
        .first()
    )
    assert sublocation is not None


def test_create_sublocation_missing_fields(client):
    """
    Test creating a sublocation with missing fields.
    """
    response = client.post(
        "/api/sublocations",
        json={"name": "New Sublocation"},
    )
    assert response.status_code == 400

    assert response.json == {
        "errors": {"locationId": ["Missing data for required field."]},
        "message": "Validation errors",
    }


def test_create_sublocation_duplicate(client):
    """
    Test creating a sublocation that already exists.
    """
    location = db.session.query(Location).first()
    assert location is not None

    # Create the sublocation initially
    client.post(
        "/api/sublocations",
        json={"name": "Duplicate Sublocation", "locationId": location.Location_ID},
    )
    # Attempt to create the same sublocation again
    response = client.post(
        "/api/sublocations",
        json={"name": "Duplicate Sublocation", "locationId": location.Location_ID},
    )
    assert response.status_code == 400

    assert response.json == {
        "message": "Sublocation with the same name already exists for this location."
    }


def test_create_sublocation_invalid_input(client):
    """
    Test creating a sublocation with invalid input types.
    """
    response = client.post(
        "/api/sublocations",
        json={"name": 123, "locationId": "invalid_id"},
    )
    assert response.status_code == 400

    assert response.json == {
        "errors": {
            "locationId": ["Not a valid integer."],
            "name": ["Not a valid string."],
        },
        "message": "Validation errors",
    }
