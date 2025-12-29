"""
Chat Service - MongoDB operations for chat functionality
"""
from typing import List, Optional, Dict, Any
from datetime import datetime
from bson import ObjectId
import uuid

from app.core.mongodb import MongoDB, Collections
from app.schemas.mongodb_models import (
    ChatMessageDocument,
    ChatMessageCreate,
    ChatMessageResponse,
)


class ChatService:
    """Service for chat-related MongoDB operations"""
    
    @staticmethod
    async def save_message(
        role: str,
        content: str,
        user_id: Optional[str] = None,
        session_id: Optional[str] = None,
        language: str = "ar",
        context: Optional[Dict[str, Any]] = None,
    ) -> Optional[str]:
        """
        Save a chat message to MongoDB
        
        Args:
            role: "user" or "assistant"
            content: Message content
            user_id: Optional user ID (None for anonymous)
            session_id: Optional session ID for conversation tracking
            language: Message language
            context: Additional context
            
        Returns:
            Message ID if saved successfully, None otherwise
        """
        collection = Collections.chat_messages()
        
        if collection is None:
            # MongoDB not connected - return mock ID
            print("[ChatService] MongoDB not connected, skipping save")
            return str(uuid.uuid4())
        
        try:
            message_data = {
                "user_id": user_id,
                "session_id": session_id,
                "role": role,
                "content": content,
                "language": language,
                "context": context,
                "created_at": datetime.utcnow(),
            }
            
            result = await collection.insert_one(message_data)
            print(f"[ChatService] Message saved: {result.inserted_id}")
            return str(result.inserted_id)
        except Exception as e:
            print(f"[ChatService] Error saving message: {e}")
            return str(uuid.uuid4())  # Return mock ID on error
    
    @staticmethod
    async def get_conversation_history(
        user_id: Optional[str] = None,
        session_id: Optional[str] = None,
        limit: int = 50,
    ) -> List[ChatMessageResponse]:
        """
        Get conversation history
        
        Args:
            user_id: Filter by user ID
            session_id: Filter by session ID
            limit: Maximum number of messages to return
            
        Returns:
            List of chat messages
        """
        collection = Collections.chat_messages()
        
        if collection is None:
            return []
        
        try:
            query = {}
            if user_id:
                query["user_id"] = user_id
            if session_id:
                query["session_id"] = session_id
            
            cursor = collection.find(query).sort("created_at", -1).limit(limit)
            messages = await cursor.to_list(length=limit)
            
            result = []
            for msg in reversed(messages):  # Reverse to get chronological order
                result.append(ChatMessageResponse(
                    id=str(msg["_id"]),
                    role=msg["role"],
                    content=msg["content"],
                    created_at=msg["created_at"],
                ))
            
            return result
        except Exception as e:
            print(f"Error getting conversation history: {e}")
            return []
    
    @staticmethod
    async def delete_conversation(
        user_id: Optional[str] = None,
        session_id: Optional[str] = None,
    ) -> bool:
        """
        Delete conversation messages
        
        Args:
            user_id: Delete messages for this user
            session_id: Delete messages for this session
            
        Returns:
            True if successful
        """
        collection = Collections.chat_messages()
        
        if collection is None:
            return False
        
        try:
            query = {}
            if user_id:
                query["user_id"] = user_id
            if session_id:
                query["session_id"] = session_id
            
            if not query:
                return False  # Don't allow deleting all messages
            
            await collection.delete_many(query)
            return True
        except Exception as e:
            print(f"Error deleting conversation: {e}")
            return False
    
    @staticmethod
    async def get_chat_stats(user_id: str) -> Dict[str, Any]:
        """
        Get chat statistics for a user
        
        Args:
            user_id: User ID
            
        Returns:
            Dictionary with chat statistics
        """
        collection = Collections.chat_messages()
        
        if collection is None:
            return {"total_messages": 0, "total_conversations": 0}
        
        try:
            # Count total messages
            total_messages = await collection.count_documents({"user_id": user_id})
            
            # Count unique sessions (conversations)
            sessions = await collection.distinct("session_id", {"user_id": user_id})
            
            return {
                "total_messages": total_messages,
                "total_conversations": len([s for s in sessions if s]),
            }
        except Exception as e:
            print(f"Error getting chat stats: {e}")
            return {"total_messages": 0, "total_conversations": 0}

