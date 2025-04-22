# backend/app/models.py
# v2: Removed password_hash field

from .extensions import db

class User(db.Model):
    """Model for user accounts."""
    id = db.Column(db.Integer, primary_key=True) # Keep internal ID for now
    username = db.Column(db.String(80), unique=True, nullable=False)
    # password_hash = db.Column(db.String(128), nullable=False) # <-- REMOVED
    # Consider adding firebase_uid later:
    # firebase_uid = db.Column(db.String(128), unique=True, nullable=False, index=True)

    def __repr__(self):
        return f'<User {self.username}>'

# Add other models here later if needed
