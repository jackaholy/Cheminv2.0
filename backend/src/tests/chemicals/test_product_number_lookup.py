import pytest

@pytest.mark.parametrize(
    "product_number, expected_status, expected_data",
    [
        # Valid product number
        ("A123", 200, {
            "chemical_id": 1,
            "manufacturer": {"name": "Fisher Scientific", "id": 1},
            "product_number": "A123",
        }),
        # Valid product number with different casing
        ("a123", 200, {
            "chemical_id": 1,
            "manufacturer": {"name": "Fisher Scientific", "id": 1},
            "product_number": "A123",
        }),
        # Non-existent product number
        ("INVALID123", 404, {}),
        # Empty product number
        ("", 404, {}),
        # Product number with special characters
        ("A123!", 404, {}),
    ],
)
def test_product_number_lookup(client, product_number, expected_status, expected_data):
    """
    Test the product number lookup endpoint with various inputs.
    """
    response = client.get(f"/api/chemicals/product_number_lookup?product_number={product_number}")
    assert response.status_code == expected_status
    assert response.json == expected_data


def test_product_number_lookup_missing_param(client):
    """
    Test the product number lookup endpoint when the parameter is missing.
    """
    response = client.get("/api/chemicals/product_number_lookup")
    assert response.status_code == 404
    assert response.json == {}


def test_product_number_lookup_partial_match(client):
    """
    Test that partial matches do not return results.
    """
    response = client.get("/api/chemicals/product_number_lookup?product_number=A12")
    assert response.status_code == 404
    assert response.json == {}


def test_product_number_lookup_whitespace(client):
    """
    Test the product number lookup endpoint with leading/trailing whitespace.
    """
    response = client.get("/api/chemicals/product_number_lookup?product_number= A123 ")
    assert response.status_code == 404
    assert response.json == {}
