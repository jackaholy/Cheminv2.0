import pytest
from database import db
from models import User


def test_get_users_success(client):
    """
    Test retrieving all active users.
    """
    # Send GET request to the endpoint
    response = client.get("/api/get_users")
    assert response.status_code == 200

    # Parse the JSON response
    data = response.json

    # Assert that all returned users are active
    assert len(data) > 0
    for user in data:
        db_user = db.session.query(User).filter_by(User_ID=user["id"]).first()
        assert db_user is not None
        assert db_user.Is_Active is True

    # Check that usernames and access levels are correct
    for user in data:
        db_user = db.session.query(User).filter_by(User_ID=user["id"]).first()
        assert user["username"] == db_user.User_Name
        assert user["access"] == db_user.permissions.Permissions_Name
