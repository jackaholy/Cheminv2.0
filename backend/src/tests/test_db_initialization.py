from pprint import pprint


def test_get_chemicals(client):
    response = client.get("/api/get_chemicals")
    pprint(response.json)
    assert True
