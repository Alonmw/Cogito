# backend/app/auth/routes.py
# v3: Added Refresh Token generation and /refresh endpoint

from flask import Blueprint, request, jsonify, current_app
# --- Import create_refresh_token, jwt_required, get_jwt_identity ---
from flask_jwt_extended import (
    create_access_token,
    create_refresh_token,
    jwt_required,
    get_jwt_identity
)
# --- End Import ---
from ..extensions import db, bcrypt
from ..models import User

# Create Blueprint
auth_bp = Blueprint('auth', __name__, url_prefix='/auth')

@auth_bp.route('/register', methods=['POST'])
def register():
    """Handles user registration."""
    # --- (Keep existing registration logic as in backend_auth_login_jwt_v2) ---
    try:
        data = request.get_json()
        if not data: return jsonify({"error": "Invalid JSON request body"}), 400
        username = data.get('username')
        password = data.get('password')
        if not username or not password: return jsonify({"error": "Missing username or password"}), 400
        if len(password) < 8: return jsonify({"error": "Password must be at least 8 characters long"}), 400
        existing_user = User.query.filter_by(username=username).first()
        if existing_user: return jsonify({"error": "Username already exists"}), 409
        hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')
        new_user = User(username=username, password_hash=hashed_password)
        db.session.add(new_user)
        db.session.commit()
        return jsonify({"message": f"User '{username}' registered successfully"}), 201
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error during registration for username {username}: {e}", exc_info=True)
        return jsonify({"error": "An internal server error occurred during registration."}), 500


@auth_bp.route('/login', methods=['POST'])
def login():
    """Handles user login and returns JWT access and refresh tokens."""
    try:
        data = request.get_json()
        if not data: return jsonify({"error": "Invalid JSON request body"}), 400
        username = data.get('username')
        password = data.get('password')
        if not username or not password: return jsonify({"error": "Missing username or password"}), 400

        # Find user
        user = User.query.filter_by(username=username).first()

        # Verify password
        if user and bcrypt.check_password_hash(user.password_hash, password):
            current_app.logger.info(f"Password verified for user: {username}")
            user_identity = str(user.id) # Use string identity

            # --- Generate Access and Refresh Tokens ---
            access_token = create_access_token(identity=user_identity)
            refresh_token = create_refresh_token(identity=user_identity)
            # --- End Token Generation ---

            # Return both tokens to the client
            return jsonify(access_token=access_token, refresh_token=refresh_token), 200
        else:
            # Invalid credentials
            current_app.logger.warning(f"Failed login attempt for username: {username}")
            return jsonify({"error": "Invalid username or password"}), 401

    except Exception as e:
        current_app.logger.error(f"Error during login for username {username}: {e}", exc_info=True)
        return jsonify({"error": "An internal server error occurred during login."}), 500


# --- New Refresh Endpoint ---
@auth_bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True) # Require a valid REFRESH token for this endpoint
def refresh():
    """Refreshes an expired access token using a refresh token."""
    try:
        # Get the identity from the valid refresh token
        current_user_id = get_jwt_identity()
        # Create a new access token (non-fresh)
        new_access_token = create_access_token(identity=current_user_id, fresh=False)
        current_app.logger.info(f"Access token refreshed for user ID: {current_user_id}")
        return jsonify(access_token=new_access_token), 200
    except Exception as e:
        current_app.logger.error(f"Error during token refresh: {e}", exc_info=True)
        return jsonify({"error": "An internal server error occurred during token refresh."}), 500
# --- End Refresh Endpoint ---
