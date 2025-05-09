# backend/app/__init__.py
# v6: Prioritize DATABASE_URL from Render environment
import json
import os
import firebase_admin
from firebase_admin import credentials
from flask import Flask
from openai import OpenAI
import logging

from .config import Config
from .extensions import db, cors
from flask_migrate import Migrate
from .models import User, Conversation, Message  # Ensure all models are imported


def create_app(config_class=Config):
    app = Flask(__name__, instance_relative_config=True)
    app.config.from_object(config_class)
    print(f"Instance path: {app.instance_path}")

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

    db.init_app(app)
    cors.init_app(app)
    migrate = Migrate(app, db)

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

    # Load System Prompt
    app.system_prompt = "Default prompt if file fails."
    try:
        # Prefer PROMPT_FILE_PATH from config, then env, then default file
        prompt_file_path = app.config.get('PROMPT_FILE_PATH') or os.getenv('PROMPT_FILE_PATH') or 'prompt.txt'
        # Ensure path is absolute if it's just a filename (relative to backend root)
        if not os.path.isabs(prompt_file_path) and not prompt_file_path.startswith('/app'):  # /app is Render's root
            prompt_file_path = os.path.join(os.path.dirname(os.path.dirname(__file__)),
                                            prompt_file_path)  # app dir -> backend dir -> prompt.txt

        with open(prompt_file_path, 'r') as f:
            app.system_prompt = f.read()
        print(f"System prompt loaded successfully from {prompt_file_path}.")
    except Exception as e:
        print(f"Error reading system prompt file from {prompt_file_path}: {e}")

    from .auth.routes import auth_bp
    from .dialogue.routes import dialogue_bp
    app.register_blueprint(auth_bp)
    app.register_blueprint(dialogue_bp)
    print("Blueprints registered.")

    @app.route('/')
    def index():
        return "Backend is running!"

    return app