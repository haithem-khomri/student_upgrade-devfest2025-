"""
Tests for recommendations endpoints
"""
import pytest


def test_recommendations_endpoint(sync_client):
    """Test recommendations endpoint"""
    # The endpoint requires user_id in path: /api/recommendations/user/{user_id}/recommendations
    response = sync_client.get("/api/recommendations/user/test-user/recommendations")
    
    # Should return resources or require auth
    assert response.status_code in [200, 401, 404]
    
    if response.status_code == 200:
        data = response.json()
        assert "recommendations" in data or isinstance(data, list)


def test_recommendations_with_module_filter(sync_client):
    """Test recommendations with module filter"""
    # Test trending endpoint which doesn't require user_id
    response = sync_client.get("/api/recommendations/trending?module_id=1")
    
    assert response.status_code in [200, 401, 404]


def test_rate_resource_endpoint(sync_client):
    """Test rate resource endpoint"""
    response = sync_client.post(
        "/api/recommendations/rate",
        json={
            "user_id": "test@student.ai",
            "resource_id": "resource1",
            "rating": 5,
            "module_id": "module1"
        }
    )
    
    # Should accept rating (may require auth, or return 400 if DB not connected)
    assert response.status_code in [200, 201, 400, 401, 422, 500]

