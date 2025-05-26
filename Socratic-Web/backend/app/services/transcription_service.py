import os
import tempfile
import logging
from typing import Optional
from werkzeug.datastructures import FileStorage
from flask import current_app
import openai

logger = logging.getLogger(__name__)

class TranscriptionService:
    """Service for transcribing audio files using OpenAI Whisper API"""
    
    def __init__(self):
        self.client = openai.OpenAI(api_key=current_app.config['OPENAI_API_KEY'])
        self.max_file_size = current_app.config['MAX_AUDIO_FILE_SIZE']
        self.allowed_formats = current_app.config['ALLOWED_AUDIO_FORMATS']
    
    def validate_audio_file(self, audio_file: FileStorage) -> None:
        """
        Validate the uploaded audio file
        
        Args:
            audio_file: The uploaded file from Flask request
            
        Raises:
            ValueError: If file validation fails
        """
        if not audio_file or not audio_file.filename:
            raise ValueError("No audio file provided")
        
        # Check file size
        if hasattr(audio_file, 'content_length') and audio_file.content_length:
            if audio_file.content_length > self.max_file_size:
                raise ValueError(f"File too large. Maximum size is {self.max_file_size} bytes")
        
        # Check file format by MIME type
        if audio_file.content_type not in self.allowed_formats:
            raise ValueError(f"Unsupported audio format. Allowed: {', '.join(self.allowed_formats)}")
    
    def transcribe_audio(self, audio_file: FileStorage) -> str:
        """
        Transcribe audio file using OpenAI Whisper API
        
        Args:
            audio_file: The uploaded audio file
            
        Returns:
            str: The transcribed text
            
        Raises:
            ValueError: If file validation fails
            Exception: If transcription fails
        """
        try:
            # Validate the file first
            self.validate_audio_file(audio_file)
            
            # Create temporary file for OpenAI API
            with tempfile.NamedTemporaryFile(delete=False, suffix=".m4a") as temp_file:
                # Read and write audio data
                audio_file.seek(0)  # Ensure we're at the beginning of the file
                temp_file.write(audio_file.read())
                temp_file.flush()
                
                try:
                    # Call OpenAI Whisper API
                    with open(temp_file.name, "rb") as audio_data:
                        transcript = self.client.audio.transcriptions.create(
                            model="whisper-1",
                            file=audio_data,
                            response_format="text"
                        )
                    
                    logger.info(f"Successfully transcribed audio file: {audio_file.filename}")
                    return transcript.strip() if transcript else ""
                    
                finally:
                    # Clean up temporary file
                    try:
                        os.unlink(temp_file.name)
                    except OSError as e:
                        logger.warning(f"Could not delete temporary file {temp_file.name}: {e}")
                        
        except ValueError:
            # Re-raise validation errors
            raise
        except Exception as e:
            logger.error(f"Transcription failed for file {audio_file.filename}: {str(e)}")
            raise Exception("Failed to transcribe audio. Please try again.")

# Global instance to be used across the application
transcription_service = None

def get_transcription_service() -> TranscriptionService:
    """Get or create the transcription service instance"""
    global transcription_service
    if transcription_service is None:
        transcription_service = TranscriptionService()
    return transcription_service 