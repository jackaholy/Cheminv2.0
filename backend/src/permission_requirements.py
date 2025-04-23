import logging
from functools import wraps
from flask import session, abort
from database import db
from models import User

# Configure logging
logger = logging.getLogger(__name__)

def require_editor(func):
    """
    Decorator to enforce that the user has at least "Editor" permissions.

    This decorator checks the user's session for a valid username and retrieves the user's
    permissions from the database. If the user does not have "Editor" or "Full Access" permissions,
    the request is aborted with a 403 status code.

    :param func: The function to wrap with the permission check.
    :return: The wrapped function if the user passes the permission check.
    """
    @wraps(func)
    def wrapper(*args, **kwargs):
        profile = session.get("oidc_auth_profile", {})
        username = profile.get("preferred_username")
        logger.info(f"require_editor: Checking permissions for user: {username}")

        if not username:
            logger.warning("require_editor: No username found in session.")
            abort(403, "Access denied: No user information available.")

        user = db.session.query(User).filter_by(User_Name=username).first()
        if not user:
            logger.warning(f"require_editor: User {username} not found in database.")
            abort(403, "Access denied: User not found.")
        if not user.permissions:
            logger.warning(f"require_editor: User {username} has no permissions.")
            abort(403, "Access denied: User has no permissions.")
        if (
            user.permissions.Permissions_Name != "Editor"
            and user.permissions.Permissions_Name != "Full Access"
        ):
            logger.warning(
                f"require_editor: User {username} lacks required permissions. "
                f"Current permission: {user.permissions.Permissions_Name}"
            )
            abort(403, "Access denied: Editor or higher privileges required.")

        logger.info(f"require_editor: User {username} passed permission checks.")
        return func(*args, **kwargs)

    return wrapper


def require_full_access(func):
    """
    Decorator to enforce that the user has "Full Access" permissions.

    This decorator checks the user's session for a valid username and retrieves the user's
    permissions from the database. If the user does not have "Full Access" permissions,
    the request is aborted with a 403 status code.

    :param func: The function to wrap with the permission check.
    :return: The wrapped function if the user passes the permission check.
    """
    @wraps(func)
    def wrapper(*args, **kwargs):
        profile = session.get("oidc_auth_profile", {})
        username = profile.get("preferred_username")
        logger.info(f"require_full_access: Checking permissions for user: {username}")

        if not username:
            logger.warning("require_full_access: No username found in session.")
            abort(403, "Access denied: No user information available.")

        user = db.session.query(User).filter_by(User_Name=username).first()
        if not user:
            logger.warning(f"require_full_access: User {username} not found in database.")
            abort(403, "Access denied: User not found.")
        if not user.permissions:
            logger.warning(f"require_full_access: User {username} has no permissions.")
            abort(403, "Access denied: User has no permissions.")
        if user.permissions.Permissions_Name != "Full Access":
            logger.warning(
                f"require_full_access: User {username} lacks required permissions. "
                f"Current permission: {user.permissions.Permissions_Name}"
            )
            abort(403, "Access denied: Full access required.")

        logger.info(f"require_full_access: User {username} passed permission checks.")
        return func(*args, **kwargs)

    return wrapper
