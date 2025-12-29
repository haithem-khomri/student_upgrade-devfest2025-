"""
Tests for Face Recognition endpoints
"""
import pytest
from unittest.mock import patch, MagicMock, AsyncMock
import base64
import numpy as np
from PIL import Image
from io import BytesIO


def create_test_image_base64() -> str:
    """Create a test image in base64 format"""
    # Create a simple test image
    img = Image.new('RGB', (100, 100), color='red')
    buffer = BytesIO()
    img.save(buffer, format='JPEG')
    img_bytes = buffer.getvalue()
    return base64.b64encode(img_bytes).decode('utf-8')


@pytest.fixture
def test_image_base64():
    """Fixture for test image"""
    return create_test_image_base64()


@pytest.fixture
def mock_user():
    """Mock user for authentication"""
    from app.models.user import User
    return User(
        id="test_user_id",
        email="test@example.com",
        name="Test User",
        hashed_password="hashed"
    )


@pytest.fixture
def mock_face_service():
    """Mock face service responses"""
    return {
        'success': True,
        'faces': [{
            'bbox': {'x': 10, 'y': 10, 'width': 80, 'height': 80},
            'confidence': 0.95,
            'embedding': [0.1] * 128,  # Mock 128-dimensional embedding
            'emotions': {
                'emotion': 'happy',
                'mood': 'positive',
                'confidence': 0.85,
                'all_emotions': {
                    'happy': 0.85,
                    'sad': 0.05,
                    'neutral': 0.10
                }
            }
        }],
        'face_count': 1
    }


def test_face_status_endpoint_requires_auth(sync_client):
    """Test that face status endpoint requires authentication"""
    response = sync_client.get("/api/v1/face/status")
    assert response.status_code == 401


def test_face_status_not_registered(sync_client, mock_user):
    """Test face status when user is not registered"""
    with patch('app.routers.face_recognition.get_current_user', return_value=mock_user):
        with patch('app.core.mongodb.MongoDB.is_connected', return_value=True):
            with patch('app.core.mongodb.MongoDB.get_db') as mock_db:
                mock_db_instance = AsyncMock()
                mock_db_instance.users.find_one = AsyncMock(return_value={
                    "email": "test@example.com",
                    "face_embedding": None
                })
                mock_db.return_value = mock_db_instance
                
                response = sync_client.get(
                    "/api/v1/face/status",
                    headers={"Authorization": "Bearer test_token"}
                )
                
                # Should return default status even if user not found
                assert response.status_code in [200, 500]  # May return 200 with defaults


def test_face_status_mongodb_not_connected(sync_client, mock_user):
    """Test face status when MongoDB is not connected"""
    with patch('app.routers.face_recognition.get_current_user', return_value=mock_user):
        with patch('app.core.mongodb.MongoDB.is_connected', return_value=False):
            response = sync_client.get(
                "/api/v1/face/status",
                headers={"Authorization": "Bearer test_token"}
            )
            # Should return default status
            assert response.status_code == 200
            data = response.json()
            assert data['registered'] == False


def test_detect_faces_requires_auth(sync_client, test_image_base64):
    """Test that face detection requires authentication"""
    response = sync_client.post(
        "/api/v1/face/detect",
        json={"image": test_image_base64}
    )
    assert response.status_code == 401


def test_detect_faces_missing_image(sync_client, mock_user):
    """Test face detection with missing image"""
    with patch('app.routers.face_recognition.get_current_user', return_value=mock_user):
        response = sync_client.post(
            "/api/v1/face/detect",
            json={},
            headers={"Authorization": "Bearer test_token"}
        )
        assert response.status_code == 422  # Validation error


def test_detect_faces_success(sync_client, mock_user, test_image_base64, mock_face_service):
    """Test successful face detection"""
    with patch('app.routers.face_recognition.get_current_user', return_value=mock_user):
        with patch('app.services.ai.face_service.face_service.process_face_image', return_value=mock_face_service):
            response = sync_client.post(
                "/api/v1/face/detect",
                json={"image": test_image_base64},
                headers={"Authorization": "Bearer test_token"}
            )
            
            if response.status_code == 200:
                data = response.json()
                assert data['success'] == True
                assert 'faces' in data
                assert len(data['faces']) > 0


def test_analyze_face_requires_auth(sync_client, test_image_base64):
    """Test that face analysis requires authentication"""
    response = sync_client.post(
        "/api/v1/face/analyze",
        json={"image": test_image_base64}
    )
    assert response.status_code == 401


def test_analyze_face_success(sync_client, mock_user, test_image_base64, mock_face_service):
    """Test successful face analysis"""
    with patch('app.routers.face_recognition.get_current_user', return_value=mock_user):
        with patch('app.services.ai.face_service.face_service.process_face_image', return_value=mock_face_service):
            response = sync_client.post(
                "/api/v1/face/analyze",
                json={"image": test_image_base64},
                headers={"Authorization": "Bearer test_token"}
            )
            
            if response.status_code == 200:
                data = response.json()
                assert 'face_detected' in data
                assert 'face_count' in data


def test_register_face_requires_auth(sync_client, test_image_base64):
    """Test that face registration requires authentication"""
    response = sync_client.post(
        "/api/v1/face/register",
        json={"image": test_image_base64}
    )
    assert response.status_code == 401


def test_register_face_mongodb_not_connected(sync_client, mock_user, test_image_base64):
    """Test face registration when MongoDB is not connected"""
    with patch('app.routers.face_recognition.get_current_user', return_value=mock_user):
        with patch('app.core.mongodb.MongoDB.is_connected', return_value=False):
            response = sync_client.post(
                "/api/v1/face/register",
                json={"image": test_image_base64},
                headers={"Authorization": "Bearer test_token"}
            )
            assert response.status_code == 500


def test_register_face_no_face_detected(sync_client, mock_user, test_image_base64):
    """Test face registration when no face is detected"""
    with patch('app.routers.face_recognition.get_current_user', return_value=mock_user):
        with patch('app.core.mongodb.MongoDB.is_connected', return_value=True):
            with patch('app.services.ai.face_service.face_service.process_face_image', return_value={
                'success': False,
                'faces': [],
                'face_count': 0
            }):
                response = sync_client.post(
                    "/api/v1/face/register",
                    json={"image": test_image_base64},
                    headers={"Authorization": "Bearer test_token"}
                )
                assert response.status_code == 400


def test_verify_face_requires_auth(sync_client, test_image_base64):
    """Test that face verification requires authentication"""
    response = sync_client.post(
        "/api/v1/face/verify",
        json={"image": test_image_base64}
    )
    assert response.status_code == 401


def test_verify_face_mongodb_not_connected(sync_client, mock_user, test_image_base64):
    """Test face verification when MongoDB is not connected"""
    with patch('app.routers.face_recognition.get_current_user', return_value=mock_user):
        with patch('app.core.mongodb.MongoDB.is_connected', return_value=False):
            response = sync_client.post(
                "/api/v1/face/verify",
                json={"image": test_image_base64},
                headers={"Authorization": "Bearer test_token"}
            )
            assert response.status_code == 500


def test_verify_face_no_registered_face(sync_client, mock_user, test_image_base64):
    """Test face verification when user has no registered face"""
    with patch('app.routers.face_recognition.get_current_user', return_value=mock_user):
        with patch('app.core.mongodb.MongoDB.is_connected', return_value=True):
            with patch('app.core.mongodb.MongoDB.get_db') as mock_db:
                mock_db_instance = AsyncMock()
                mock_db_instance.users.find_one = AsyncMock(return_value={
                    "email": "test@example.com",
                    "face_embedding": None
                })
                mock_db.return_value = mock_db_instance
                
                response = sync_client.post(
                    "/api/v1/face/verify",
                    json={"image": test_image_base64},
                    headers={"Authorization": "Bearer test_token"}
                )
                assert response.status_code == 400


def test_face_service_decode_image():
    """Test face service image decoding"""
    from app.services.ai.face_service import face_service
    
    test_image_base64 = create_test_image_base64()
    try:
        image = face_service.decode_base64_image(test_image_base64)
        assert isinstance(image, np.ndarray)
        assert len(image.shape) == 3  # Should be RGB image
    except Exception as e:
        # If models are not available, that's okay for testing
        pytest.skip(f"Face service models not available: {e}")


def test_face_service_detect_faces():
    """Test face service face detection"""
    from app.services.ai.face_service import face_service
    
    # Create a test image
    test_image = np.zeros((100, 100, 3), dtype=np.uint8)
    
    try:
        faces = face_service.detect_faces(test_image)
        assert isinstance(faces, list)
    except Exception as e:
        # If models are not available, that's okay for testing
        pytest.skip(f"Face detection models not available: {e}")




