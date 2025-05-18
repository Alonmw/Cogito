# backend/app/config.py
# v3: Removed JWT config

import os
from dotenv import load_dotenv
from datetime import timedelta # Keep timedelta if used elsewhere, otherwise remove

# Load .env file from the parent directory (backend/) relative to this file (backend/app/)
dotenv_path = os.path.join(os.path.dirname(__file__), '..', '.env')
load_dotenv(dotenv_path=dotenv_path)

class Config:
    """Base configuration settings."""
    # --- Secret Keys ---
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-fallback-secret-key') # Still needed for Flask session/flash etc.
    # Removed: JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'dev-fallback-jwt-secret-key')

    # --- Database ---
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL')
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # --- CORS ---
    ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "*")

    # --- OpenAI ---
    OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

    # --- App Specific ---
    MAX_HISTORY_MSGS = 20
    PROMPT_FILE_PATH = os.path.join(os.path.abspath(os.path.dirname(__file__)), '..', 'socrates_prompt.txt')

