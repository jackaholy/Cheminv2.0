import pytest
from database import db
from models import Sub_Location, Location

def test_get_sublocations(client):
    """
    Test fetching all sublocations.
    """
    response = client.get("/api/sublocations")
    assert response.status_code == 200

    data = response.json
    assert len(data) > 0  # Ensure sublocations are returned
    for sublocation in data:
        assert "id" in sublocation
        assert "name" in sublocation
        assert "building" in sublocation
        assert "room" in sublocation


def test_get_sublocations_with_specific_location(client):
    """
    Test fetching sublocations for a specific parent location.
    """
    location = db.session.query(Location).first()
    assert location is not None

    # Add a sublocation to the location
    sublocation = Sub_Location(Sub_Location_Name="Test Sublocation", Location_ID=location.Location_ID)
    db.session.add(sublocation)
    db.session.commit()

    response = client.get("/api/sublocations")
    assert response.status_code == 200

    data = response.json
    assert any(
        sub["name"] == "Test Sublocation" and sub["building"] == location.Building and sub["room"] == location.Room
        for sub in data
    )


def test_get_sublocations_empty_database(client):
    """
    Test fetching sublocations when the database is empty.
    """
    # Clear the database
    db.session.query(Sub_Location).delete()
    db.session.query(Location).delete()
    db.session.commit()

    response = client.get("/api/sublocations")
    assert response.status_code == 200

    data = response.json
    assert len(data) == 0  # Ensure no sublocations are returned


def test_get_sublocations_with_query(client):
    """
    Test fetching sublocations with a search query.
    """
    location = db.session.query(Location).first()
    assert location is not None

    # Add a sublocation to test the query
    sublocation = Sub_Location(Sub_Location_Name="Query Sublocation", Location_ID=location.Location_ID)
    db.session.add(sublocation)
    db.session.commit()

    response = client.get("/api/sublocations?query=Query")
    assert response.status_code == 200

    data = response.json
    assert any(sub["name"] == "Query Sublocation" for sub in data)