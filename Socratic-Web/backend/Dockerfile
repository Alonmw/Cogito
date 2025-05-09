# Start from a Python base image
FROM python:3.10-slim

# Set the working directory in the container
WORKDIR /app

# Set environment variables (Render will override PORT)
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1
ENV FLASK_APP "app:create_app()" # Or your actual Flask app entry point for CLI
# Add other environment variables like FLASK_ENV=production if needed

# Install system dependencies if any (e.g., for psycopg2 if using PostgreSQL)
# RUN apt-get update && apt-get install -y ... && rm -rf /var/lib/apt/lists/*

# Copy the requirements file into the container
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application code into the container
COPY . .

# Make the entrypoint script executable
RUN chmod +x ./entrypoint.sh

# Expose the port the app runs on (Render sets $PORT automatically)
EXPOSE $PORT

# Set the entrypoint to our script
ENTRYPOINT ["./entrypoint.sh"]

# CMD can be used to pass default arguments to ENTRYPOINT if needed,
# but for a simple script execution, ENTRYPOINT is often sufficient.
# If entrypoint.sh was just `gunicorn ...` then CMD would be ["gunicorn", "--bind", ...]
