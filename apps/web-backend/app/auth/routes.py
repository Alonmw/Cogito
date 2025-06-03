# backend/app/auth/routes.py
# Routes removed as Firebase handles login/register on frontend

from flask import Blueprint, request, jsonify
import firebase_admin
from firebase_admin import auth
import logging

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

@auth_bp.route('/delete_account', methods=['DELETE'])
def delete_account():
    """
    Delete user account from Firebase Authentication
    Expects Authorization header with Firebase ID token
    """
    try:
        # Get the authorization header
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({"error": "Missing or invalid authorization header"}), 401
        
        # Extract the ID token
        id_token = auth_header.split('Bearer ')[1]
        
        # Verify the ID token
        decoded_token = auth.verify_id_token(id_token)
        uid = decoded_token['uid']
        
        # Delete the user from Firebase Authentication
        auth.delete_user(uid)
        
        # TODO: Delete any user data from local database if you have one
        # Example:
        # db.session.query(User).filter_by(firebase_uid=uid).delete()
        # db.session.commit()
        
        logging.info(f"Successfully deleted user account: {uid}")
        return jsonify({"message": "Account deleted successfully"}), 200
        
    except auth.InvalidIdTokenError:
        return jsonify({"error": "Invalid ID token"}), 401
    except auth.UserNotFoundError:
        return jsonify({"error": "User not found"}), 404
    except Exception as e:
        logging.error(f"Error deleting user account: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500

