import logging
from flask import Blueprint, request, jsonify, session
from flask_oidc.signals import after_authorize
from models import User, Permissions
from permission_requirements import require_full_access
from database import db
from oidc import oidc

logger = logging.getLogger(__name__)

users = Blueprint("users", __name__)


def on_authorize(sender, token, return_to):
    """
    Signal handler for user authorization via OIDC.

    If the user does not already exist in the database, creates a new user with
    'Visitor' permissions and marks them as active.

    Parameters:
        token: The token returned by the OIDC provider.
    """
    user_info = token.get("userinfo")
    logger.info(
        "Authorization signal received for user: %s", user_info["preferred_username"]
    )
    visitor_permission = (
        db.session.query(Permissions).filter_by(Permissions_Name="Visitor").first()
    )

    if (
        not db.session.query(User)
        .filter(User.User_Name == user_info["preferred_username"])
        .first()
    ):
        logger.info(f"Creating new user {user_info['preferred_username']}")
        user = User(
            User_Name=user_info["preferred_username"],
            Is_Active=True,
            permissions=visitor_permission,
            User_Password="Managed by Auth server",
        )
        db.session.add(user)
        db.session.commit()
        logger.info(f"User {user_info['preferred_username']} created successfully.")
    else:
        logger.info(f"User {user_info['preferred_username']} already exists.")


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
    logger.info(f"Retrieving user {current_username}")
    user = db.session.query(User).filter_by(User_Name=current_username).first()
    if not user:
        logger.warning(f"User {current_username} not found.")
        return jsonify({"error": "User not found"}), 401
    logger.info(f"User {current_username} retrieved successfully.")
    if not user.permissions:
        logger.warning(f"User {current_username} has no permissions.")
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
    logger.info("Fetching all active users")
    users = db.session.query(User).filter_by(Is_Active=True).all()
    logger.info("Total active users retrieved: %d", len(users))
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
        JSON message indicating success or error.
    """
    user_id = request.json.get("user_id")
    access = request.json.get("access")
    modifying_user = session["oidc_auth_profile"].get("preferred_username")

    logger.info(
        "User %s is updating access for user ID: %d to access level: %s",
        modifying_user,
        user_id,
        access,
    )

    # Validate user ID
    user = db.session.query(User).filter_by(User_ID=user_id).first()
    if not user:
        logger.warning(
            "User ID %d not found for access update by user: %s",
            user_id,
            modifying_user,
        )
        return jsonify({"error": "User not found"}), 404

    # Validate access level
    new_permission = (
        db.session.query(Permissions).filter_by(Permissions_Name=access).first()
    )
    if not new_permission:
        logger.warning(
            "Invalid access level: %s provided by user: %s", access, modifying_user
        )
        return jsonify({"error": "Invalid access level"}), 400

    user.permissions = new_permission
    db.session.commit()
    logger.info(
        "Access updated successfully for user ID: %d by user: %s",
        user_id,
        modifying_user,
    )

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
    deleting_user = session["oidc_auth_profile"].get("preferred_username")

    logger.info("User %s is attempting to delete user ID: %d", deleting_user, user_id)

    # Validate user ID
    user = db.session.query(User).filter_by(User_ID=user_id).first()
    if not user:
        logger.warning(
            "User not found for deletion: %d by user: %s", user_id, deleting_user
        )
        return jsonify({"error": "User not found"}), 404

    db.session.delete(user)
    db.session.commit()
    logger.info("User ID: %d deleted successfully by user: %s", user_id, deleting_user)

    return {"message": "User deleted successfully"}
