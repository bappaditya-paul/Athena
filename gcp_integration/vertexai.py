from typing import Dict, Any, List, Optional
from google.cloud import aiplatform
import logging
import json

logger = logging.getLogger(__name__)

class VertexAIManager:
    def __init__(
        self, 
        project_id: str, 
        location: str = "us-central1",
        staging_bucket: Optional[str] = None
    ):
        """Initialize Vertex AI client"""
        try:
            self.project_id = project_id
            self.location = location
            self.staging_bucket = staging_bucket
            
            # Initialize Vertex AI
            aiplatform.init(
                project=project_id,
                location=location,
                staging_bucket=staging_bucket
            )
            
            logger.info("Vertex AI client initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize Vertex AI: {str(e)}")
            raise
    
    async def deploy_model(
        self,
        model_display_name: str,
        container_image_uri: str,
        machine_type: str = "n1-standard-4",
        min_replica_count: int = 1,
        max_replica_count: int = 1,
        labels: Optional[Dict[str, str]] = None
    ) -> Optional[str]:
        """Deploy a custom container model to Vertex AI"""
        try:
            # Create and deploy the model
            model = aiplatform.Model.upload(
                display_name=model_display_name,
                serving_container_image_uri=container_image_uri,
                labels=labels or {}
            )
            
            endpoint = model.deploy(
                machine_type=machine_type,
                min_replica_count=min_replica_count,
                max_replica_count=max_replica_count
            )
            
            logger.info(f"Model deployed to endpoint: {endpoint.resource_name}")
            return endpoint.resource_name
            
        except Exception as e:
            logger.error(f"Error deploying model {model_display_name}: {str(e)}")
            return None
    
    async def predict(
        self, 
        endpoint_id: str, 
        instances: List[Dict[str, Any]],
        parameters: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Make a prediction request to a deployed model"""
        try:
            endpoint = aiplatform.Endpoint(endpoint_id)
            prediction = endpoint.predict(
                instances=instances,
                parameters=parameters or {}
            )
            
            return {
                'predictions': prediction.predictions,
                'deployed_model_id': prediction.deployed_model_id,
                'model_version_id': prediction.model_version_id,
                'model_resource_name': prediction.model
            }
            
        except Exception as e:
            logger.error(f"Error making prediction: {str(e)}")
            raise
    
    async def create_batch_prediction_job(
        self,
        job_display_name: str,
        model_name: str,
        input_uri: str,
        output_uri: str,
        machine_type: str = "n1-standard-4",
        accelerator_count: int = 0,
        accelerator_type: str = "ACCELERATOR_TYPE_UNSPECIFIED"
    ) -> Optional[str]:
        """Create a batch prediction job"""
        try:
            model = aiplatform.Model(model_name=model_name)
            
            batch_prediction_job = model.batch_predict(
                job_display_name=job_display_name,
                gcs_source=input_uri,
                gcs_destination_prefix=output_uri,
                machine_type=machine_type,
                accelerator_count=accelerator_count,
                accelerator_type=accelerator_type,
                sync=True
            )
            
            logger.info(f"Batch prediction job created: {batch_prediction_job.resource_name}")
            return batch_prediction_job.resource_name
            
        except Exception as e:
            logger.error(f"Error creating batch prediction job: {str(e)}")
            return None
    
    async def get_model_evaluation(
        self, 
        model_name: str, 
        evaluation_id: str
    ) -> Optional[Dict[str, Any]]:
        """Get evaluation results for a model"""
        try:
            model = aiplatform.Model(model_name=model_name)
            evaluation = model.get_model_evaluation(evaluation_id=evaluation_id)
            
            return {
                'name': evaluation.name,
                'metrics': evaluation.metrics,
                'metrics_schema_uri': evaluation.metrics_schema_uri,
                'create_time': evaluation.create_time,
                'data_item_schema_uri': evaluation.data_item_schema_uri,
                'annotation_schema_uri': evaluation.annotation_schema_uri,
                'metadata': evaluation.metadata
            }
            
        except Exception as e:
            logger.error(f"Error getting model evaluation: {str(e)}")
            return None
