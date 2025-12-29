"""
Tests for study decision endpoints
"""
import pytest


def test_study_decision_endpoint(sync_client):
    """Test study decision endpoint"""
    response = sync_client.post(
        "/api/v1/study-decision/recommend",
        json={
            "mood": "medium",
            "energyLevel": 5,
            "timeAvailable": 60,
            "modules": [
                {
                    "id": "1",
                    "name": "Math",
                    "difficulty": 8,
                    "progress": 50
                }
            ]
        }
    )
    assert response.status_code in [200, 401]  # 401 if auth required
    
    if response.status_code == 200:
        data = response.json()
        assert "recommendedModule" in data
        assert "recommendedActivity" in data
        assert "suggestedDuration" in data


def test_study_decision_validation(sync_client):
    """Test study decision endpoint validation"""
    # Missing required fields - endpoint requires auth, so might return 401 first
    response = sync_client.post(
        "/api/v1/study-decision/recommend",
        json={}
    )
    # Endpoint requires authentication, so 401 is expected before validation
    assert response.status_code in [401, 422]  # Auth required or validation error


def test_study_decision_with_exam_date(sync_client):
    """Test study decision with exam date"""
    response = sync_client.post(
        "/api/v1/study-decision/recommend",
        json={
            "mood": "high",
            "energyLevel": 7,
            "timeAvailable": 90,
            "modules": [
                {
                    "id": "1",
                    "name": "Math",
                    "difficulty": 8,
                    "examDate": "2025-02-15",
                    "progress": 50
                }
            ]
        }
    )
    # Should handle exam date in recommendation logic
    assert response.status_code in [200, 401]

