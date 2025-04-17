def test_get_chemicals(client):
    # Send GET request to the API endpoint
    response = client.get("/api/get_chemicals")
    # Assert the response status code
    assert response.status_code == 200
    # Parse the JSON response
    data = response.json

    # Assert the number of chemicals returned
    assert len(data) == 11

    # Check one of the chemicals for expected values
    acetone = next((chem for chem in data if chem["chemical_name"] == "Acetone"), None)
    assert acetone is not None
    assert acetone["formula"] == "C3H6O"
    assert acetone["quantity"] == 1
    assert acetone["storage_class"] == "Flammable"
    assert len(acetone["inventory"]) == 2
    # There should be at least one live inventory item
    assert any(item["dead"] is False for item in acetone["inventory"])

    # Check a chemical with no inventory
    silver_nitrate = next((chem for chem in data if chem["chemical_name"] == "Silver Nitrate"), None)
    assert silver_nitrate is not None
    assert silver_nitrate["quantity"] == 0
    assert silver_nitrate["inventory"] == []

    # Check for correct classification
    corrosives = [chem for chem in data if chem["storage_class"] == "Corrosive"]
    assert any(chem["chemical_name"] == "Sulfuric Acid" for chem in corrosives)
    assert any(chem["chemical_name"] == "Sodium Hydroxide" for chem in corrosives)
    assert any(chem["chemical_name"] == "Hydrochloric Acid" for chem in corrosives)

    # Check that all chemicals have a formula
    assert all("formula" in chem and chem["formula"] for chem in data)

    # Ensure that the number of live inventory items match the reported quantity
    for chem in data:
        live_items = [inv for inv in chem["inventory"] if not inv["dead"]]
        assert len(live_items) == chem["quantity"]
