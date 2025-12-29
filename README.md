# AI-Powered Student Productivity Platform 🎓

A comprehensive, production-ready web platform designed for university students, featuring AI-powered productivity tools optimized for both desktop and mobile use.

## 🌟 Features

### Core Features
- **AI Student Chatbot** - Context-aware assistant for university questions using Gemini API
- **AI Study Decision Engine** - Intelligent study recommendations based on schedule and priorities
- **AI Resource Recommendation** - Personalized learning resources based on student profile
- **AI Content Generator** - Generate summaries, flashcards, and quizzes from course materials
- **Face Recognition & Mood Detection** - Detect student mood and provide personalized learning recommendations
- **Commute Mode** - Lightweight features optimized for mobile use during travel
- **Module Management** - Complete CRUD operations for courses, TDs, and exams
- **Progress Tracking** - Visual progress indicators and grade tracking
- **Difficulty Rating** - Personalized difficulty levels for each module

### Face Recognition Features
- **Face Detection** - Real-time face detection using MediaPipe
- **Face Verification** - Verify identity using face embeddings
- **Emotion Detection** - Detect emotions using DeepFace
- **Mood-Based Recommendations** - Personalized learning suggestions based on detected mood
- **Camera Integration** - Seamless camera access with proper error handling

## 🏗️ Architecture

- **Frontend**: Next.js 14+ (App Router), TypeScript, Tailwind CSS, PWA-ready
- **Backend**: Python FastAPI, REST APIs, Background tasks
- **AI**: LLM integration (Google Gemini), Embeddings + Vector search (FAISS)
- **Database**: PostgreSQL + MongoDB + FAISS (vector database)
- **Auth**: JWT authentication
- **Face Recognition**: MediaPipe, face-recognition (dlib), DeepFace

## 📁 Project Structure

```
devfest2025/
├── frontend/                    # Next.js application
│   ├── app/                     # App router pages
│   │   ├── dashboard/           # Dashboard pages
│   │   ├── features/            # Feature pages
│   │   │   └── face-recognition/# Face recognition feature
│   │   └── components/          # React components
│   ├── lib/                     # Utilities and stores
│   └── __tests__/               # Test files
├── backend/                     # FastAPI application
│   ├── app/
│   │   ├── routers/             # API routes
│   │   ├── services/            # Business logic
│   │   │   └── ai/              # AI services
│   │   └── models/              # Data models
│   └── tests/                   # Test files
└── README.md
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm/yarn
- Python 3.10+
- PostgreSQL 14+
- MongoDB (for face recognition data)
- (Optional) Redis for background tasks

### Frontend Setup

```bash
cd frontend
npm install
npm run dev          # Development server
npm run build        # Production build
npm run test         # Run tests
```

### Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

### Environment Variables

#### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

#### Backend (.env)
```env
DATABASE_URL=postgresql://user:password@localhost/dbname
MONGODB_URL=mongodb://localhost:27017
GEMINI_API_KEY=your_gemini_api_key
SECRET_KEY=your_secret_key
```

## 🧪 Testing

### Frontend Tests
```bash
cd frontend
npm test              # Run all tests
npm test -- --watch   # Watch mode
npm test -- --coverage # With coverage
```

### Backend Tests
```bash
cd backend
pytest tests/ -v              # Run all tests
pytest tests/ -v --cov=app   # With coverage
pytest tests/test_face_recognition.py  # Run specific file
```

### Test Coverage

- **Frontend**: Core API clients, stores, hooks, and components
- **Backend**: API endpoints, services, and business logic
- **Face Recognition**: Endpoints, services, and utilities

## 📱 Responsive Design

- Mobile-first approach
- Optimized for slow connections in commute mode
- Different UX patterns for mobile vs desktop
- PWA support for offline functionality

## 🔐 Authentication

JWT-based authentication with secure token management. Supports:
- Real backend authentication
- Demo mode for testing
- Token validation and refresh

## 🤖 AI Integration

### LLM Provider
- **Google Gemini API** - Primary LLM provider for chatbot and content generation

### Face Recognition Models
- **MediaPipe** - Face detection
- **face-recognition (dlib)** - Face embeddings and verification
- **DeepFace** - Emotion detection

## 🎨 Design System

All colors are defined as CSS variables for easy theming. See `frontend/styles/design-tokens.css`.

## 📚 API Documentation

API documentation is available at `/docs` when running the backend server.

### Key Endpoints

- `POST /api/v1/auth/login` - User authentication
- `POST /api/v1/face/detect` - Detect faces in image
- `POST /api/v1/face/analyze` - Analyze face emotions
- `POST /api/v1/face/register` - Register user face
- `POST /api/v1/face/verify` - Verify face identity
- `GET /api/v1/face/status` - Get registration status
- `POST /api/v1/chatbot/chat` - Chat with AI assistant
- `POST /api/v1/content-generator/*` - Generate content
- `POST /api/v1/study-decision` - Get study recommendations

## 🐳 Docker Support

### Backend Dockerfile
```bash
cd backend
docker build -t student-ai-backend .
docker run -p 8000:8000 student-ai-backend
```

### Frontend Dockerfile
```bash
cd frontend
docker build -t student-ai-frontend .
docker run -p 3000:3000 student-ai-frontend
```

### Docker Compose
```bash
docker-compose up -d
```

## 📦 Deployment

### Production Build

#### Frontend
```bash
cd frontend
npm run build
npm start
```

#### Backend
```bash
cd backend
uvicorn main:app --host 0.0.0.0 --port 8000
```

## 🔧 Development

### Code Quality
- TypeScript for type safety
- ESLint for code linting
- Prettier for code formatting
- Pytest for backend testing
- Jest for frontend testing

### Git Workflow
```bash
git checkout -b feature/your-feature
# Make changes
git add .
git commit -m "feat: your feature description"
git push origin feature/your-feature
```

## 📝 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 Support

For issues and questions, please open an issue on GitHub.

## 🎯 Roadmap

- [ ] Enhanced mood detection accuracy
- [ ] Multi-language support
- [ ] Advanced analytics dashboard
- [ ] Mobile app (React Native)
- [ ] Integration with university systems
- [ ] Real-time collaboration features

## 🙏 Acknowledgments

- Google Gemini API for LLM capabilities
- MediaPipe for face detection
- DeepFace for emotion detection
- Next.js and FastAPI communities
