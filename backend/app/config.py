# backend/app/config.py
import os
from dotenv import load_dotenv

# Load .env file from the parent directory (backend/) relative to this file (backend/app/)
dotenv_path = os.path.join(os.path.dirname(__file__), '..', '.env')
load_dotenv(dotenv_path=dotenv_path)

class Config:
    """Base configuration settings."""
    # --- Secret Keys ---
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-fallback-secret-key')
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'dev-fallback-jwt-secret-key')

    # --- Database ---
    # Load from environment ONLY. Default will be set in create_app using instance_path.
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL') # No default here
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # --- CORS ---
    ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "*")

    # --- OpenAI ---
    OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

    # --- App Specific ---
    MAX_HISTORY_MSGS = 20
    PROMPT_FILE_PATH = os.path.join(os.path.abspath(os.path.dirname(__file__)), '..', 'prompt.txt')

    # --- JWT Configuration (Optional: Customize expiration) ---
    # from datetime import timedelta
    # JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=1)
    # JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=30)

