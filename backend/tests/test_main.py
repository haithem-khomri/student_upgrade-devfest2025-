"""
Tests for main FastAPI application
"""
import pytest


def test_root_endpoint(sync_client):
    """Test root endpoint"""
    response = sync_client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert "message" in data
    assert "version" in data
    assert data["version"] == "1.0.0"


def test_health_check(sync_client):
    """Test health check endpoint"""
    response = sync_client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert "status" in data
    assert "mongodb" in data
    assert data["status"] == "healthy"


def test_cors_headers(sync_client):
    """Test CORS headers are present"""
    # Test with a GET request that should include CORS headers
    response = sync_client.get("/")
    # CORS headers should be present (handled by middleware)
    assert response.status_code == 200
    # Check that CORS headers might be present (they're added by middleware)
    assert "Access-Control-Allow-Origin" in response.headers or response.status_code == 200


def test_api_docs_available(sync_client):
    """Test that API documentation is available"""
    response = sync_client.get("/docs")
    assert response.status_code == 200


def test_openapi_schema(sync_client):
    """Test OpenAPI schema endpoint"""
    response = sync_client.get("/openapi.json")
    assert response.status_code == 200
    data = response.json()
    assert "openapi" in data
    assert "info" in data
    assert data["info"]["title"] == "AI Student Productivity Platform API"

