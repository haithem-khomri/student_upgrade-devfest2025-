# Mood-Based Learning Recommendations | توصيات التعلم حسب المزاج

## Overview | نظرة عامة

This feature automatically detects the user's mood when they log in and enter the dashboard, then provides personalized learning recommendations based on their emotional state.

## How It Works | كيف يعمل

### 1. Automatic Mood Detection
- When a user logs in and enters the dashboard, the camera automatically opens
- The system continuously analyzes facial expressions to detect mood
- Once a confident mood is detected (confidence > 50%), the camera closes
- The mood is stored in session storage to prevent re-detection during the same session

### 2. Mood Categories
The system detects 4 main mood categories:

- **Positive (إيجابي)** 😊
  - User is in a good mood, energetic
  - Best for challenging content and new learning

- **Negative (سلبي)** 😔
  - User may feel tired or stressed
  - Best for easy review and short sessions

- **Calm (هادئ)** 😌
  - User is focused and relaxed
  - Best for deep learning and complex topics

- **Neutral (عادي)** 😐
  - Balanced emotional state
  - Flexible learning options

### 3. Personalized Recommendations

Based on the detected mood, the system provides:

#### For Positive Mood:
- **Challenging Content**: Suggest harder modules and new topics
- **Creative Projects**: Encourage creative and practical projects
- **Long Study Sessions**: 90-minute sessions with 30-minute breaks
- **High Intensity**: Focus on new concepts and challenging problems

#### For Negative Mood:
- **Easy Review**: Suggest familiar and easy materials
- **Short Sessions**: 20-minute sessions with 10-minute breaks
- **Video Content**: Prefer visual content over reading
- **Low Intensity**: Focus on review and easy practice
- **Break Option**: Suggest taking a break if needed

#### For Calm Mood:
- **Deep Learning**: Focus on complex topics requiring concentration
- **Reading**: Suggest academic papers and deep reading
- **Practice**: Recommend practical exercises and problem-solving
- **Medium Sessions**: 60-minute sessions with 20-minute breaks
- **Medium Intensity**: Balanced learning approach

#### For Neutral Mood:
- **Balanced Mix**: Mix of easy and challenging materials
- **Interactive Content**: Flashcards and quizzes
- **Planning**: Suggest planning future study sessions
- **Flexible Duration**: Adaptable study sessions

### 4. Module Recommendations

The system also filters and recommends modules based on mood:
- **Positive**: Suggests harder/difficult modules
- **Negative**: Suggests easier modules
- **Calm**: Suggests moderate difficulty modules
- **Neutral**: Balanced mix of module difficulties

## User Flow | تدفق المستخدم

1. **User logs in** → Redirected to dashboard
2. **Camera opens automatically** → Mood detection starts
3. **System analyzes face** → Detects mood every 2 seconds
4. **Mood detected** → Camera closes, recommendations appear
5. **User sees personalized suggestions** → Can dismiss or follow recommendations

## Technical Implementation | التنفيذ التقني

### Frontend Components

1. **MoodDetector.tsx**
   - Auto-starts camera on dashboard load
   - Continuously captures and analyzes images
   - Shows processing state
   - Closes automatically after detection

2. **MoodRecommendations.tsx**
   - Displays personalized recommendations
   - Shows study session suggestions
   - Lists recommended modules
   - Provides actionable learning suggestions

3. **Dashboard Integration**
   - Automatically shows mood detector on first visit
   - Stores mood in session storage
   - Displays recommendations after detection

### Backend Services

1. **Face Service** (`face_service.py`)
   - Detects faces in images
   - Analyzes emotions using DeepFace
   - Maps emotions to mood categories

2. **Mood Recommendation Service** (`mood_recommendation_service.py`)
   - Generates recommendations based on mood
   - Filters modules by difficulty
   - Suggests study session parameters

3. **API Endpoints**
   - `POST /api/v1/face/analyze` - Analyze face and detect mood
   - `POST /api/v1/mood/recommendations` - Get mood-based recommendations

## API Usage | استخدام الـ API

### Analyze Mood
```typescript
POST /api/v1/face/analyze
{
  "image": "base64_encoded_image"
}

Response:
{
  "face_detected": true,
  "emotions": {
    "emotion": "happy",
    "mood": "positive",
    "confidence": 0.85
  }
}
```

### Get Recommendations
```typescript
POST /api/v1/mood/recommendations
{
  "mood": "positive",
  "emotion": "happy",
  "confidence": 0.85
}

Response:
{
  "success": true,
  "recommendations": {
    "title": "مزاج إيجابي! وقت رائع للتعلم",
    "suggestions": [...],
    "recommended_modules": [...],
    "study_session": {
      "duration_minutes": 90,
      "break_interval": 30,
      "intensity": "high"
    }
  }
}
```

## Session Management | إدارة الجلسة

- Mood detection happens **once per session**
- Mood is stored in `sessionStorage` to prevent re-detection
- User can dismiss the mood detector
- Recommendations persist until user dismisses them

## Privacy & Security | الخصوصية والأمان

- **No image storage**: Images are processed in real-time, not stored
- **Local processing**: Face analysis happens on the backend
- **Session-based**: Mood data only stored in browser session
- **User control**: Users can skip mood detection

## Customization | التخصيص

### Adjust Detection Sensitivity
Edit `MoodDetector.tsx`:
```typescript
if (result && result.confidence > 0.5) { // Change threshold
```

### Modify Recommendations
Edit `mood_recommendation_service.py` to customize:
- Study session durations
- Module filtering logic
- Suggestion types

### Change Detection Interval
Edit `MoodDetector.tsx`:
```typescript
detectionIntervalRef.current = setInterval(async () => {
  // Detection logic
}, 2000); // Change interval (milliseconds)
```

## Troubleshooting | حل المشاكل

### Camera Not Opening
- Check browser permissions
- Ensure HTTPS (required for camera)
- Try different browser

### Mood Not Detecting
- Ensure good lighting
- Face camera directly
- Wait a few seconds for detection

### Recommendations Not Showing
- Check API connection
- Verify authentication token
- Check browser console for errors

## Future Enhancements | تحسينات مستقبلية

1. **Historical Mood Tracking**: Track mood over time
2. **Mood-Based Scheduling**: Auto-schedule study sessions based on mood patterns
3. **Adaptive Learning Path**: Adjust learning path based on mood history
4. **Mood Alerts**: Notify when mood changes significantly
5. **Multi-face Support**: Support for group study sessions

