import pytest
from src.models.rag_model import RAGModel
from src.models.hallucination import HallucinationDetector
from src.models.adversarial_defense import AdversarialDefense

@pytest.mark.asyncio
async def test_rag_model_retrieve():
    """Test RAG model retrieval"""
    model = RAGModel()
    results = await model.retrieve("test query")
    assert isinstance(results, list)
    assert len(results) > 0
    assert all(isinstance(item, dict) for item in results)

@pytest.mark.asyncio
async def test_hallucination_detection():
    """Test hallucination detection"""
    detector = HallucinationDetector()
    result = await detector.detect("Sample text", ["Context 1", "Context 2"])
    assert isinstance(result, dict)
    assert 'has_hallucination' in result

@pytest.mark.asyncio
async def test_adversarial_defense():
    """Test adversarial defense"""
    defense = AdversarialDefense()
    result = await defense.detect_style_attack("Normal text")
    assert isinstance(result, dict)
    assert 'is_attack' in result
