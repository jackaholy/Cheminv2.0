import pytest

def test_get_chemicals_by_sublocation_valid(client):
    """
    Test the endpoint with a valid sub_location_id.
    """
    response = client.get("/api/chemicals/by_sublocation?sub_location_id=1")
    assert response.status_code == 200
    data = response.json

    # Ensure the response contains the expected structure
    assert isinstance(data, list)
    assert len(data) > 0
    for chemical in data:
        assert "name" in chemical
        assert "product_number" in chemical
        assert "manufacturer" in chemical
        assert "sticker_number" in chemical

    # Check specific chemical details
    acetone = next((chem for chem in data if chem["name"] == "Acetone"), None)
    assert acetone is not None
    assert acetone["product_number"] == "A123"
    assert acetone["manufacturer"] == "Fisher Scientific"
    assert acetone["sticker_number"] == 1001

def test_get_chemicals_by_sublocation_invalid_id(client):
    """
    Test the endpoint with an invalid sub_location_id.
    """
    response = client.get("/api/chemicals/by_sublocation?sub_location_id=9999")
    assert response.status_code == 200
    data = response.json

    # Ensure the response is an empty list
    assert isinstance(data, list)
    assert len(data) == 0

def test_get_chemicals_by_sublocation_missing_id(client):
    """
    Test the endpoint with a missing sub_location_id parameter.
    """
    response = client.get("/api/chemicals/by_sublocation")
    assert response.status_code == 400
    data = response.json

    # Ensure the error message is correct
    assert "error" in data
    assert data["error"] == "sub_location_id is required"

def test_get_chemicals_by_sublocation_dead_chemicals_excluded(client):
    """
    Test that dead chemicals are excluded from the response.
    """
    response = client.get("/api/chemicals/by_sublocation?sub_location_id=2")
    assert response.status_code == 200
    data = response.json

    # Ensure the response does not include dead chemicals
    assert all(chem["sticker_number"] != 1002 for chem in data)

def test_get_chemicals_by_sublocation_invalid_type(client):
    """
    Test the endpoint with an invalid sub_location_id type (e.g., string).
    """
    response = client.get("/api/chemicals/by_sublocation?sub_location_id=invalid")
    assert response.status_code == 400
    data = response.json

    # Ensure the error message is correct
    assert "error" in data
    assert data["error"] == "sub_location_id is required"
