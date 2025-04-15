import pytest


@pytest.mark.parametrize(
    "chemical_name, expected_status, expected_data",
    [
        # Valid chemical name
        (
            "Acetone",
            200,
            {
                "chemical_id": 1,
                "chemical_name": "Acetone",
                "chemical_formula": "C3H6O",
                "storage_class": "Flammable",
            },
        ),
        # Valid chemical name with different casing
        ("acetone", 404, {}),  # Case-sensitive search
        # Non-existent chemical name
        ("NonExistentChemical", 404, {}),
        # Empty chemical name
        ("", 404, {}),
        # Chemical name with special characters
        ("Acetone!", 404, {}),
    ],
)
def test_chemical_name_lookup(client, chemical_name, expected_status, expected_data):
    """
    Test the chemical name lookup endpoint with various inputs.
    """
    response = client.get(
        f"/api/chemicals/chemical_name_lookup?chemical_name={chemical_name}"
    )
    assert response.status_code == expected_status
    assert response.json == expected_data


def test_chemical_name_lookup_missing_param(client):
    """
    Test the chemical name lookup endpoint when the parameter is missing.
    """
    response = client.get("/api/chemicals/chemical_name_lookup")
    assert response.status_code == 400
    assert response.json == {"error": "Missing chemical_name"}


def test_chemical_name_lookup_partial_match(client):
    """
    Test that partial matches do not return results.
    """
    response = client.get("/api/chemicals/chemical_name_lookup?chemical_name=Acet")
    assert response.status_code == 404
    assert response.json == {}


def test_chemical_name_lookup_whitespace(client):
    """
    Test the chemical name lookup endpoint with leading/trailing whitespace.
    """
    response = client.get("/api/chemicals/chemical_name_lookup?chemical_name= Acetone ")
    assert response.status_code == 200
    assert response.json == {
        "chemical_formula": "C3H6O",
        "chemical_id": 1,
        "chemical_name": "Acetone",
        "storage_class": "Flammable",
    }
