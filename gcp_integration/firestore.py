from google.cloud import firestore
from typing import Dict, Any, Optional, List
import json
import logging

logger = logging.getLogger(__name__)

class FirestoreDB:
    def __init__(self, project_id: str = None):
        """Initialize Firestore client"""
        try:
            self.db = firestore.Client(project=project_id)
            logger.info("Firestore client initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize Firestore: {str(e)}")
            raise
    
    async def get_document(self, collection: str, doc_id: str) -> Optional[Dict[str, Any]]:
        """Get a single document by ID"""
        try:
            doc_ref = self.db.collection(collection).document(doc_id)
            doc = doc_ref.get()
            return doc.to_dict() if doc.exists else None
        except Exception as e:
            logger.error(f"Error getting document {doc_id}: {str(e)}")
            return None
    
    async def set_document(self, collection: str, doc_id: str, data: Dict[str, Any]) -> bool:
        """Create or update a document"""
        try:
            doc_ref = self.db.collection(collection).document(doc_id)
            doc_ref.set(data)
            return True
        except Exception as e:
            logger.error(f"Error setting document {doc_id}: {str(e)}")
            return False
    
    async def query_collection(
        self, 
        collection: str, 
        field: str, 
        operator: str, 
        value: Any
    ) -> List[Dict[str, Any]]:
        """Query a collection with a filter"""
        try:
            query_ref = self.db.collection(collection).where(field, operator, value)
            docs = query_ref.stream()
            return [doc.to_dict() for doc in docs]
        except Exception as e:
            logger.error(f"Error querying collection {collection}: {str(e)}")
            return []
    
    async def delete_document(self, collection: str, doc_id: str) -> bool:
        """Delete a document"""
        try:
            self.db.collection(collection).document(doc_id).delete()
            return True
        except Exception as e:
            logger.error(f"Error deleting document {doc_id}: {str(e)}")
            return False
