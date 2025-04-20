# backend/Dockerfile

# Use an official Python runtime as a parent image (choose a specific version)
FROM python:3.10-slim

# Set the working directory in the container
WORKDIR /app

# Copy the requirements file into the container first
COPY requirements.txt .

# Install dependencies specified in requirements.txt
RUN pip install --no-cache-dir --default-timeout=100 -r requirements.txt

# Copy the rest of your backend application code (including the 'app' package)
COPY . .

# Make port 8000 available to the world outside this container
EXPOSE 8000

# Command to run the application using Gunicorn with Application Factory
# Tells Gunicorn to import the 'app' package and call the 'create_app()' function
# located within it (in __init__.py) to get the Flask app instance.
CMD ["gunicorn", "-w", "1", "--bind", "0.0.0.0:8000", "app:create_app()"]

# Note: Environment variables like OPENAI_API_KEY, DATABASE_URL, JWT_SECRET_KEY, ALLOWED_ORIGINS
# should be injected at runtime by the hosting platform or 'docker run' command.
