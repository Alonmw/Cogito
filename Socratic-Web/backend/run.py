# backend/run.py
from app import create_app # Import the factory function

# Create the Flask app instance using the factory
app = create_app()

if __name__ == '__main__':
    # Run the development server
    # host='0.0.0.0' makes it accessible on your network (optional)
    # debug=True enables debugger and auto-reloading (use environment var for prod)
    app.run(host='0.0.0.0', port=5001, debug=True)
