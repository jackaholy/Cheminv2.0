
def test_get_storage_classes(client):
    # Send GET request to the API endpoint
    response = client.get("/api/storage_classes")
    # Assert the response status code
    assert response.status_code == 200
    # Parse the JSON response
    storage_classes = response.json

    # Assert all expected storage classes are present
    assert len(storage_classes) == 6

    # Assert specific storage classes by name and ID
    assert any(sc["id"] == 1 and sc["name"] == "Flammable" for sc in storage_classes)
    assert any(sc["id"] == 2 and sc["name"] == "Corrosive" for sc in storage_classes)
    assert any(sc["id"] == 3 and sc["name"] == "Toxic" for sc in storage_classes)
    assert any(sc["id"] == 4 and sc["name"] == "Reactive" for sc in storage_classes)
    assert any(sc["id"] == 5 and sc["name"] == "Oxidizer" for sc in storage_classes)
    assert any(sc["id"] == 6 and sc["name"] == "Unclassified" for sc in storage_classes)

    # Ensure all storage classes have non-empty names
    assert all("name" in sc and sc["name"] for sc in storage_classes)

    # Ensure IDs are unique
    ids = [sc["id"] for sc in storage_classes]
    assert len(ids) == len(set(ids))
