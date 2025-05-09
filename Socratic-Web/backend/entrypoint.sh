#!/bin/sh

# Exit immediately if a command exits with a non-zero status.
set -e

echo "Running database migrations..."
# Ensure FLASK_APP is set if your flask commands need it
# (Render environment variables should make it available)
flask db upgrade

echo "Starting Gunicorn..."
# Replace this with your actual Gunicorn start command
# Ensure it binds to 0.0.0.0 and uses the $PORT environment variable provided by Render
exec gunicorn --bind 0.0.0.0:$PORT "app:create_app()"
