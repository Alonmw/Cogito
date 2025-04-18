# backend/app/models.py
from .extensions import db # Import db instance from extensions.py

class User(db.Model):
    """Model for user accounts."""
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False) # Store hashed passwords

    def __repr__(self):
        return f'<User {self.username}>'

# Add other models here later if needed
