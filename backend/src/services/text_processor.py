import logging
from typing import List
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
import spacy

# Download required NLTK data
try:
    nltk.data.find('tokenizers/punkt')
    nltk.data.find('corpora/stopwords')
except LookupError:
    nltk.download('punkt')
    nltk.download('stopwords')

logger = logging.getLogger(__name__)

class TextProcessor:
    def __init__(self):
        self.stop_words = set(stopwords.words('english'))
        try:
            self.nlp = spacy.load('en_core_web_sm')
        except OSError:
            import subprocess, sys
            subprocess.check_call([sys.executable, "-m", "spacy", "download", "en_core_web_sm"])
            self.nlp = spacy.load('en_core_web_sm')
    
    async def extract_keywords(self, text: str, top_n: int = 10) -> List[str]:
        """Extract the most important keywords from the text."""
        try:
            words = word_tokenize(text.lower())
            words = [word for word in words if word.isalnum() and word not in self.stop_words]
            doc = self.nlp(text)
            entities = [ent.text.lower() for ent in doc.ents]
            word_freq = nltk.FreqDist(words + entities)
            return [word for word, _ in word_freq.most_common(top_n)]
        except Exception as e:
            logger.error(f"Error extracting keywords: {str(e)}", exc_info=True)
            return []
    
    async def transcribe_audio(self, audio_path: str) -> str:
        """Transcribe audio to text."""
        try:
            import speech_recognition as sr
            r = sr.Recognizer()
            with sr.AudioFile(audio_path) as source:
                audio_data = r.record(source)
                return r.recognize_google(audio_data)
        except Exception as e:
            logger.error(f"Error transcribing audio: {str(e)}", exc_info=True)
            raise
    
    async def extract_text_from_video(self, video_path: str) -> str:
        """Extract text from video using speech recognition."""
        try:
            from moviepy.editor import VideoFileClip
            import tempfile
            import os
            
            with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as tmp:
                video = VideoFileClip(video_path)
                video.audio.write_audiofile(tmp.name, verbose=False, logger=None)
                video.close()
                
                text = await self.transcribe_audio(tmp.name)
                os.unlink(tmp.name)
                return text
        except Exception as e:
            logger.error(f"Error extracting text from video: {str(e)}", exc_info=True)
            raise
    
    async def extract_from_web_script(self, script: str) -> str:
        """Extract main content from web script/HTML."""
        try:
            from bs4 import BeautifulSoup
            soup = BeautifulSoup(script, 'html.parser')
            
            # Remove script and style elements
            for script in soup(["script", "style"]):
                script.decompose()
                
            # Get text and clean it up
            text = soup.get_text(separator=' ', strip=True)
            return ' '.join(text.split())
        except Exception as e:
            logger.error(f"Error extracting text from web script: {str(e)}", exc_info=True)
            return script  # Return original if parsing fails
