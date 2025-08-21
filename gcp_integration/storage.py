from google.cloud import storage
from typing import Optional, BinaryIO, Union, Dict, Any
import os
import logging
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)

class CloudStorage:
    def __init__(self, project_id: str = None):
        """Initialize Google Cloud Storage client"""
        try:
            self.client = storage.Client(project=project_id)
            logger.info("Cloud Storage client initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize Cloud Storage: {str(e)}")
            raise
    
    async def upload_file(
        self,
        bucket_name: str,
        source_file_path: str,
        destination_blob_name: str,
        metadata: Optional[Dict[str, str]] = None
    ) -> bool:
        """Upload a file to the bucket"""
        try:
            bucket = self.client.bucket(bucket_name)
            blob = bucket.blob(destination_blob_name)
            
            if metadata:
                blob.metadata = metadata
            
            blob.upload_from_filename(source_file_path)
            logger.info(f"File {source_file_path} uploaded to {destination_blob_name}")
            return True
        except Exception as e:
            logger.error(f"Error uploading file {source_file_path}: {str(e)}")
            return False
    
    async def download_file(
        self,
        bucket_name: str,
        source_blob_name: str,
        destination_file_path: str
    ) -> bool:
        """Download a file from the bucket"""
        try:
            bucket = self.client.bucket(bucket_name)
            blob = bucket.blob(source_blob_name)
            
            os.makedirs(os.path.dirname(destination_file_path), exist_ok=True)
            blob.download_to_filename(destination_file_path)
            
            logger.info(f"File {source_blob_name} downloaded to {destination_file_path}")
            return True
        except Exception as e:
            logger.error(f"Error downloading file {source_blob_name}: {str(e)}")
            return False
    
    async def generate_signed_url(
        self,
        bucket_name: str,
        blob_name: str,
        expiration_hours: int = 24,
        method: str = "GET"
    ) -> Optional[str]:
        """Generate a signed URL for a blob"""
        try:
            bucket = self.client.bucket(bucket_name)
            blob = bucket.blob(blob_name)
            
            url = blob.generate_signed_url(
                expiration=timedelta(hours=expiration_hours),
                method=method.upper(),
                version="v4"
            )
            
            logger.info(f"Generated signed URL for {blob_name}")
            return url
        except Exception as e:
            logger.error(f"Error generating signed URL for {blob_name}: {str(e)}")
            return None
    
    async def delete_file(self, bucket_name: str, blob_name: str) -> bool:
        """Delete a file from the bucket"""
        try:
            bucket = self.client.bucket(bucket_name)
            blob = bucket.blob(blob_name)
            blob.delete()
            
            logger.info(f"File {blob_name} deleted from {bucket_name}")
            return True
        except Exception as e:
            logger.error(f"Error deleting file {blob_name}: {str(e)}")
            return False
    
    async def get_metadata(self, bucket_name: str, blob_name: str) -> Optional[Dict[str, Any]]:
        """Get metadata for a blob"""
        try:
            bucket = self.client.bucket(bucket_name)
            blob = bucket.get_blob(blob_name)
            
            if blob is None:
                return None
                
            return {
                'name': blob.name,
                'size': blob.size,
                'content_type': blob.content_type,
                'time_created': blob.time_created,
                'updated': blob.updated,
                'metadata': blob.metadata or {}
            }
        except Exception as e:
            logger.error(f"Error getting metadata for {blob_name}: {str(e)}")
            return None
