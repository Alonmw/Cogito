# backend/app/__init__.py
import os
from flask import Flask
from openai import OpenAI
from .config import Config
from .extensions import db, bcrypt, jwt, cors
from .models import User # Import models AFTER db is defined but before create_all

def create_app(config_class=Config):
    """Application Factory Function"""
    # Use instance_relative_config=True so app.instance_path points to backend/instance/
    app = Flask(__name__, instance_relative_config=True)

    # --- Load Configuration from config object ---
    app.config.from_object(config_class)
    print(f"Instance path: {app.instance_path}") # Log instance path

    # --- Ensure Instance Folder Exists ---
    # Do this early, before DB URI calculation that might use it
    try:
        if not os.path.exists(app.instance_path):
            os.makedirs(app.instance_path)
            print(f"Created instance folder: {app.instance_path}")
    except OSError as e:
        print(f"Error creating instance folder: {app.instance_path} - {e}")
        # Consider how critical this is - maybe exit if it fails?
        pass

    # --- Configure Database URI (Prioritize Absolute Path for SQLite) ---
    # Calculate the desired absolute path for the default SQLite DB
    absolute_db_path = os.path.join(app.instance_path, 'app.db')
    # Correct format for absolute path on Unix-like systems is sqlite:/// followed by the path
    default_sqlite_uri = f"sqlite:///{absolute_db_path}"

    # Get URI from env var (might be None, relative sqlite, or other type like postgres)
    database_url_from_env = app.config.get('SQLALCHEMY_DATABASE_URI') # Already loaded by from_object

    final_db_uri = None
    if database_url_from_env:
        print(f"Found DATABASE_URL in environment: {database_url_from_env}")
        # If the env var is set BUT looks like a relative SQLite path,
        # override it with the calculated absolute path for reliability locally.
        if database_url_from_env.startswith('sqlite:///'):
            print(f"Warning: DATABASE_URL in env is relative SQLite URI ('{database_url_from_env}'). Using calculated absolute path instead for reliability.")
            final_db_uri = default_sqlite_uri
        else:
            # Assume it's a non-SQLite URI (like Postgres) or an absolute SQLite path already
            final_db_uri = database_url_from_env
    else:
        # If DATABASE_URL is not set at all in .env, use the calculated absolute path
        print(f"DATABASE_URL not set, using default absolute SQLite path: {default_sqlite_uri}")
        final_db_uri = default_sqlite_uri

    # Set the final calculated URI in the app config
    app.config['SQLALCHEMY_DATABASE_URI'] = final_db_uri
    print(f"Final Database URI set to: {app.config['SQLALCHEMY_DATABASE_URI']}")


    # --- Initialize Extensions ---
    # Important: Initialize db AFTER setting the final SQLALCHEMY_DATABASE_URI
    db.init_app(app)
    bcrypt.init_app(app)
    jwt.init_app(app)

    # Initialize CORS using config
    # (Keep existing CORS logic here...)
    allowed_origins_str = app.config.get("ALLOWED_ORIGINS")
    if allowed_origins_str:
        if allowed_origins_str == "*":
            cors.init_app(app, origins="*")
            print("CORS: Initialized to allow all origins.")
        else:
            origins = [origin.strip() for origin in allowed_origins_str.split(',')]
            cors.init_app(app, origins=origins)
            print(f"CORS: Initialized to allow specific origins: {origins}")
    else:
        cors.init_app(app)
        print("Warning: ALLOWED_ORIGINS not set in config. CORS initialized with defaults.")


    # --- Initialize OpenAI Client ---
    # (Keep existing OpenAI client logic here...)
    app.openai_client = None
    openai_api_key = app.config.get("OPENAI_API_KEY")
    if openai_api_key:
        try:
            app.openai_client = OpenAI(api_key=openai_api_key)
            print("OpenAI client initialized successfully.")
        except Exception as e:
            app.logger.error(f"Error initializing OpenAI client: {e}")
    else:
        print("ERROR: OPENAI_API_KEY not configured. OpenAI client not initialized.")


    # --- Load System Prompt ---
    # (Keep existing prompt loading logic here...)
    app.system_prompt = "Default prompt if file fails."
    try:
        prompt_file_path = app.config['PROMPT_FILE_PATH']
        with open(prompt_file_path, 'r') as f:
            app.system_prompt = f.read()
        print("System prompt loaded successfully.")
    except Exception as e:
        app.logger.error(f"Error reading system prompt file ({prompt_file_path}): {e}")


    # --- Register Blueprints ---
    from .auth.routes import auth_bp
    from .dialogue.routes import dialogue_bp
    app.register_blueprint(auth_bp)
    app.register_blueprint(dialogue_bp)
    print("Blueprints registered.")


    # --- Create Database Tables ---
    # This should now use the correct absolute path
    print(f"Attempting db.create_all() using URI: {app.config['SQLALCHEMY_DATABASE_URI']}")
    with app.app_context():
        # Ensure models are imported before calling create_all if they weren't already
        # from . import models # Or ensure models.py is imported earlier
        db.create_all()
        print("Database tables checked/created.")


    # --- Optional: Add basic root route for testing ---
    @app.route('/')
    def index():
        return "Backend is running!"

    return app

