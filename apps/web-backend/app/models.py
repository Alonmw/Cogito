# backend/app/models.py
# v3: Made DateTime columns timezone-aware

from .extensions import db # Assuming db = SQLAlchemy() is initialized in extensions.py
from datetime import datetime, timezone

# --- User Model ---
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    firebase_uid = db.Column(db.String(128), unique=True, nullable=False, index=True)
    email = db.Column(db.String(120), nullable=True, index=True)
    display_name = db.Column(db.String(80), nullable=True)
    # --- Add timezone=True ---
    created_at = db.Column(db.DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc))
    # --- End Change ---

    conversations = db.relationship('Conversation', backref='user', lazy='dynamic', cascade="all, delete-orphan")

    def __repr__(self):
        return f'<User {self.firebase_uid}>'


# --- Conversation Model ---
class Conversation(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False, index=True)
    title = db.Column(db.String(100), nullable=True)
    persona_id = db.Column(db.String(50), nullable=False, default='socrates', index=True)
    # --- Add timezone=True ---
    created_at = db.Column(db.DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), index=True)
    # --- End Change ---

    messages = db.relationship('Message', backref='conversation', lazy='dynamic', order_by='Message.timestamp', cascade="all, delete-orphan")

    def __repr__(self):
        return f'<Conversation {self.id} by User {self.user_id}>'

    def get_message_summary(self, count=5):
        return self.messages.limit(count).all()


# --- Message Model ---
class Message(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    conversation_id = db.Column(db.Integer, db.ForeignKey('conversation.id'), nullable=False, index=True)
    role = db.Column(db.String(10), nullable=False)
    content = db.Column(db.Text, nullable=False)
    # --- Add timezone=True ---
    timestamp = db.Column(db.DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc), index=True)
    # --- End Change ---

    def __repr__(self):
        return f'<Message {self.id} in Conv {self.conversation_id} Role {self.role}>'

