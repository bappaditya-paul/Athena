import hashlib
import base64
from typing import Dict, Any, Optional
import json

class ContentWatermarker:
    def __init__(self, secret_key: str = "athena-secret-key"):
        self.secret_key = secret_key.encode('utf-8')
        
    def generate_watermark(self, content: str, metadata: Optional[Dict[str, Any]] = None) -> str:
        """
        Generate a watermark for the given content
        """
        # Create a hash of the content with the secret key
        content_hash = hashlib.sha256((content + self.secret_key.decode()).encode('utf-8')).digest()
        
        # Create watermark data
        watermark_data = {
            'content_hash': base64.b64encode(content_hash).decode('utf-8'),
            'timestamp': self._get_timestamp(),
            'metadata': metadata or {}
        }
        
        # Convert to JSON and encode
        watermark_json = json.dumps(watermark_data, sort_keys=True)
        return base64.b64encode(watermark_json.encode('utf-8')).decode('utf-8')
    
    def verify_watermark(self, content: str, watermark: str) -> Dict[str, Any]:
        """
        Verify if the content matches its watermark
        """
        try:
            # Decode the watermark
            watermark_json = base64.b64decode(watermark).decode('utf-8')
            watermark_data = json.loads(watermark_json)
            
            # Regenerate the expected hash
            expected_hash = hashlib.sha256((content + self.secret_key.decode()).encode('utf-8')).digest()
            expected_hash_b64 = base64.b64encode(expected_hash).decode('utf-8')
            
            # Compare hashes
            is_valid = watermark_data.get('content_hash') == expected_hash_b64
            
            return {
                'is_valid': is_valid,
                'content_match': is_valid,
                'timestamp': watermark_data.get('timestamp'),
                'metadata': watermark_data.get('metadata', {}),
                'error': None
            }
            
        except Exception as e:
            return {
                'is_valid': False,
                'content_match': False,
                'error': f'Invalid watermark format: {str(e)}'
            }
    
    def _get_timestamp(self) -> str:
        """Get current timestamp in ISO format"""
        from datetime import datetime
        return datetime.utcnow().isoformat()

    def embed_watermark(self, text: str, metadata: Optional[Dict[str, Any]] = None) -> str:
        """
        Embed a watermark in the text (steganography)
        """
        watermark = self.generate_watermark(text, metadata)
        # Simple steganography: append the watermark as an invisible unicode character sequence
        # This is a basic example; consider more sophisticated methods for production
        return text + '\u200B' + watermark
    
    def extract_watermark(self, text: str) -> Dict[str, Any]:
        """
        Extract and verify a watermark from text
        """
        # Split the text and watermark
        parts = text.split('\u200B')
        if len(parts) < 2:
            return {
                'is_valid': False,
                'error': 'No watermark found'
            }
            
        original_text = '\u200B'.join(parts[:-1])
        watermark = parts[-1]
        
        result = self.verify_watermark(original_text, watermark)
        result['original_text'] = original_text
        return result
