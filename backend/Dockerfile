# backend/Dockerfile

# Use an official Python runtime as a parent image (choose a specific version)
FROM python:3.10-slim

# Set the working directory within the container
WORKDIR /app

# Copy the requirements file into the container first
# This leverages Docker build caching - dependencies are only re-installed if requirements.txt changes
COPY requirements.txt .

# Install dependencies specified in requirements.txt
# Use --no-cache-dir to reduce image size
# Use --default-timeout=100 to prevent timeouts on slower networks if needed
RUN pip install --no-cache-dir --default-timeout=100 -r requirements.txt

# Copy the rest of your backend application code into the container's working directory
COPY . .

# Make port 8000 available to the world outside this container
# Gunicorn will run on this port inside the container
EXPOSE 8000

# Command to run the application using Gunicorn
# -w 1: Use 1 worker process (adjust as needed based on load/CPU)
# --bind 0.0.0.0:8000: Listen on all network interfaces inside the container on port 8000
# app:app: Look for the Flask application instance named 'app' inside the 'app.py' file
CMD ["gunicorn", "-w", "1", "--bind", "0.0.0.0:8000", "app:app"]

# Note: Environment variables like OPENAI_API_KEY should be injected
# at runtime by the hosting platform or 'docker run' command,
# not set directly in the Dockerfile for security.
# The Python code using os.getenv() will pick them up.