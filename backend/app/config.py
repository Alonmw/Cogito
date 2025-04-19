# backend/app/config.py
# v2: Added JWT expiration times

import os
from dotenv import load_dotenv
from datetime import timedelta # <-- Import timedelta

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
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL')
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # --- CORS ---
    ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "*")

    # --- OpenAI ---
    OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
    # Optional: Add configurable OpenAI settings
    # OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-4-turbo")
    # OPENAI_TEMPERATURE = float(os.getenv("OPENAI_TEMPERATURE", 0.7))
    # OPENAI_MAX_TOKENS = int(os.getenv("OPENAI_MAX_TOKENS", 100))


    # --- App Specific ---
    MAX_HISTORY_MSGS = 20
    PROMPT_FILE_PATH = os.path.join(os.path.abspath(os.path.dirname(__file__)), '..', 'prompt.txt')

    # --- JWT Configuration ---
    # Set expiration times for access and refresh tokens
    # Use timedelta for easy time specification
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=1) # Example: Access tokens expire after 1 hour
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=30) # Example: Refresh tokens expire after 30 days
    # Other JWT settings can go here (e.g., JWT_TOKEN_LOCATION = ['headers'])

