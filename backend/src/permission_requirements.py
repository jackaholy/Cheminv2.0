
from functools import wraps
from flask import session, abort
from models import db, User, Permissions

# Mostly implemented using ChatGPT
def require_editor(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        # Retrieve the username from the OIDC auth profile in the session
        profile = session.get("oidc_auth_profile", {})
        username = profile.get("preferred_username")
        
        if not username:
            # No username found in session; reject the request.
            abort(403, "Access denied: No user information available.")
        
        # Look up the user in the database.
        user = db.session.query(User).filter_by(User_Name=username).first()
        if not user:
            abort(403, "Access denied: User not found.")
        
        # Check if the user has admin privileges.
        # In our permissions, a user with Permissions_ID of 1 has "Full Access".
        if user.permissions.Permissions_Name != "Editor" and  user.permissions.Permissions_Name != "Full Access":
            abort(403, "Access denied: Editor or higher privileges required.")
        
        # If all checks pass, call the original function.
        return func(*args, **kwargs)
    
    return wrapper

def require_full_access(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        # Retrieve the username from the OIDC auth profile in the session
        profile = session.get("oidc_auth_profile", {})
        username = profile.get("preferred_username")
        
        if not username:
            # No username found in session; reject the request.
            abort(403, "Access denied: No user information available.")
        
        # Look up the user in the database.
        user = db.session.query(User).filter_by(User_Name=username).first()
        if not user:
            abort(403, "Access denied: User not found.")
        
        # Check if the user has admin privileges.
        # In our permissions, a user with Permissions_ID of 1 has "Full Access".
        if user.permissions.Permissions_Name != "Full Access":
            abort(403, "Access denied: Full access required.")
        
        # If all checks pass, call the original function.
        return func(*args, **kwargs)
    
    return wrapper
