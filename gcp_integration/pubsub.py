from google.cloud import pubsub_v1
from typing import Callable, Dict, Any, Optional
import json
import logging
import asyncio
from concurrent.futures import TimeoutError

logger = logging.getLogger(__name__)

class PubSubManager:
    def __init__(self, project_id: str):
        """Initialize Pub/Sub client"""
        self.project_id = project_id
        self.publisher = pubsub_v1.PublisherClient()
        self.subscriber = pubsub_v1.SubscriberClient()
        logger.info("Pub/Sub client initialized")
    
    async def publish_message(
        self, 
        topic_id: str, 
        data: Dict[str, Any], 
        attributes: Optional[Dict[str, str]] = None
    ) -> str:
        """Publish a message to a topic"""
        try:
            topic_path = self.publisher.topic_path(self.project_id, topic_id)
            data_bytes = json.dumps(data).encode("utf-8")
            future = self.publisher.publish(
                topic_path, 
                data=data_bytes,
                **attributes or {}
            )
            message_id = future.result()
            logger.info(f"Published message {message_id} to {topic_id}")
            return message_id
        except Exception as e:
            logger.error(f"Error publishing message to {topic_id}: {str(e)}")
            raise
    
    async def create_subscription(
        self, 
        topic_id: str, 
        subscription_id: str,
        ack_deadline_seconds: int = 60
    ) -> bool:
        """Create a new subscription"""
        try:
            topic_path = self.publisher.topic_path(self.project_id, topic_id)
            subscription_path = self.subscriber.subscription_path(
                self.project_id, subscription_id
            )
            
            subscription = self.subscriber.create_subscription(
                request={
                    "name": subscription_path,
                    "topic": topic_path,
                    "ack_deadline_seconds": ack_deadline_seconds,
                }
            )
            logger.info(f"Created subscription {subscription.name}")
            return True
        except Exception as e:
            logger.error(f"Error creating subscription: {str(e)}")
            return False
    
    async def subscribe(
        self, 
        subscription_id: str, 
        callback: Callable[[Dict[str, Any], Dict[str, str]], None],
        timeout: Optional[float] = None
    ) -> None:
        """Subscribe to a subscription with a callback"""
        subscription_path = self.subscriber.subscription_path(
            self.project_id, subscription_id
        )
        
        def callback_wrapper(message):
            try:
                data = json.loads(message.data.decode("utf-8"))
                attributes = dict(message.attributes)
                callback(data, attributes)
                message.ack()
            except Exception as e:
                logger.error(f"Error processing message: {str(e)}")
                message.nack()
        
        future = self.subscriber.subscribe(subscription_path, callback_wrapper)
        
        try:
            future.result(timeout=timeout) if timeout else future.result()
        except TimeoutError:
            future.cancel()
            logger.info("Subscription timed out")
        except Exception as e:
            logger.error(f"Error in subscription: {str(e)}")
            future.cancel()
            raise
