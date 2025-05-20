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
    SECRET_KEY = os.getenv('JWT_SECRET_KEY')
    if not SECRET_KEY:
        raise ValueError("No SECRET_KEY set for Flask application. Please set it in your environment variables.")
    # Removed: JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'dev-fallback-jwt-secret-key')

    # --- Database ---
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL')
    if not SQLALCHEMY_DATABASE_URI:
        raise ValueError("No DATABASE_URL set. Please set it in your environment variables.")

    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # --- CORS ---
    ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "*")

    # --- OpenAI ---
    OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
    if not OPENAI_API_KEY:
        raise ValueError("No OPENAI_API_KEY set. Please set it in your environment variables.")

    # --- OpenAI Model Settings ---
    OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-4-turbo")
    OPENAI_TEMPERATURE = float(os.getenv("OPENAI_TEMPERATURE", "0.7"))
    OPENAI_MAX_TOKENS = int(os.getenv("OPENAI_MAX_TOKENS", "256"))

    # --- Security Settings ---
    # Force HTTPS in production
    FORCE_HTTPS = os.getenv("FORCE_HTTPS", "True").lower() == "true"
    # Secure cookies in production
    SESSION_COOKIE_SECURE = os.getenv("SESSION_COOKIE_SECURE", "True").lower() == "true"
    # 10 minutes rate limiting window
    RATELIMIT_STORAGE_URI = os.getenv("RATELIMIT_STORAGE_URI", "memory://")
    
    # --- App Specific ---
    MAX_HISTORY_MSGS = int(os.getenv("MAX_HISTORY_MSGS", "20"))
    MAX_HISTORY_ITEMS = int(os.getenv("MAX_HISTORY_ITEMS", "10"))
    PROMPT_FILE_PATH = os.path.join(os.path.abspath(os.path.dirname(__file__)), '..', 'socrates_prompt.txt')

    PERSONA_PROMPTS_PATHS = {
        "socrates": os.path.join(os.path.abspath(os.path.dirname(__file__)), '..', 'socrates_prompt.txt'),
        "nietzsche": os.path.join(os.path.abspath(os.path.dirname(__file__)), '..', 'nietzsche_prompt.txt'),
        "kant": os.path.join(os.path.abspath(os.path.dirname(__file__)), '..', 'kant_prompt.txt'),
    }
    DEFAULT_PERSONA_ID = "socrates"


class DevelopmentConfig(Config):
    """Development configuration."""
    DEBUG = True
    FORCE_HTTPS = False
    SESSION_COOKIE_SECURE = False


class ProductionConfig(Config):
    """Production configuration."""
    DEBUG = False
    FORCE_HTTPS = True
    SESSION_COOKIE_SECURE = True


class TestingConfig(Config):
    """Testing configuration."""
    TESTING = True
    DEBUG = True
    FORCE_HTTPS = False
    SESSION_COOKIE_SECURE = False
    SQLALCHEMY_DATABASE_URI = "sqlite:///:memory:"

