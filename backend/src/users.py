import logging
from flask import Blueprint, request, jsonify, session
from flask_oidc.signals import after_authorize
from models import User, Permissions
from permission_requirements import require_full_access
from database import db
from oidc import oidc

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

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
    logger.info(f"on_authorize: Authorizing user {user_info['preferred_username']}")
    visitor_permission = (
        db.session.query(Permissions).filter_by(Permissions_Name="Visitor").first()
    )

    if (
        not db.session.query(User)
        .filter(User.User_Name == user_info["preferred_username"])
        .first()
    ):
        logger.info(f"on_authorize: Creating new user {user_info['preferred_username']}")
        user = User(
            User_Name=user_info["preferred_username"],
            Is_Active=True,
            permissions=visitor_permission,
            User_Password="Managed by Auth server",
        )
        db.session.add(user)
        db.session.commit()
        logger.info(f"on_authorize: User {user_info['preferred_username']} created successfully.")
    else:
        logger.info(f"on_authorize: User {user_info['preferred_username']} already exists.")


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
    logger.info(f"get_current_user: Retrieving user {current_username}")
    user = db.session.query(User).filter_by(User_Name=current_username).first()
    if not user:
        logger.warning(f"get_current_user: User {current_username} not found.")
        return jsonify({"error": "User not found"}), 401
    logger.info(f"get_current_user: User {current_username} retrieved successfully.")
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
    logger.info("get_users: Retrieving all active users.")
    users = db.session.query(User).filter_by(Is_Active=True).all()
    logger.info(f"get_users: Retrieved {len(users)} active users.")
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
    logger.info(f"update_access: Updating access for user ID {user_id} to {access}")

    user = db.session.query(User).filter_by(User_ID=user_id).first()
    if not user:
        logger.warning(f"update_access: User ID {user_id} not found.")
        return {"error": "User not found"}, 404

    user.permissions = (
        db.session.query(Permissions).filter_by(Permissions_Name=access).first()
    )
    db.session.commit()
    logger.info(f"update_access: Access for user ID {user_id} updated to {access}.")
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
    logger.info(f"delete_user: Deleting user ID {user_id}")

    user = db.session.query(User).filter_by(User_ID=user_id).first()
    if not user:
        logger.warning(f"delete_user: User ID {user_id} not found.")
        return jsonify({"error": "User not found"}), 404

    db.session.delete(user)
    db.session.commit()
    logger.info(f"delete_user: User ID {user_id} deleted successfully.")
    return {"message": "User deleted successfully"}
