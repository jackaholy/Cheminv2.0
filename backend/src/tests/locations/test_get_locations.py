import pytest
from database import db
from models import Location, Sub_Location

def test_get_locations(client):
    """
    Test fetching all locations.
    """
    response = client.get("/api/locations")
    assert response.status_code == 200

    data = response.json
    assert len(data) > 0  # Ensure locations are returned
    for location in data:
        assert "location_id" in location
        assert "building" in location
        assert "room" in location
        assert "sub_locations" in location
        for sub_location in location["sub_locations"]:
            assert "sub_location_id" in sub_location
            assert "sub_location_name" in sub_location


def test_get_locations_with_query(client):
    """
    Test fetching locations with a search query.
    """
    # Add a location to test the query
    location = Location(Building="Test Building", Room="101")
    db.session.add(location)
    db.session.commit()

    response = client.get("/api/locations?query=Test")
    assert response.status_code == 200

    data = response.json
    assert len(data) > 0
    assert any(loc["building"] == "Test Building" and loc["room"] == "101" for loc in data)


def test_get_locations_empty_database(client):
    """
    Test fetching locations when the database is empty.
    """
    # Clear the database
    db.session.query(Sub_Location).delete()
    db.session.query(Location).delete()
    db.session.commit()

    response = client.get("/api/locations")
    assert response.status_code == 200

    data = response.json
    assert len(data) == 0  # Ensure no locations are returned