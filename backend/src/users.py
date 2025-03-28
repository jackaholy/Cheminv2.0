from flask import Blueprint, request, jsonify, session
from flask_oidc.signals import after_authorize
from models import User, Permissions
from permission_requirements import require_full_access
from database import db
from oidc import oidc

users = Blueprint("users", __name__)


def on_authorize(sender, token, return_to):
    user_info = token.get("userinfo")
    visitor_permission = (
        db.session.query(Permissions).filter_by(Permissions_Name="Visitor").first()
    )
    # admin_permission = (
    #    db.session.query(Permissions).filter_by(Permissions_Name="Full Access").first()
    # )

    # if db.session.query(User).count() == 0:
    #    permission_level = admin_permission
    # else:
    #    permission_level = visitor_permission

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
    current_username = session["oidc_auth_profile"].get("preferred_username")
    user = db.session.query(User).filter_by(User_Name=current_username).first()

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
    user_id = request.json.get("user_id")
    access = request.json.get("access")

    user = db.session.query(User).filter_by(User_ID=user_id).first()
    user.permissions = (
        db.session.query(Permissions).filter_by(Permissions_Name=access).first()
    )
    db.session.commit()

    return {"message": "Access updated successfully"}
