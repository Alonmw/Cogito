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

    # --- Audio Transcription Settings ---
    MAX_AUDIO_FILE_SIZE = int(os.getenv("MAX_AUDIO_FILE_SIZE", "25000000"))  # 25MB
    ALLOWED_AUDIO_FORMATS = os.getenv("ALLOWED_AUDIO_FORMATS", "audio/mpeg,audio/wav,audio/m4a,audio/mp4,audio/webm").split(",")

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
    
    # Use Render secret files - these environment variables are set by Render when secret files are uploaded
    PROMPT_FILE_PATH = os.getenv('SOCRATES_PROMPT_FILE_PATH')
    if not PROMPT_FILE_PATH:
        raise ValueError("No SOCRATES_PROMPT_FILE_PATH set. Please upload socrates_prompt.txt as a secret file in Render.")

    PERSONA_PROMPTS_PATHS = {
        "socrates": os.getenv('SOCRATES_PROMPT_FILE_PATH'),
        "nietzsche": os.getenv('NIETZSCHE_PROMPT_FILE_PATH'), 
        "kant": os.getenv('KANT_PROMPT_FILE_PATH'),
        "schopenhauer": os.getenv('SCHOPENHAUER_PROMPT_FILE_PATH'),
        "plato": os.getenv('PLATO_PROMPT_FILE_PATH'),
        "smith": os.getenv('SMITH_PROMPT_FILE_PATH'), # Assuming Adam Smith
        "marx": os.getenv('MARX_PROMPT_FILE_PATH'),
        "camus": os.getenv('CAMUS_PROMPT_FILE_PATH'),
    }
    
    # Validate that all persona prompt files are available
    for persona, path in PERSONA_PROMPTS_PATHS.items():
        if not path:
            raise ValueError(f"No {persona.upper()}_PROMPT_FILE_PATH set. Please upload {persona}_prompt.txt as a secret file in Render.")
    
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

