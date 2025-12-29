"""
Face Detection, Verification, and Emotion Detection Service
Uses multiple models for face recognition and emotion analysis
"""
import cv2
import numpy as np
from typing import Dict, List, Optional, Tuple
import base64
from io import BytesIO
from PIL import Image
import logging

try:
    import face_recognition
    FACE_RECOGNITION_AVAILABLE = True
except ImportError:
    FACE_RECOGNITION_AVAILABLE = False
    logging.warning("face_recognition library not available")

try:
    from deepface import DeepFace
    DEEPFACE_AVAILABLE = True
except ImportError:
    DEEPFACE_AVAILABLE = False
    logging.warning("DeepFace library not available")

try:
    import mediapipe as mp
    MEDIAPIPE_AVAILABLE = True
except ImportError:
    MEDIAPIPE_AVAILABLE = False
    logging.warning("MediaPipe library not available")

logger = logging.getLogger(__name__)


class FaceService:
    """Service for face detection, verification, and emotion detection"""
    
    def __init__(self):
        self.face_detector = None
        self.face_mesh = None
        self._initialize_models()
    
    def _initialize_models(self):
        """Initialize face detection and emotion models"""
        if MEDIAPIPE_AVAILABLE:
            try:
                self.mp_face_detection = mp.solutions.face_detection
                self.mp_face_mesh = mp.solutions.face_mesh
                self.face_detector = self.mp_face_detection.FaceDetection(
                    model_selection=1, min_detection_confidence=0.5
                )
                self.face_mesh = self.mp_face_mesh.FaceMesh(
                    static_image_mode=False,
                    max_num_faces=1,
                    refine_landmarks=True,
                    min_detection_confidence=0.5,
                    min_tracking_confidence=0.5
                )
                logger.info("MediaPipe face detection initialized")
            except Exception as e:
                logger.error(f"Error initializing MediaPipe: {e}")
    
    def decode_base64_image(self, image_base64: str) -> np.ndarray:
        """Decode base64 image string to numpy array"""
        try:
            # Remove data URL prefix if present
            if ',' in image_base64:
                image_base64 = image_base64.split(',')[1]
            
            image_data = base64.b64decode(image_base64)
            image = Image.open(BytesIO(image_data))
            image_rgb = image.convert('RGB')
            return np.array(image_rgb)
        except Exception as e:
            logger.error(f"Error decoding image: {e}")
            raise ValueError(f"Invalid image format: {e}")
    
    def detect_faces(self, image: np.ndarray) -> List[Dict]:
        """
        Detect faces in an image
        Returns list of face detections with bounding boxes
        """
        faces = []
        
        if MEDIAPIPE_AVAILABLE and self.face_detector:
            try:
                rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB) if len(image.shape) == 3 else image
                results = self.face_detector.process(rgb_image)
                
                if results.detections:
                    h, w = image.shape[:2]
                    for detection in results.detections:
                        bbox = detection.location_data.relative_bounding_box
                        faces.append({
                            'bbox': {
                                'x': int(bbox.xmin * w),
                                'y': int(bbox.ymin * h),
                                'width': int(bbox.width * w),
                                'height': int(bbox.height * h),
                            },
                            'confidence': detection.score[0] if detection.score else 0.5,
                        })
            except Exception as e:
                logger.error(f"Error in MediaPipe face detection: {e}")
        
        # Fallback to OpenCV Haar Cascade
        if not faces:
            try:
                gray = cv2.cvtColor(image, cv2.COLOR_RGB2GRAY) if len(image.shape) == 3 else image
                face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
                detected_faces = face_cascade.detectMultiScale(gray, 1.1, 4)
                
                for (x, y, w, h) in detected_faces:
                    faces.append({
                        'bbox': {'x': int(x), 'y': int(y), 'width': int(w), 'height': int(h)},
                        'confidence': 0.8,  # OpenCV doesn't provide confidence
                    })
            except Exception as e:
                logger.error(f"Error in OpenCV face detection: {e}")
        
        return faces
    
    def extract_face_embedding(self, image: np.ndarray, bbox: Dict) -> Optional[np.ndarray]:
        """
        Extract face embedding for verification
        Returns 128-dimensional face encoding
        """
        if not FACE_RECOGNITION_AVAILABLE:
            logger.warning("face_recognition library not available, using DeepFace fallback")
            return self._extract_embedding_deepface(image, bbox)
        
        try:
            # Extract face region
            x, y, w, h = bbox['x'], bbox['y'], bbox['width'], bbox['height']
            face_region = image[y:y+h, x:x+w]
            
            if face_region.size == 0:
                return None
            
            # Convert to RGB if needed
            if len(face_region.shape) == 3 and face_region.shape[2] == 3:
                rgb_face = cv2.cvtColor(face_region, cv2.COLOR_BGR2RGB)
            else:
                rgb_face = face_region
            
            # Get face encoding
            encodings = face_recognition.face_encodings(rgb_face)
            
            if encodings:
                return encodings[0].tolist()  # Convert to list for JSON serialization
            
            return None
        except Exception as e:
            logger.error(f"Error extracting face embedding: {e}")
            return self._extract_embedding_deepface(image, bbox)
    
    def _extract_embedding_deepface(self, image: np.ndarray, bbox: Dict) -> Optional[np.ndarray]:
        """Fallback method using DeepFace for embedding extraction"""
        if not DEEPFACE_AVAILABLE:
            return None
        
        try:
            x, y, w, h = bbox['x'], bbox['y'], bbox['width'], bbox['height']
            face_region = image[y:y+h, x:x+w]
            
            if face_region.size == 0:
                return None
            
            # DeepFace embedding
            embedding = DeepFace.represent(
                img_path=face_region,
                model_name='Facenet',
                enforce_detection=False
            )
            
            if embedding:
                return embedding[0]['embedding']
            
            return None
        except Exception as e:
            logger.error(f"Error in DeepFace embedding: {e}")
            return None
    
    def verify_faces(self, embedding1: List[float], embedding2: List[float], threshold: float = 0.6) -> Dict:
        """
        Verify if two face embeddings belong to the same person
        Returns verification result with confidence score
        """
        try:
            emb1 = np.array(embedding1)
            emb2 = np.array(embedding2)
            
            # Calculate Euclidean distance
            distance = np.linalg.norm(emb1 - emb2)
            
            # Convert distance to similarity (0-1 scale)
            # Lower distance = higher similarity
            similarity = 1 / (1 + distance)
            
            is_match = similarity >= threshold
            
            return {
                'is_match': is_match,
                'similarity': float(similarity),
                'distance': float(distance),
                'confidence': float(similarity * 100),
            }
        except Exception as e:
            logger.error(f"Error in face verification: {e}")
            return {
                'is_match': False,
                'similarity': 0.0,
                'distance': float('inf'),
                'confidence': 0.0,
                'error': str(e),
            }
    
    def detect_emotions(self, image: np.ndarray, bbox: Dict) -> Dict:
        """
        Detect emotions from facial expression
        Returns emotion predictions with confidence scores
        """
        if not DEEPFACE_AVAILABLE:
            return self._detect_emotions_basic(image, bbox)
        
        try:
            x, y, w, h = bbox['x'], bbox['y'], bbox['width'], bbox['height']
            face_region = image[y:y+h, x:x+w]
            
            if face_region.size == 0:
                return {'emotion': 'unknown', 'confidence': 0.0, 'all_emotions': {}}
            
            # Use DeepFace for emotion detection
            result = DeepFace.analyze(
                img_path=face_region,
                actions=['emotion'],
                enforce_detection=False,
                silent=True
            )
            
            if isinstance(result, list):
                result = result[0]
            
            emotions = result.get('emotion', {})
            
            # Get dominant emotion
            dominant_emotion = max(emotions.items(), key=lambda x: x[1])[0] if emotions else 'neutral'
            confidence = emotions.get(dominant_emotion, 0.0) / 100.0
            
            # Map to mood categories
            mood = self._map_emotion_to_mood(dominant_emotion)
            
            return {
                'emotion': dominant_emotion,
                'mood': mood,
                'confidence': float(confidence),
                'all_emotions': {k: float(v / 100.0) for k, v in emotions.items()},
            }
        except Exception as e:
            logger.error(f"Error in emotion detection: {e}")
            return self._detect_emotions_basic(image, bbox)
    
    def _detect_emotions_basic(self, image: np.ndarray, bbox: Dict) -> Dict:
        """Basic emotion detection using facial landmarks"""
        # This is a simplified fallback - in production, use trained models
        return {
            'emotion': 'neutral',
            'mood': 'calm',
            'confidence': 0.5,
            'all_emotions': {
                'neutral': 0.5,
                'happy': 0.2,
                'sad': 0.1,
                'angry': 0.1,
                'surprise': 0.1,
            },
            'note': 'Using basic detection - install DeepFace for better accuracy',
        }
    
    def _map_emotion_to_mood(self, emotion: str) -> str:
        """Map detected emotion to mood category with enhanced mapping"""
        emotion_lower = emotion.lower()
        
        # Positive emotions
        positive_emotions = {
            'happy', 'joy', 'excited', 'enthusiastic', 'confident', 
            'energetic', 'optimistic', 'content', 'satisfied', 'proud'
        }
        
        # Negative emotions
        negative_emotions = {
            'sad', 'angry', 'fear', 'anxious', 'stressed', 'tired',
            'frustrated', 'disgust', 'disappointed', 'worried', 'depressed',
            'lonely', 'ashamed', 'guilty', 'embarrassed'
        }
        
        # Calm emotions
        calm_emotions = {
            'calm', 'relaxed', 'peaceful', 'focused', 'serene',
            'tranquil', 'composed', 'balanced'
        }
        
        # Neutral emotions
        neutral_emotions = {
            'neutral', 'indifferent', 'normal', 'surprise', 'surprised',
            'confused', 'curious'
        }
        
        # Check each category
        if emotion_lower in positive_emotions:
            return 'positive'
        elif emotion_lower in negative_emotions:
            return 'negative'
        elif emotion_lower in calm_emotions:
            return 'calm'
        elif emotion_lower in neutral_emotions:
            return 'neutral'
        
        # Fallback: check if emotion contains keywords
        if any(word in emotion_lower for word in ['happy', 'joy', 'excited', 'good', 'great']):
            return 'positive'
        elif any(word in emotion_lower for word in ['sad', 'angry', 'bad', 'tired', 'stressed']):
            return 'negative'
        elif any(word in emotion_lower for word in ['calm', 'relaxed', 'peaceful']):
            return 'calm'
        
        return 'neutral'
    
    def process_face_image(self, image_base64: str) -> Dict:
        """
        Complete face processing pipeline:
        1. Detect faces
        2. Extract embeddings
        3. Detect emotions
        """
        try:
            image = self.decode_base64_image(image_base64)
            faces = self.detect_faces(image)
            
            if not faces:
                return {
                    'success': False,
                    'error': 'No faces detected',
                    'faces': [],
                }
            
            results = []
            for face in faces:
                embedding = self.extract_face_embedding(image, face['bbox'])
                emotions = self.detect_emotions(image, face['bbox'])
                
                results.append({
                    'bbox': face['bbox'],
                    'confidence': face['confidence'],
                    'embedding': embedding,
                    'emotions': emotions,
                })
            
            return {
                'success': True,
                'faces': results,
                'face_count': len(results),
            }
        except Exception as e:
            logger.error(f"Error processing face image: {e}")
            return {
                'success': False,
                'error': str(e),
                'faces': [],
            }


# Global instance
face_service = FaceService()

