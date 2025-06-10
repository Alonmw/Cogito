import logging
from flask import Blueprint, request, jsonify, current_app
from werkzeug.exceptions import RequestEntityTooLarge
from app.services.transcription_service import get_transcription_service
from app.extensions import limiter

logger = logging.getLogger(__name__)

# Create blueprint
transcription_bp = Blueprint('transcription', __name__)

@transcription_bp.route('/transcribe', methods=['POST'])
@limiter.limit("5 per minute")  # Conservative limit for resource-intensive transcription
def transcribe_audio():
    """
    Transcribe uploaded audio file to text using OpenAI Whisper
    
    Expected form data:
    - audio: Audio file (multipart/form-data)
    
    Returns:
    - JSON response with transcript or error message
    """
    try:
        # Check if audio file is in request
        if 'audio' not in request.files:
            return jsonify({
                'error': 'No audio file provided',
                'code': 'MISSING_FILE'
            }), 400
        
        audio_file = request.files['audio']
        
        # Check if file was actually selected
        if audio_file.filename == '':
            return jsonify({
                'error': 'No file selected',
                'code': 'EMPTY_FILE'
            }), 400
        
        # Log the request
        client_ip = request.environ.get('HTTP_X_FORWARDED_FOR', request.remote_addr)
        logger.info(f"Transcription request from {client_ip}, file: {audio_file.filename}, "
                   f"content_type: {audio_file.content_type}")
        
        # Get transcription service and process the file
        service = get_transcription_service()
        transcript = service.transcribe_audio(audio_file)
        
        if not transcript:
            return jsonify({
                'error': 'Could not transcribe audio - no speech detected',
                'code': 'NO_SPEECH'
            }), 422
        
        logger.info(f"Successfully transcribed audio file: {audio_file.filename}")
        
        return jsonify({
            'transcript': transcript,
            'status': 'success'
        }), 200
        
    except ValueError as e:
        # File validation errors
        logger.warning(f"File validation error: {str(e)}")
        return jsonify({
            'error': str(e),
            'code': 'VALIDATION_ERROR'
        }), 400
        
    except RequestEntityTooLarge:
        # Flask's built-in file size limit exceeded
        logger.warning("File size exceeded Flask's MAX_CONTENT_LENGTH")
        return jsonify({
            'error': 'File too large',
            'code': 'FILE_TOO_LARGE'
        }), 413
        
    except Exception as e:
        # General transcription errors
        logger.error(f"Transcription error: {str(e)}")
        return jsonify({
            'error': 'Failed to transcribe audio. Please try again.',
            'code': 'TRANSCRIPTION_ERROR'
        }), 500

@transcription_bp.route('/transcribe/health', methods=['GET'])
@limiter.limit("30 per minute")  # More generous limit for health checks
def transcription_health():
    """
    Health check endpoint for transcription service
    """
    try:
        # Check if OpenAI API key is configured
        if not current_app.config.get('OPENAI_API_KEY'):
            return jsonify({
                'status': 'error',
                'message': 'OpenAI API key not configured'
            }), 500
        
        return jsonify({
            'status': 'healthy',
            'service': 'transcription',
            'max_file_size': current_app.config['MAX_AUDIO_FILE_SIZE'],
            'allowed_formats': current_app.config['ALLOWED_AUDIO_FORMATS']
        }), 200
        
    except Exception as e:
        logger.error(f"Health check error: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': 'Service unavailable'
        }), 500 