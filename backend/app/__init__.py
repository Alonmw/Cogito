# backend/app/__init__.py
# v3: Removed bcrypt and jwt initialization

import os
import firebase_admin
import logging
from firebase_admin import credentials
from flask import Flask
from openai import OpenAI
from .config import Config
# --- Update imports from extensions ---
from .extensions import db, cors # Removed bcrypt, jwt
# --- End Update ---
from .models import User

def create_app(config_class=Config):
    """Application Factory Function"""
    app = Flask(__name__, instance_relative_config=True)

    # Load Configuration
    app.config.from_object(config_class)
    print(f"Instance path: {app.instance_path}")

    if not app.debug:
        app.logger.setLevel(logging.INFO)
        app.logger.info('Flask logger configured for INFO level.')

    # Ensure Instance Folder Exists
    try:
        if not os.path.exists(app.instance_path): os.makedirs(app.instance_path)
    except OSError as e: print(f"Error creating instance folder: {app.instance_path} - {e}")

    # Configure Database URI
    # (Keep logic from backend_factory_db_fix_v2)
    absolute_db_path = os.path.join(app.instance_path, 'app.db')
    default_sqlite_uri = f"sqlite:///{absolute_db_path}"
    database_url_from_env = app.config.get('SQLALCHEMY_DATABASE_URI')
    final_db_uri = None
    if database_url_from_env:
        if database_url_from_env.startswith('sqlite:///'): final_db_uri = default_sqlite_uri
        else: final_db_uri = database_url_from_env
    else: final_db_uri = default_sqlite_uri
    app.config['SQLALCHEMY_DATABASE_URI'] = final_db_uri
    print(f"Final Database URI set to: {app.config['SQLALCHEMY_DATABASE_URI']}")

    # Initialize Firebase Admin SDK
    # (Keep logic from backend_factory_firebase_init_v1)
    try:
        cred_path = os.getenv('GOOGLE_APPLICATION_CREDENTIALS')
        if cred_path and os.path.exists(cred_path):
            cred = credentials.Certificate(cred_path)
            if not firebase_admin._apps: # Initialize only if not already initialized
                 firebase_admin.initialize_app(cred)
                 print("Firebase Admin SDK initialized successfully.")
            else:
                 print("Firebase Admin SDK already initialized.")
        # Add check for FIREBASE_CONFIG env var as well if needed
        else: print("Warning: GOOGLE_APPLICATION_CREDENTIALS path not found. Firebase Admin SDK not initialized.")
    except Exception as e: print(f"Error initializing Firebase Admin SDK: {e}")


    # --- Initialize Flask Extensions ---
    db.init_app(app)
    # Removed: bcrypt.init_app(app)
    # Removed: jwt.init_app(app)
    cors.init_app(app) # Initialize CORS using config loaded earlier
    # --- End Extension Init Update ---


    # Initialize OpenAI Client
    # (Keep existing logic)
    app.openai_client = None
    openai_api_key = app.config.get("OPENAI_API_KEY")
    if openai_api_key:
        try:
            app.openai_client = OpenAI(api_key=openai_api_key)
            print("OpenAI client initialized successfully.")
        except Exception as e: print(f"Error initializing OpenAI client: {e}")
    else: print("ERROR: OPENAI_API_KEY not configured.")


    # Load System Prompt
    # (Keep existing logic)
    app.system_prompt = "Default prompt if file fails."
    try:
        prompt_file_path = app.config['PROMPT_FILE_PATH']
        with open(prompt_file_path, 'r') as f: app.system_prompt = f.read()
        print("System prompt loaded successfully.")
    except Exception as e: print(f"Error reading system prompt file: {e}")


    # Register Blueprints
    # (Keep existing logic)
    from .auth.routes import auth_bp
    from .dialogue.routes import dialogue_bp
    app.register_blueprint(auth_bp)
    app.register_blueprint(dialogue_bp)
    print("Blueprints registered.")


    # Create Database Tables
    # (Keep existing logic)
    print(f"Attempting db.create_all() using URI: {app.config['SQLALCHEMY_DATABASE_URI']}")
    with app.app_context():
        db.create_all()
        print("Database tables checked/created.")


    # Optional: Add basic root route for testing
    @app.route('/')
    def index():
        return "Backend is running!"

    return app

