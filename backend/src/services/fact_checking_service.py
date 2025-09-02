import logging
from typing import Dict, List, Optional, Union
from datetime import datetime
from sqlalchemy.orm import Session
from ..models.fact_checking_models import (
    UserQuery, VerifiedFact, CredibleSource, ExternalSource,
    ContentType, VerificationStatus, SourceType
)
from .text_processor import TextProcessor
from .web_searcher import WebSearcher
from .credibility_scorer import CredibilityScorer

logger = logging.getLogger(__name__)

class FactCheckingService:
    def __init__(self, db: Session):
        self.db = db
        self.text_processor = TextProcessor()
        self.web_searcher = WebSearcher()
        self.credibility_scorer = CredibilityScorer()
    
    async def process_query(
        self,
        content: str,
        content_type: ContentType,
        original_format: Optional[str] = None,
        user_id: Optional[str] = None
    ) -> Dict:
        """
        Main method to process a user query through the fact-checking pipeline.
        """
        try:
            # 1. Create and store the user query
            query = UserQuery(
                content=content,
                content_type=content_type,
                original_format=original_format,
                user_id=user_id
            )
            self.db.add(query)
            self.db.commit()
            
            # 2. Process the content based on its type
            processed_text = await self._process_content(content, content_type)
            
            # 3. Check against our database of verified facts
            db_result = self._check_database(processed_text)
            
            if db_result and db_result["status"] != VerificationStatus.UNVERIFIED:
                # If we found a match in our database, return it
                return self._format_response(query.id, db_result)
            
            # 4. If not found in DB, search the web
            web_results = await self.web_searcher.search(processed_text)
            
            # 5. Score and rank the web results
            scored_results = [
                self.credibility_scorer.score_result(result) 
                for result in web_results
            ]
            
            # 6. Get the most credible results
            top_results = sorted(
                scored_results, 
                key=lambda x: x["credibility_score"], 
                reverse=True
            )[:5]  # Get top 5 results
            
            # 7. Store the results in our database for future reference
            self._store_external_sources(top_results, query.id)
            
            # 8. Format and return the response
            return self._format_web_response(query.id, top_results)
            
        except Exception as e:
            logger.error(f"Error processing query: {str(e)}", exc_info=True)
            self.db.rollback()
            raise
    
    async def _process_content(
        self, 
        content: str, 
        content_type: ContentType
    ) -> str:
        """Process different content types to extract text."""
        if content_type == ContentType.TEXT:
            return content
        elif content_type == ContentType.AUDIO:
            return await self.text_processor.transcribe_audio(content)
        elif content_type == ContentType.VIDEO:
            return await self.text_processor.extract_text_from_video(content)
        elif content_type == ContentType.WEB_SCRIPT:
            return await self.text_processor.extract_from_web_script(content)
        else:
            raise ValueError(f"Unsupported content type: {content_type}")
    
    def _check_database(self, text: str) -> Optional[Dict]:
        """Check if the text matches any known facts in our database."""
        # Simple keyword matching - in a real system, you'd use more sophisticated NLP
        keywords = self.text_processor.extract_keywords(text)
        
        # Search for matching facts in the database
        # This is a simplified example - you'd want to implement more sophisticated search
        matching_facts = (
            self.db.query(VerifiedFact)
            .join(UserQuery)
            .filter(
                UserQuery.content.ilike(f"%{'%'.join(keywords)}%")
            )
            .order_by(VerifiedFact.confidence_score.desc())
            .limit(1)
            .all()
        )
        
        if matching_facts:
            fact = matching_facts[0]
            return {
                "status": fact.status,
                "summary": fact.summary,
                "details": fact.details,
                "confidence_score": fact.confidence_score,
                "source": fact.source.name if fact.source else None,
                "source_type": fact.source.source_type if fact.source else None,
                "verified_at": fact.verified_at
            }
        return None
    
    def _store_external_sources(
        self, 
        results: List[Dict], 
        query_id: int
    ) -> None:
        """Store external sources in the database for future reference."""
        for result in results:
            # Check if source already exists
            source = (
                self.db.query(ExternalSource)
                .filter_by(url=result["url"])
                .first()
            )
            
            if not source:
                source = ExternalSource(
                    url=result["url"],
                    domain=result.get("domain"),
                    title=result.get("title"),
                    content=result.get("content", "")[:4000],  # Truncate if too long
                    content_type=result.get("content_type"),
                    credibility_score=result["credibility_score"],
                    last_checked=datetime.utcnow()
                )
                self.db.add(source)
                self.db.flush()  # Get the source ID
            
            # Create a verified fact entry (with lower confidence since it's from the web)
            verified_fact = VerifiedFact(
                query_id=query_id,
                source_id=source.id,
                status=VerificationStatus.UNVERIFIED,  # Needs human review
                summary=result.get("snippet", "")[:500],
                confidence_score=result["credibility_score"] * 0.8,  # Reduce confidence for web sources
                verified_at=datetime.utcnow()
            )
            self.db.add(verified_fact)
        
        self.db.commit()
    
    def _format_response(
        self, 
        query_id: int, 
        result: Dict
    ) -> Dict:
        """Format the response for a database match."""
        return {
            "query_id": query_id,
            "verification_status": result["status"].value,
            "summary": result["summary"],
            "details": result["details"],
            "confidence_score": result["confidence_score"],
            "sources": [{
                "name": result["source"],
                "type": result["source_type"].value if result["source_type"] else None,
                "verification_date": result["verified_at"].isoformat()
            }],
            "is_from_database": True
        }
    
    def _format_web_response(
        self, 
        query_id: int, 
        results: List[Dict]
    ) -> Dict:
        """Format the response for web search results."""
        return {
            "query_id": query_id,
            "verification_status": "unverified",
            "summary": "No exact match found in our database. Here are some relevant sources:",
            "sources": [{
                "title": r.get("title"),
                "url": r["url"],
                "snippet": r.get("snippet", "")[:200] + "...",
                "domain": r.get("domain"),
                "credibility_score": r["credibility_score"],
                "content_type": r.get("content_type")
            } for r in results],
            "confidence_score": max(r["credibility_score"] for r in results) if results else 0,
            "is_from_database": False,
            "needs_human_review": True
        }
