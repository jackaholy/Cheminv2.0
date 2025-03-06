def test_get_chemicals(client):
    # Send GET request to the API endpoint
    response = client.get("/api/get_chemicals")

    # Ensure the response is successful
    assert response.status_code == 200

    # Parse JSON response
    data = response.get_json()

    # Check that data is a list
    assert isinstance(data, list)

    # If there are chemicals, verify the structure of the first item
    if data:
        chem = data[0]
        assert "id" in chem
        assert "chemical_name" in chem
        assert "formula" in chem
        assert "quantity" in chem

        # Ensure values have correct types
        assert isinstance(chem["id"], int)
        assert isinstance(chem["chemical_name"], str)
        assert isinstance(chem["formula"], str)
        assert isinstance(chem["quantity"], int)
