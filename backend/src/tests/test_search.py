from search import filter_inventory_records
from database import db
from models import Inventory


def test_search_route_no_query(client):
    response = client.get("/api/search")
    assert response.status_code == 200
    assert response.json == []


def test_search_route_with_query(client):
    response = client.get("/api/search?query=water")
    assert response.status_code == 200
    data = response.json
    assert len(data) > 0  # Ensure results are returned
    assert any(chem["chemical_name"].lower() == "water" for chem in data)


def test_search_route_with_invalid_room(client):
    response = client.get("/api/search?room=invalid")
    assert response.status_code == 400  # Invalid room ID should return a 400 error


def test_search_route_with_valid_room(client):
    response = client.get("/api/search?room=1")
    assert response.status_code == 200
    data = response.json
    assert len(data) > 0  # Ensure results are returned
    for chem in data:
        for inv in chem["inventory"]:
            assert inv["location_id"] == 1
            # Verify against the database
            db_inv = db.session.query(Inventory).filter_by(Inventory_ID=inv["id"]).one()
            assert db_inv.Sub_Location.Location.Location_ID == 1


def test_search_route_with_sub_location(client):
    response = client.get("/api/search?sub_location=2")
    assert response.status_code == 200
    data = response.json
    assert len(data) > 0  # Ensure results are returned
    for chem in data:
        for inv in chem["inventory"]:
            assert inv["sub_location_id"] == 2
            # Verify against the database
            db_inv = db.session.query(Inventory).filter_by(Inventory_ID=inv["id"]).one()
            assert db_inv.Sub_Location.Sub_Location_ID == 2


def test_search_route_with_manufacturer(client):
    response = client.get("/api/search?manufacturers=1")
    assert response.status_code == 200
    data = response.json
    assert len(data) > 0  # Ensure results are returned
    for chem in data:
        for inv in chem["inventory"]:
            assert str(inv["manufacturer_id"]) == "1"
            # Verify against the database
            db_inv = db.session.query(Inventory).filter_by(Inventory_ID=inv["id"]).one()
            assert db_inv.Chemical_Manufacturer.Manufacturer_ID == 1


def test_search_route_with_synonyms(client):
    response = client.get("/api/search?query=acetone&synonyms=true")
    assert response.status_code == 200
    data = response.json
    assert len(data) > 0  # Ensure results are returned
    assert any("acetone" in chem["chemical_name"].lower() for chem in data)


def test_search_route_combined_filters(client):
    response = client.get(
        "/api/search?query=acetone&room=1&sub_location=1&manufacturers=1"
    )
    assert response.status_code == 200
    data = response.json
    assert len(data) > 0  # Ensure results are returned
    for chem in data:
        for inv in chem["inventory"]:
            assert inv["location_id"] == 1
            assert inv["sub_location_id"] == 1
            assert inv["manufacturer_id"] == 1
            # Verify against the database
            db_inv = db.session.query(Inventory).filter_by(Inventory_ID=inv["id"]).one()
            assert db_inv.Sub_Location.Location.Location_ID == 1
            assert db_inv.Sub_Location.Sub_Location_ID == 1
            assert db_inv.Chemical_Manufacturer.Manufacturer_ID == 1


def test_search_route_invalid_combined_filters(client):
    response = client.get(
        "/api/search?query=nonexistent&room=999&sub_location=999&manufacturers=999"
    )
    assert response.status_code == 400
    assert response.json == {
        "details": {
            "manufacturers": {"0": ["Manufacturer_ID with ID 999 does not exist."]},
            "room": ["Location_ID with ID 999 does not exist."],
            "sub_location": ["Sub_Location_ID with ID 999 does not exist."],
        },
        "error": "Invalid request parameters",
    }  # No results should be returned for invalid filters


def test_search_route_ordering(client):
    response = client.get("/api/search?query=acid")
    assert response.status_code == 200
    data = response.json
    assert len(data) > 0  # Ensure results are returned
    # Ensure results are ordered by quantity and similarity
    quantities = [chem["quantity"] for chem in data]
    assert quantities == sorted(quantities, reverse=True)