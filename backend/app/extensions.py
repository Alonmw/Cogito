# backend/app/extensions.py
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager
from flask_cors import CORS

# Create extension instances without initializing them with the app yet
db = SQLAlchemy()
bcrypt = Bcrypt()
jwt = JWTManager()
cors = CORS() # CORS instance
