from flask import Blueprint, request, jsonify, session
from flask_oidc.signals import after_authorize
from models import User, Permissions
from permission_requirements import require_full_access
from database import db
from oidc import oidc

users = Blueprint("users", __name__)


def on_authorize(token):
    """
    Signal handler for user authorization via OIDC.

    If the user does not already exist in the database, creates a new user with
    'Visitor' permissions and marks them as active.

    Parameters:
        token: The token returned by the OIDC provider.
    """
    user_info = token.get("userinfo")
    visitor_permission = (
        db.session.query(Permissions).filter_by(Permissions_Name="Visitor").first()
    )

    if (
        not db.session.query(User)
        .filter(User.User_Name == user_info["preferred_username"])
        .first()
    ):
        print("Creating new user")
        user = User(
            User_Name=user_info["preferred_username"],
            Is_Active=True,
            permissions=visitor_permission,
            User_Password="Managed by Auth server",
        )
        db.session.add(user)
        db.session.commit()


after_authorize.connect(on_authorize)


@users.route("/api/user", methods=["GET"])
@oidc.require_login
def get_current_user():
    """
    Retrieves the currently authenticated user's name and access level.

    Returns:
        JSON response with user's name and permission level.
        401 if user is not found in the database.
    """
    current_username = session["oidc_auth_profile"].get("preferred_username")
    user = db.session.query(User).filter_by(User_Name=current_username).first()
    if not user:
        return jsonify({"error": "User not found"}), 401
    return jsonify(
        {
            "name": session["oidc_auth_profile"].get("name"),
            "access": user.permissions.Permissions_Name,
        }
    )


@users.route("/api/get_users", methods=["GET"])
@oidc.require_login
@require_full_access
def get_users():
    """
    Retrieves a list of all active users and their access levels.

    Returns:
        JSON array with user ID, username, and access level.
    """
    users = db.session.query(User).filter_by(Is_Active=True).all()
    return jsonify(
        [
            {
                "id": user.User_ID,
                "username": user.User_Name,
                "access": user.permissions.Permissions_Name,
            }
            for user in users
        ]
    )


@users.route("/api/users/update_access", methods=["POST"])
@oidc.require_login
@require_full_access
def update_access():
    """
    Updates a user's access level based on the provided user ID and new access name.

    Returns:
        JSON message indicating success.
    """
    user_id = request.json.get("user_id")
    access = request.json.get("access")

    user = db.session.query(User).filter_by(User_ID=user_id).first()
    user.permissions = (
        db.session.query(Permissions).filter_by(Permissions_Name=access).first()
    )
    db.session.commit()

    return {"message": "Access updated successfully"}


@users.route("/api/users/delete", methods=["DELETE"])
@oidc.require_login
@require_full_access
def delete_user():
    """
    Deletes a user based on the provided user ID.

    Returns:
        404 if the user is not found.
        JSON message indicating success otherwise.
    """
    user_id = request.json.get("user_id")

    user = db.session.query(User).filter_by(User_ID=user_id).first()
    if not user:
        return jsonify({"error": "User not found"}), 404

    db.session.delete(user)
    db.session.commit()

    return {"message": "User deleted successfully"}
