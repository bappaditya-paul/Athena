import pytest
from src.utils.preprocessing import TextPreprocessor
from src.utils.verification import SourceVerifier
from src.utils.watermarking import ContentWatermarker

@pytest.mark.asyncio
async def test_text_preprocessing():
    """Test text preprocessing pipeline"""
    preprocessor = TextPreprocessor()
    text = "This is a sample text with some stopwords and numbers 123!"
    tokens = await preprocessor.preprocess_text(text)
    assert isinstance(tokens, list)
    assert len(tokens) > 0
    assert all(isinstance(token, str) for token in tokens)

@pytest.mark.asyncio
async def test_source_verification():
    """Test source verification"""
    verifier = SourceVerifier()
    result = await verifier.verify_source("https://example.com")
    assert isinstance(result, dict)
    assert 'source_url' in result
    assert 'is_trusted' in result

def test_watermarking():
    """Test content watermarking"""
    watermarker = ContentWatermarker()
    text = "This is a sample text to be watermarked"
    metadata = {"author": "test", "version": 1}
    
    # Test watermark generation and verification
    watermark = watermarker.generate_watermark(text, metadata)
    assert isinstance(watermark, str)
    
    # Test verification
    verification = watermarker.verify_watermark(text, watermark)
    assert verification['is_valid']
    assert verification['content_match']
    assert verification['metadata'] == metadata
    
    # Test with modified content
    modified_text = text + " modified"
    verification = watermarker.verify_watermark(modified_text, watermark)
    assert not verification['content_match']
