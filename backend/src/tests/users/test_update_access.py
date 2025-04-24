import pytest
from database import db
from models import User, Permissions


def test_update_access_success(client):
    """
    Test updating a user's access level with valid input.
    """
    # Fetch an existing user and a new permission
    user = db.session.query(User).filter_by(User_Name="anne-admin@example.com").first()
    new_permission = db.session.query(Permissions).filter_by(Permissions_Name="Editor").first()
    assert user is not None
    assert new_permission is not None

    # Send POST request to update access
    response = client.post(
        "/api/users/update_access",
        json={"user_id": user.User_ID, "access": "Editor"},
    )
    assert response.status_code == 200

    # Parse the JSON response
    data = response.json
    assert data["message"] == "Access updated successfully"

    # Verify the user's access level is updated in the database
    updated_user = db.session.query(User).filter_by(User_ID=user.User_ID).first()
    assert updated_user.permissions.Permissions_Name == "Editor"


def test_update_access_invalid_user(client):
    """
    Test updating access for a non-existent user.
    """
    # Send POST request with an invalid user ID
    response = client.post(
        "/api/users/update_access",
        json={"user_id": 99999, "access": "Editor"},
    )
    assert response.status_code == 404


def test_update_access_invalid_permission(client):
    """
    Test updating access with a non-existent permission.
    """
    # Fetch an existing user
    user = db.session.query(User).filter_by(User_Name="anne-admin@example.com").first()
    assert user is not None

    # Send POST request with an invalid permission
    response = client.post(
        "/api/users/update_access",
        json={"user_id": user.User_ID, "access": "InvalidPermission"},
    )
    assert response.status_code == 400
