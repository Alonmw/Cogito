# backend/app/auth/routes.py
# Routes removed as Firebase handles login/register on frontend

from flask import Blueprint # Keep Blueprint definition

# Create Blueprint
auth_bp = Blueprint('auth', __name__, url_prefix='/auth')

# No routes defined here for now.
# We might add routes later, e.g., a route for the frontend
# to send a verified Firebase ID token to create/update a user
# profile in our local database if needed.

# Example placeholder:
# @auth_bp.route('/sync_user', methods=['POST'])
# @jwt_required() # This would use a Firebase token verification decorator later
# def sync_user():
#     # Logic to get Firebase UID from token and create/update local user profile
#     return jsonify({"message": "User sync endpoint placeholder"}), 200

