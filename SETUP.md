# Setup Instructions

Complete setup guide for the AI-Powered Student Productivity Platform.

## Prerequisites

- **Node.js** 18+ and npm/yarn
- **Python** 3.10+
- **PostgreSQL** 14+
- (Optional) **Redis** for background tasks

## Quick Start

### 1. Clone and Navigate

```bash
cd devfest2025
```

### 2. Frontend Setup

```bash
cd frontend
npm install
```

Create `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Run development server:
```bash
npm run dev
```

Frontend will be available at `http://localhost:3000`

### 3. Backend Setup

```bash
cd backend
python -m venv venv
```

**Windows:**
```bash
venv\Scripts\activate
```

**Linux/Mac:**
```bash
source venv/bin/activate
```

Install dependencies:
```bash
pip install -r requirements.txt
```

Create `.env` file:
```env
SECRET_KEY=your-secret-key-change-in-production
DATABASE_URL=postgresql://user:password@localhost:5432/student_platform
OPENAI_API_KEY=your-openai-key-optional
LLM_PROVIDER=openai
CORS_ORIGINS=["http://localhost:3000"]
```

**Note:** For development without OpenAI API key, the system will use mock responses.

Set up PostgreSQL database:
```sql
CREATE DATABASE student_platform;
```

Run migrations (tables will be created automatically on first run):
```bash
uvicorn main:app --reload
```

Backend API will be available at `http://localhost:8000`

API documentation: `http://localhost:8000/docs`

## Configuration

### Environment Variables

#### Frontend (`frontend/.env.local`)
- `NEXT_PUBLIC_API_URL` - Backend API URL

#### Backend (`backend/.env`)
- `SECRET_KEY` - JWT secret key (change in production!)
- `DATABASE_URL` - PostgreSQL connection string
- `OPENAI_API_KEY` - OpenAI API key (optional for development)
- `ANTHROPIC_API_KEY` - Anthropic API key (optional)
- `LLM_PROVIDER` - `openai`, `anthropic`, or `local`
- `CORS_ORIGINS` - Allowed CORS origins (JSON array)
- `FAISS_INDEX_PATH` - Path for vector database index
- `EMBEDDING_MODEL` - Sentence transformer model name
- `REDIS_URL` - Redis connection URL (optional)

### AI Provider Setup

#### Option 1: OpenAI (Recommended for Production)
1. Get API key from https://platform.openai.com
2. Set `OPENAI_API_KEY` in `.env`
3. Set `LLM_PROVIDER=openai`

#### Option 2: Anthropic Claude
1. Get API key from https://console.anthropic.com
2. Set `ANTHROPIC_API_KEY` in `.env`
3. Set `LLM_PROVIDER=anthropic`

#### Option 3: Local/Development (No API Key)
- System uses mock responses
- Good for development and testing
- Set `LLM_PROVIDER=local` or leave empty

## Database Setup

### PostgreSQL

1. Install PostgreSQL: https://www.postgresql.org/download/

2. Create database:
```sql
CREATE DATABASE student_platform;
CREATE USER student_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE student_platform TO student_user;
```

3. Update `DATABASE_URL` in backend `.env`:
```
DATABASE_URL=postgresql://student_user:your_password@localhost:5432/student_platform
```

### Tables

Tables are created automatically on first run via SQLAlchemy. No manual migration needed for initial setup.

## Running the Application

### Development Mode

**Terminal 1 - Backend:**
```bash
cd backend
source venv/bin/activate  # or venv\Scripts\activate on Windows
uvicorn main:app --reload
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### Production Build

**Frontend:**
```bash
cd frontend
npm run build
npm start
```

**Backend:**
```bash
cd backend
uvicorn main:app --host 0.0.0.0 --port 8000
```

## Testing

### Test Login

The system supports demo mode. Use any email/password combination:
- Email: `test@university.edu`
- Password: `password123`

The system will auto-create the user on first login.

### API Testing

Visit `http://localhost:8000/docs` for interactive API documentation (Swagger UI).

## Features Overview

1. **AI Chatbot** - `/features/chatbot`
   - Context-aware university assistant
   - Multilingual support (EN/AR/FR)
   - Short answers on mobile

2. **Study Decision** - `/features/study-decision`
   - AI-powered study recommendations
   - Rule-based scoring + LLM explanations
   - Considers mood, energy, time, exam dates

3. **Resources** - `/features/resources`
   - Personalized resource recommendations
   - Embedding-based similarity search
   - Rating system

4. **Content Generator** - `/features/content-generator`
   - Summaries, flashcards, quizzes
   - Exam-style questions
   - Pattern analysis

5. **Commute Mode** - `/features/commute`
   - Lightweight mobile features
   - Micro-podcasts
   - Quick games
   - Campus maps

## Troubleshooting

### Frontend Issues

**Port already in use:**
```bash
# Kill process on port 3000
# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac:
lsof -ti:3000 | xargs kill
```

**Module not found:**
```bash
rm -rf node_modules package-lock.json
npm install
```

### Backend Issues

**Database connection error:**
- Check PostgreSQL is running
- Verify `DATABASE_URL` in `.env`
- Ensure database exists

**Import errors:**
```bash
pip install -r requirements.txt --upgrade
```

**CORS errors:**
- Add frontend URL to `CORS_ORIGINS` in backend `.env`

### AI/LLM Issues

**No API key:**
- System will use mock responses
- Features work but with placeholder content
- Add API key for real AI responses

**Rate limiting:**
- Check API key quotas
- Consider using local models for development

## Architecture Notes

### Design System
- All colors use CSS variables (see `frontend/styles/design-tokens.css`)
- Easily re-themeable
- Mobile-first responsive design

### AI Integration
- Provider-agnostic abstraction
- Supports OpenAI, Anthropic, local models
- Fallback to mocks for development

### Database
- PostgreSQL for relational data
- FAISS for vector search (embeddings)
- SQLAlchemy ORM

### Authentication
- JWT-based
- Token stored in localStorage
- Auto-refresh on API calls

## Next Steps

1. Add your OpenAI API key for real AI responses
2. Populate database with modules and resources
3. Customize design tokens for your brand
4. Set up production environment variables
5. Configure Redis for background tasks (optional)

## Support

For issues or questions, check:
- API docs: `http://localhost:8000/docs`
- Frontend console for errors
- Backend logs for API issues

