import pytest
from flask import session
from database import db
from models import User, Permissions


def test_get_current_user_success(client):
    """
    Test retrieving the currently authenticated user's details.
    """
    # Ensure the user exists in the database
    user = db.session.query(User).filter_by(User_Name="anne-admin@example.com").first()
    assert user is not None

    # Send GET request to the endpoint
    response = client.get("/api/user")
    assert response.status_code == 200

    # Parse the JSON response
    data = response.json
    assert data["name"] == "Anne Admin"
    assert data["access"] == "Full Access"