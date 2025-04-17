import pytest

def test_product_search_valid_query(client):
    """
    Test product search with a valid query that matches existing product numbers.
    """
    response = client.get("/api/product-search", query_string={"query": "A"})
    assert response.status_code == 200
    data = response.json
    assert isinstance(data, list)
    assert "A123" in data  # Example product number from test data
    assert len(data) > 0


def test_product_search_empty_query(client):
    """
    Test product search with an empty query, expecting an empty list.
    """
    response = client.get("/api/product-search", query_string={"query": ""})
    assert response.status_code == 200
    data = response.json
    assert data == []


def test_product_search_no_matches(client):
    """
    Test product search with a query that does not match any product numbers.
    """
    response = client.get("/api/product-search", query_string={"query": "XYZ"})
    assert response.status_code == 200
    data = response.json
    assert data == []


def test_product_search_case_insensitivity(client):
    """
    Test product search to ensure it is case-insensitive.
    """
    response = client.get("/api/product-search", query_string={"query": "a123"})
    assert response.status_code == 200
    data = response.json
    assert "A123" in data  # Example product number from test data


def test_product_search_partial_match(client):
    """
    Test product search with a partial query that matches multiple product numbers.
    """
    response = client.get("/api/product-search", query_string={"query": "1"})
    assert response.status_code == 200
    data = response.json
    assert isinstance(data, list)
    assert len(data) > 1  # Assuming multiple matches for "A"
    assert "A123" in data  # Example product number from test data
