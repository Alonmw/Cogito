# backend/app/auth/routes.py
# v2: Ensure JWT identity is a string

from flask import Blueprint, request, jsonify, current_app
# --- Import create_access_token ---
from flask_jwt_extended import create_access_token
# --- End Import ---
from ..extensions import db, bcrypt
from ..models import User

# Create Blueprint
auth_bp = Blueprint('auth', __name__, url_prefix='/auth')

@auth_bp.route('/register', methods=['POST'])
def register():
    """Handles user registration."""
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "Invalid JSON request body"}), 400

        username = data.get('username')
        password = data.get('password')

        # Basic Input Validation
        if not username or not password:
            return jsonify({"error": "Missing username or password"}), 400
        if len(password) < 8:
             return jsonify({"error": "Password must be at least 8 characters long"}), 400

        # Check if user already exists
        existing_user = User.query.filter_by(username=username).first()
        if existing_user:
            return jsonify({"error": "Username already exists"}), 409

        # Hash the password
        hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')

        # Create and save the new user
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
    """Handles user login and returns JWT."""
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "Invalid JSON request body"}), 400

        username = data.get('username')
        password = data.get('password')

        if not username or not password:
            return jsonify({"error": "Missing username or password"}), 400

        # Find user
        user = User.query.filter_by(username=username).first()

        # Verify password
        if user and bcrypt.check_password_hash(user.password_hash, password):
            # Password matches! Generate JWT access token.
            current_app.logger.info(f"Password verified for user: {username}")

            # --- Generate JWT with STRING identity ---
            # Convert user.id to string before creating token
            user_identity = str(user.id)
            access_token = create_access_token(identity=user_identity)
            # --- End JWT Generation ---

            # Return the token to the client
            return jsonify(access_token=access_token), 200 # Return 200 OK with token
        else:
            # Invalid credentials
            current_app.logger.warning(f"Failed login attempt for username: {username}")
            return jsonify({"error": "Invalid username or password"}), 401 # 401 Unauthorized

    except Exception as e:
        current_app.logger.error(f"Error during login for username {username}: {e}", exc_info=True)
        return jsonify({"error": "An internal server error occurred during login."}), 500

# Add other auth routes like /refresh, /logout later if needed
