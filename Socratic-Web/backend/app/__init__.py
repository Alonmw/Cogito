# backend/app/__init__.py
# v6: Prioritize DATABASE_URL from Render environment
import json
import os
import openai
from flask import Flask
from openai import OpenAI
import logging
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from flask_talisman import Talisman

from .config import Config, DevelopmentConfig, ProductionConfig, TestingConfig
from .extensions import db, cors, migrate, bcrypt, jwt, limiter
from flask_migrate import Migrate
from .models import User, Conversation, Message  # Ensure all models are imported

import firebase_admin
from firebase_admin import credentials

# Initialize Firebase Admin only once
firebase_initialized = False
firebase_app = None


def create_app(config_class=None):
    """Create the Flask application with the appropriate configuration."""
    app = Flask(__name__, instance_relative_config=True)
    
    # Determine which configuration to use based on environment
    if config_class is None:
        env = os.getenv('FLASK_ENV', 'development').lower()
        if env == 'production':
            config_class = ProductionConfig
        elif env == 'testing':
            config_class = TestingConfig
        else:
            config_class = DevelopmentConfig
    
    app.config.from_object(config_class)
    print(f"Instance path: {app.instance_path}")
    app.logger.setLevel(logging.INFO)
    if not app.debug and not app.testing:  # Avoid double logging in dev
        if not app.logger.handlers:  # Check if handlers are already added
            app.logger.setLevel(logging.INFO)
            # Example: Add a stream handler if none exist
            # stream_handler = logging.StreamHandler()
            # stream_handler.setFormatter(logging.Formatter(
            #     '%(asctime)s %(levelname)s: %(message)s [in %(pathname)s:%(lineno)d]'))
            # app.logger.addHandler(stream_handler)
            app.logger.info('Flask logger configured for INFO level.')

    try:
        if not os.path.exists(app.instance_path): os.makedirs(app.instance_path)
    except OSError as e:
        print(f"Error creating instance folder: {app.instance_path} - {e}")

    # --- Database URI Configuration ---
    # Prioritize DATABASE_URL (set by Render)
    database_url = Config.SQLALCHEMY_DATABASE_URI
    if database_url:
        # Ensure Render's postgres:// is compatible with SQLAlchemy's postgresql://
        if database_url.startswith('postgres://'):
            final_db_uri = database_url.replace('postgres://', 'postgresql://', 1)
        else:
            final_db_uri = database_url  # Assume compatible if not starting with postgres://
    else:
        # Fallback to SQLALCHEMY_DATABASE_URI (e.g., from .env for local)
        # or default to local SQLite
        sqlalchemy_uri_from_config = app.config.get('SQLALCHEMY_DATABASE_URI')
        if sqlalchemy_uri_from_config:
            final_db_uri = sqlalchemy_uri_from_config
        else:
            absolute_db_path = os.path.join(app.instance_path, 'app.db')
            final_db_uri = f"sqlite:///{absolute_db_path}"

    app.config['SQLALCHEMY_DATABASE_URI'] = final_db_uri
    print(f"Final Database URI set to: {app.config['SQLALCHEMY_DATABASE_URI']}")
    # --- End Database URI Configuration ---

    # Initialize Firebase Admin SDK
    try:
        cred_path = os.getenv('GOOGLE_APPLICATION_CREDENTIALS')
        if cred_path and os.path.exists(cred_path):
            cred = credentials.Certificate(cred_path)
            if not firebase_admin._apps:
                firebase_admin.initialize_app(cred)
                print("Firebase Admin SDK initialized successfully.")
            else:
                print("Firebase Admin SDK already initialized.")
        elif os.getenv('FIREBASE_CONFIG_JSON'):  # Alternative for Render env var group
            cred_json_str = os.getenv('FIREBASE_CONFIG_JSON')
            cred_dict = json.loads(cred_json_str)
            cred = credentials.Certificate(cred_dict)
            if not firebase_admin._apps:
                firebase_admin.initialize_app(cred)
                print("Firebase Admin SDK initialized from FIREBASE_CONFIG_JSON successfully.")
            else:
                print("Firebase Admin SDK already initialized.")
        else:
            print("Warning: Firebase credentials (GOOGLE_APPLICATION_CREDENTIALS or FIREBASE_CONFIG_JSON) not found.")
    except Exception as e:
        print(f"Error initializing Firebase Admin SDK: {e}")

    # Configure CORS
    CORS(app, resources={r"/api/*": {"origins": app.config.get('ALLOWED_ORIGINS')}})

    # Initialize extensions with app
    db.init_app(app)
    migrate.init_app(app, db)
    bcrypt.init_app(app)
    jwt.init_app(app)
    limiter.init_app(app)
    
    # Initialize Talisman (security headers)
    Talisman(
        app,
        content_security_policy=None,  # Configure CSP separately if needed
        force_https=app.config.get('FORCE_HTTPS', True),  # Force HTTPS in production
        strict_transport_security=True,  # Enable HSTS
        session_cookie_secure=app.config.get('SESSION_COOKIE_SECURE', True),  # Secure cookies in production
        session_cookie_http_only=True  # HttpOnly cookies
    )

    # Initialize OpenAI Client
    app.openai_client = None
    openai_api_key = app.config.get("OPENAI_API_KEY") or os.getenv("OPENAI_API_KEY")
    if openai_api_key:
        try:
            app.openai_client = OpenAI(api_key=openai_api_key)
            print("OpenAI client initialized successfully.")
        except Exception as e:
            print(f"Error initializing OpenAI client: {e}")
    else:
        print("ERROR: OPENAI_API_KEY not configured.")

    # --- Persona Prompts Loading ---
    app.persona_prompts_content = {}
    for persona_id, path in app.config['PERSONA_PROMPTS_PATHS'].items():
        try:
            with open(path, 'r') as f:
                app.persona_prompts_content[persona_id] = f.read()
            app.logger.info(f"System prompt for persona '{persona_id}' loaded successfully from {path}.")
        except Exception as e:
            app.logger.error(f"Error reading system prompt file for persona '{persona_id}' from {path}: {e}")
    app.DEFAULT_PERSONA_ID = app.config['DEFAULT_PERSONA_ID']
    # For backward compatibility, set app.system_prompt to the default persona's prompt
    app.system_prompt = app.persona_prompts_content.get(app.DEFAULT_PERSONA_ID, "Default fallback prompt if socrates.txt is missing.")

    from .auth.routes import auth_bp
    from .dialogue.routes import dialogue_bp
    from .transcription.routes import transcription_bp
    app.register_blueprint(auth_bp)
    app.register_blueprint(dialogue_bp)
    app.register_blueprint(transcription_bp, url_prefix='/api')
    print("Blueprints registered.")

    @app.route('/')
    def index():
        return "Backend is running!"

    return app