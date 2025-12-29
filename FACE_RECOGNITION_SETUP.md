# Face Recognition Setup Guide | دليل إعداد التعرف على الوجه

## Overview | نظرة عامة

This feature provides:
- **Face Detection**: Detect faces in images
- **Face Verification**: Verify if a face matches a registered user
- **Emotion Detection**: Analyze facial expressions to detect mood and emotions

## Backend Setup | إعداد الـ Backend

### 1. Install Dependencies

The face recognition system uses multiple libraries. Install them:

```bash
cd backend
pip install -r requirements.txt
```

**Key Libraries:**
- `opencv-python` - Computer vision operations
- `face-recognition` - Face detection and recognition (uses dlib)
- `dlib` - Machine learning library (required for face-recognition)
- `deepface` - Deep learning for face recognition and emotion detection
- `mediapipe` - Google's framework for face detection

### 2. Install dlib (Important!)

`dlib` can be tricky to install. Here are options:

#### Option A: Using pip (Easiest)
```bash
pip install dlib
```

#### Option B: Using conda (Recommended for Windows)
```bash
conda install -c conda-forge dlib
```

#### Option C: Build from source (if above fail)
- Windows: Download pre-built wheels from [here](https://github.com/sachadee/Dlib)
- Linux/Mac: Follow [dlib installation guide](http://dlib.net/compile.html)

### 3. Download Models (Automatic)

The libraries will automatically download required models on first use:
- **face-recognition**: Downloads face encoding model (~100MB)
- **DeepFace**: Downloads emotion detection models (~500MB)
- **MediaPipe**: Models are included in the package

### 4. Verify Installation

Test the installation:

```bash
cd backend
python -c "import face_recognition; import cv2; import deepface; import mediapipe; print('All libraries installed successfully!')"
```

## Frontend Setup | إعداد الـ Frontend

### 1. No Additional Dependencies

The frontend uses native browser APIs:
- `getUserMedia()` for camera access
- Canvas API for image processing
- Fetch API for backend communication

### 2. Camera Permissions

Make sure your browser has camera permissions:
- Chrome/Edge: Settings → Privacy → Camera
- Firefox: Settings → Privacy → Permissions → Camera
- Safari: Preferences → Websites → Camera

## Usage | الاستخدام

### 1. Access the Feature

Navigate to: `/features/face-recognition`

### 2. Register Your Face

1. Click "تشغيل الكاميرا" (Start Camera)
2. Position your face in the camera view
3. Click "التقاط" (Capture)
4. Click "تسجيل الوجه" (Register Face)

**Optional**: Upload a reference poster image to verify against

### 3. Verify Your Face

1. Capture a new image
2. Click "التحقق" (Verify)
3. System will compare with your registered face

### 4. Analyze Emotions

1. Capture an image
2. Click "تحليل المشاعر" (Analyze Emotions)
3. View detected emotions and mood

## API Endpoints | نقاط الـ API

### POST `/api/v1/face/detect`
Detect faces in an image

**Request:**
```json
{
  "image": "base64_encoded_image"
}
```

**Response:**
```json
{
  "success": true,
  "faces": [
    {
      "bbox": {"x": 100, "y": 150, "width": 200, "height": 250},
      "confidence": 0.95,
      "embedding": [0.1, 0.2, ...],
      "emotions": {
        "emotion": "happy",
        "mood": "positive",
        "confidence": 0.85
      }
    }
  ],
  "face_count": 1
}
```

### POST `/api/v1/face/register`
Register a user's face

**Request:**
```json
{
  "image": "base64_encoded_image",
  "poster_image": "base64_encoded_poster_image" // optional
}
```

### POST `/api/v1/face/verify`
Verify if a face matches the registered face

**Request:**
```json
{
  "image": "base64_encoded_image",
  "threshold": 0.6 // optional, default 0.6
}
```

**Response:**
```json
{
  "verified": true,
  "similarity": 0.92,
  "confidence": 92.0,
  "emotions": {
    "emotion": "happy",
    "mood": "positive"
  }
}
```

### POST `/api/v1/face/analyze`
Complete face analysis (detection + emotions)

### GET `/api/v1/face/status`
Get user's face registration status

## Model Information | معلومات النماذج

### Face Detection Models

1. **MediaPipe Face Detection** (Primary)
   - Fast and accurate
   - Works in real-time
   - Model size: ~10MB

2. **OpenCV Haar Cascade** (Fallback)
   - Lightweight
   - Less accurate
   - No additional downloads

### Face Recognition Models

1. **face-recognition library** (Primary)
   - Uses dlib's face recognition model
   - 128-dimensional embeddings
   - High accuracy

2. **DeepFace Facenet** (Fallback)
   - Deep learning model
   - 512-dimensional embeddings
   - Requires more resources

### Emotion Detection Models

1. **DeepFace Emotion Model** (Primary)
   - Detects 7 emotions: happy, sad, angry, fear, surprise, neutral, disgust
   - Maps to mood categories: positive, negative, calm, neutral

2. **Basic Detection** (Fallback)
   - Simple landmark-based detection
   - Lower accuracy

## Troubleshooting | حل المشاكل

### Issue: "dlib not found"

**Solution:**
```bash
# Try conda
conda install -c conda-forge dlib

# Or use pre-built wheel for Windows
pip install https://github.com/sachadee/Dlib/releases/download/v19.22/dlib-19.22.99-cp39-cp39-win_amd64.whl
```

### Issue: "No faces detected"

**Solutions:**
- Ensure good lighting
- Face the camera directly
- Remove glasses/hats if possible
- Try different angles

### Issue: "Camera not accessible"

**Solutions:**
- Check browser permissions
- Use HTTPS (required for camera access)
- Try different browser
- Check if another app is using the camera

### Issue: "Model download failed"

**Solutions:**
- Check internet connection
- Models download on first use
- DeepFace models are large (~500MB)
- Be patient on first run

### Issue: "Low verification accuracy"

**Solutions:**
- Use higher quality images
- Ensure similar lighting conditions
- Face should be clearly visible
- Adjust threshold (default 0.6, try 0.5-0.7)

## Performance Tips | نصائح الأداء

1. **First Run**: Models download automatically (may take time)
2. **Processing Time**: 
   - Face detection: ~100-200ms
   - Face recognition: ~200-500ms
   - Emotion detection: ~500-1000ms
3. **Image Size**: Recommended 640x480 or smaller for faster processing
4. **Batch Processing**: Process multiple faces in parallel

## Security Considerations | اعتبارات الأمن

1. **Face Embeddings**: Stored as arrays in MongoDB
2. **Images**: Not stored, only processed
3. **Privacy**: Face data is user-specific and encrypted
4. **Authentication**: All endpoints require valid JWT token

## Next Steps | الخطوات التالية

1. **Training Custom Models**: You can train custom emotion detection models
2. **Real-time Detection**: Add WebSocket support for live video analysis
3. **Face Liveness Detection**: Add anti-spoofing measures
4. **Multi-face Support**: Enhance for multiple faces in one image

## Support | الدعم

For issues or questions:
- Check the troubleshooting section
- Review API documentation at `/docs`
- Check model download status in logs

