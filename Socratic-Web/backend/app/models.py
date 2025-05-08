# backend/app/models.py
# Added Conversation and Message models for chat history

from .extensions import db # Assuming db = SQLAlchemy() is initialized in extensions.py
from datetime import datetime, timezone

# --- User Model ---
# Define or update your User model to include firebase_uid
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    # Firebase UID is the key link to Firebase Auth. Make it unique and indexed.
    firebase_uid = db.Column(db.String(128), unique=True, nullable=False, index=True)
    email = db.Column(db.String(120), unique=True, nullable=True, index=True) # Optional, can get from token
    display_name = db.Column(db.String(80), nullable=True) # Optional
    created_at = db.Column(db.DateTime, nullable=False, default=lambda: datetime.now(timezone.utc))

    # Relationship to conversations initiated by the user
    # lazy='dynamic' allows querying conversations without loading all messages immediately
    conversations = db.relationship('Conversation', backref='user', lazy='dynamic', cascade="all, delete-orphan")

    def __repr__(self):
        return f'<User {self.firebase_uid}>'


# --- Conversation Model ---
# Represents a single chat session
class Conversation(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    # Foreign key linking to the User table
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False, index=True)
    # Optional: Store a title, maybe derived from the first message
    title = db.Column(db.String(100), nullable=True)
    created_at = db.Column(db.DateTime, nullable=False, default=lambda: datetime.now(timezone.utc))
    # updated_at is crucial for sorting history lists
    updated_at = db.Column(db.DateTime, nullable=False, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), index=True)

    # Relationship to messages within this conversation
    # Order messages by timestamp when accessed
    messages = db.relationship('Message', backref='conversation', lazy='dynamic', order_by='Message.timestamp', cascade="all, delete-orphan")

    def __repr__(self):
        return f'<Conversation {self.id} by User {self.user_id}>'

    # Helper to get a summary of messages (optional)
    def get_message_summary(self, count=5):
        # Example: Get first few messages for a preview
        return self.messages.limit(count).all()


# --- Message Model ---
# Represents a single message (user or assistant) within a conversation
class Message(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    # Foreign key linking to the Conversation table
    conversation_id = db.Column(db.Integer, db.ForeignKey('conversation.id'), nullable=False, index=True)
    # Role of the sender ('user' or 'assistant')
    role = db.Column(db.String(10), nullable=False) # 'user' or 'assistant'
    # The actual text content of the message
    content = db.Column(db.Text, nullable=False)
    # Timestamp of when the message was created/saved
    timestamp = db.Column(db.DateTime, nullable=False, default=lambda: datetime.now(timezone.utc), index=True)

    def __repr__(self):
        return f'<Message {self.id} in Conv {self.conversation_id} Role {self.role}>'

