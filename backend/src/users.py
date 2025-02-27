from flask import Blueprint, request, jsonify
users = Blueprint('users', __name__)

# NOT IMPLEMENTED!
@users.route('/api/user', methods=['GET'])
def get_current_user():
    # Will replace in the auth-fixes branch
    return jsonify({"name": "whoever you are", "access": "admin"})

@users.route('/api/get_users', methods=['GET'])
def get_users():
    # Will replace in the auth-fixes branch
    return jsonify([
    {
      "id": 1,
      "username": "sally student",
      "access": "student",
    },
    {
      "id": 2,
      "username": "steven student",
      "access": "student",
    },
    {
      "id": 3,
      "username": "paul professor",
      "access": "admin",
    },
  ])

@users.route('/api/users/update_access', methods=['POST'])
def update_access():
    user_id = request.json.get("user_id")
    access = request.json.get("access")

    # TODO: IMPLEMENT THIS! (And make sure user is an admin)

    return {"message": "Access updated successfully"}