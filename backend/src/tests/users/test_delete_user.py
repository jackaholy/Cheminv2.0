import pytest
from database import db
from models import User


def test_delete_user_success(client):
    """
    Test deleting a user with a valid ID.
    """
    # Fetch an existing user
    user = db.session.query(User).filter_by(User_Name="anne-admin@example.com").first()
    assert user is not None

    # Send DELETE request to delete the user
    response = client.delete(
        "/api/users/delete",
        json={"user_id": user.User_ID},
    )
    assert response.status_code == 200

    # Parse the JSON response
    data = response.json
    assert data["message"] == "User deleted successfully"

    # Verify the user is deleted from the database
    deleted_user = db.session.query(User).filter_by(User_ID=user.User_ID).first()
    assert deleted_user is None


def test_delete_user_not_found(client):
    """
    Test deleting a user that does not exist.
    """
    # Send DELETE request with a non-existent user ID
    response = client.delete(
        "/api/users/delete",
        json={"user_id": 99999},
    )
    assert response.status_code == 404

    # Parse the JSON response
    data = response.json
    assert data["error"] == "User not found"
