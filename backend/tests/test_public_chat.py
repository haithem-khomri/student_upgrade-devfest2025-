"""
Tests for public chat endpoints
"""
import pytest


def test_public_chat_endpoint(sync_client):
    """Test public chat endpoint"""
    response = sync_client.post(
        "/api/chat",
        json={
            "message": "مرحبا",
            "language": "ar"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert "message" in data or "response" in data


def test_public_chat_without_message(sync_client):
    """Test public chat endpoint without message"""
    response = sync_client.post(
        "/api/chat",
        json={}
    )
    # Should either return 422 (validation error) or handle gracefully
    assert response.status_code in [200, 422, 400]


def test_public_chat_different_languages(sync_client):
    """Test public chat with different languages"""
    languages = ["ar", "en", "fr"]
    
    for lang in languages:
        response = sync_client.post(
            "/api/chat",
            json={
                "message": "Hello",
                "language": lang
            }
        )
        assert response.status_code == 200

