# backend/app/auth/utils.py
import firebase_admin.auth
from flask import request, current_app

def verify_token():
    """
    Verifies the Firebase ID token from the Authorization header.

    Returns:
        dict: Decoded token payload (including 'uid') if valid.
        None: If no token is present or verification fails.
    """
    id_token = None
    decoded_token = None
    user_uid = None

    try:
        # 1. Extract token from "Bearer <token>" header
        auth_header = request.headers.get('Authorization')
        if auth_header and auth_header.startswith('Bearer '):
            id_token = auth_header.split('Bearer ')[1]
        else:
            # No valid Bearer token found
            return None # Proceed as guest

        # 2. Verify token using Firebase Admin SDK
        if id_token:
            decoded_token = firebase_admin.auth.verify_id_token(id_token)
            user_uid = decoded_token.get('uid')
            if user_uid:
                 current_app.logger.info(f"Firebase token verified successfully for UID: {user_uid}")
                 return decoded_token # Return decoded payload on success
            else:
                 current_app.logger.warning("Token verified but UID missing in decoded token.")
                 return None # Treat as guest/error if UID somehow missing
        else:
            # Should have been caught earlier, but double-check
            return None

    except firebase_admin.auth.ExpiredIdTokenError:
        current_app.logger.warning("Firebase token verification failed: Token expired.")
        return None # Treat expired token as guest/unauthenticated
    except firebase_admin.auth.InvalidIdTokenError as e:
        current_app.logger.warning(f"Firebase token verification failed: Invalid token - {e}")
        return None # Treat invalid token as guest/unauthenticated
    except Exception as e:
        # Catch any other unexpected errors during verification
        current_app.logger.error(f"Unexpected error during Firebase token verification: {e}", exc_info=True)
        return None # Treat as guest/unauthenticated on unexpected errors

    return None # Default return if something goes wrong
