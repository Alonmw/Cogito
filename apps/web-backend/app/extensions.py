# backend/app/extensions.py
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_migrate import Migrate
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

# Create extension instances without initializing them with the app yet
db = SQLAlchemy()
cors = CORS()  # CORS instance
migrate = Migrate()
bcrypt = Bcrypt()
jwt = JWTManager()

# Rate limiter - will be initialized in app/__init__.py
limiter = Limiter(
    key_func=get_remote_address,
    default_limits=["200 per day", "50 per hour"],
    storage_uri="memory://",
)
