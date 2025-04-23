import pytest


@pytest.mark.parametrize(
    "sticker_number, expected_status, expected_data",
    [
        # Valid sticker number
        (
            "1001",
            200,
            {
                "inventory_id": 1,
                "sub_location_id": 1,
                "location_name": "Science Hall 101",
                "sub_location_name": "Shelf A",
            },
        ),
        # Valid sticker number for a dead bottle
        (
            "1002",
            200,
            {
                "inventory_id": 2,
                "sub_location_id": 2,
                "location_name": "Science Hall 102",
                "sub_location_name": "Cabinet B",
            },
        ),
        # Non-existent sticker number
        (
            "9999",
            404,
            {"error": "Sticker not found"},
        ),
        # Sticker number with leading/trailing whitespace
        (
            " 1001 ",
            200,
            {
                "inventory_id": 1,
                "sub_location_id": 1,
                "location_name": "Science Hall 101",
                "sub_location_name": "Shelf A",
            },
        ),
    ],
)
def test_sticker_lookup(client, sticker_number, expected_status, expected_data):
    """
    Test the sticker lookup endpoint with various inputs.
    """
    response = client.get(f"/api/chemicals/sticker_lookup?sticker_number={sticker_number}")
    assert response.status_code == expected_status
    assert response.json == expected_data


def test_sticker_lookup_missing_param(client):
    """
    Test the sticker lookup endpoint when the sticker_number parameter is missing.
    """
    response = client.get("/api/chemicals/sticker_lookup")
    assert response.status_code == 400
    assert response.json == {"error": "Missing sticker_number"}


def test_sticker_lookup_invalid_format(client):
    """
    Test the sticker lookup endpoint with invalid sticker number formats.
    """
    response = client.get("/api/chemicals/sticker_lookup?sticker_number=INVALID")
    assert response.status_code == 404
    assert response.json == {"error": "Sticker not found"}


def test_sticker_lookup_partial_match(client):
    """
    Test that partial matches do not return results.
    """
    response = client.get("/api/chemicals/sticker_lookup?sticker_number=10")
    assert response.status_code == 404
    assert response.json == {"error": "Sticker not found"}


def test_sticker_lookup_case_insensitivity(client):
    """
    Test that the sticker lookup is case-insensitive (if applicable).
    """
    response = client.get("/api/chemicals/sticker_lookup?sticker_number=1001")
    assert response.status_code == 200
    assert response.json == {
        "inventory_id": 1,
        "sub_location_id": 1,
        "location_name": "Science Hall 101",
        "sub_location_name": "Shelf A",
    }
