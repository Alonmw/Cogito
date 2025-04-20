# backend/app/extensions.py
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS

# Create extension instances without initializing them with the app yet
db = SQLAlchemy()
cors = CORS() # CORS instance
