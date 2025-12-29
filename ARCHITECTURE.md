# Architecture Documentation

## System Overview

The platform is built as a full-stack web application with clear separation between frontend and backend, designed for scalability and maintainability.

## Tech Stack

### Frontend
- **Next.js 14** (App Router) - React framework with SSR/SSG
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first styling
- **Zustand** - State management
- **Axios** - HTTP client

### Backend
- **FastAPI** - Modern Python web framework
- **SQLAlchemy** - ORM for database
- **PostgreSQL** - Relational database
- **FAISS** - Vector database for embeddings
- **JWT** - Authentication

### AI/ML
- **OpenAI API** - LLM provider (primary)
- **Anthropic Claude** - Alternative LLM provider
- **Sentence Transformers** - Embeddings generation
- **Provider-agnostic abstraction** - Easy to swap providers

## Project Structure

```
devfest2025/
├── frontend/
│   ├── app/                    # Next.js App Router
│   │   ├── dashboard/          # Dashboard page
│   │   ├── features/           # Feature pages
│   │   ├── auth/               # Authentication pages
│   │   └── layout.tsx          # Root layout
│   ├── components/             # Reusable components (if any)
│   ├── lib/                    # Utilities and API clients
│   │   ├── api/                # API client functions
│   │   └── store/              # Zustand stores
│   └── styles/                 # Global styles
│       └── design-tokens.css   # CSS variables
│
├── backend/
│   ├── app/
│   │   ├── core/               # Core configuration
│   │   │   ├── config.py       # Settings
│   │   │   ├── database.py     # DB connection
│   │   │   └── security.py     # Auth utilities
│   │   ├── models/             # SQLAlchemy models
│   │   ├── schemas/            # Pydantic schemas
│   │   ├── routers/            # API routes
│   │   └── services/           # Business logic
│   │       ├── ai/             # AI services
│   │       ├── study_decision_service.py
│   │       ├── resource_service.py
│   │       └── content_generator_service.py
│   └── main.py                 # FastAPI app entry
│
└── shared/                     # Shared types (if needed)
```

## Design System

### CSS Variables

All colors are defined as CSS variables in `frontend/styles/design-tokens.css`:

```css
--color-primary
--color-secondary
--color-background
--color-surface
--color-text
--color-muted
--color-accent
--color-success
--color-warning
--color-danger
```

Tailwind config references these variables, making theming straightforward.

### Responsive Design

- **Mobile-first** approach
- Breakpoints: `sm:`, `md:`, `lg:`
- Different UI patterns for mobile vs desktop
- Bottom navigation on mobile, sidebar on desktop

## Core Features Architecture

### 1. AI Student Chatbot

**Frontend:**
- Chat interface with message history
- Short answers on mobile, detailed on desktop
- Multilingual support

**Backend:**
- `LLMService` - Provider-agnostic LLM abstraction
- Context injection (user level, modules)
- Message history stored in database

**Flow:**
1. User sends message → Frontend API call
2. Backend saves user message
3. LLM service generates response
4. Backend saves assistant message
5. Response returned to frontend

### 2. AI Study Decision Engine

**Key Design:**
- **NOT pure LLM decision** - Uses rule-based scoring
- LLM only for explanations
- Deterministic, explainable logic

**Scoring Algorithm:**
1. Calculate priority score for each module:
   - Difficulty × energy multiplier
   - Exam date proximity (exponential decay)
   - Progress deficit
   - Mood/energy adjustments

2. Select highest-scoring module

3. Determine activity:
   - Low energy/short time → flashcards
   - High energy/long time → practice
   - Medium → revise

4. Generate AI explanation

**Files:**
- `backend/app/services/study_decision_service.py`
- `backend/app/routers/study_decision.py`

### 3. AI Resource Recommendation

**Architecture:**
- Embeddings for semantic search
- Rating-weighted ranking
- Similarity + popularity hybrid

**Flow:**
1. Generate embeddings for resources (on creation)
2. User ratings update popularity scores
3. Recommendation combines:
   - Embedding similarity (if user has preferences)
   - Average ratings
   - User's personal ratings
   - Resource type preferences

**Files:**
- `backend/app/services/resource_service.py`
- `backend/app/services/ai/embedding_service.py`

### 4. AI Content Generator

**Supported Types:**
- Summaries
- Flashcards (Q&A pairs)
- Quiz questions (multiple choice)
- Exam-style questions
- Pattern analysis

**Implementation:**
- LLM-based generation
- Structured output (JSON)
- Explainable insights

**Files:**
- `backend/app/services/content_generator_service.py`

### 5. Commute Mode

**Features:**
- Micro-podcasts (5-15 min)
- Quick games (logic, memory)
- Campus maps
- Context-aware suggestions

**Design:**
- Lightweight for slow connections
- Offline-friendly where possible
- Time/energy-based recommendations

## Database Schema

### Users
- `id`, `email`, `hashed_password`, `name`, `level`, `modules` (JSON)

### Chat Messages
- `id`, `user_id`, `role`, `content`, `timestamp`

### Resources
- `id`, `title`, `type`, `url`, `module_id`, `description`, `embedding`, `average_rating`

### Resource Ratings
- `id`, `user_id`, `resource_id`, `rating`, `created_at`

### Modules
- `id`, `name`, `code`, `difficulty`, `exam_date`

### Generated Content
- `id`, `user_id`, `type`, `content` (JSON), `module_id`, `metadata` (JSON)

## API Design

### Authentication
- JWT tokens
- `/api/v1/auth/login` - POST
- `/api/v1/auth/register` - POST
- `/api/v1/auth/me` - GET (protected)

### Chatbot
- `/api/v1/chatbot/chat` - POST
- `/api/v1/chatbot/history` - GET

### Study Decision
- `/api/v1/study-decision/recommend` - POST

### Resources
- `/api/v1/resources/recommend` - POST
- `/api/v1/resources` - GET
- `/api/v1/resources/{id}/rate` - POST

### Content Generator
- `/api/v1/content-generator/generate` - POST
- `/api/v1/content-generator/history` - GET

### Commute
- `/api/v1/commute/suggestions` - GET
- `/api/v1/commute/podcasts` - GET
- `/api/v1/commute/games` - GET

## Security

### Authentication
- JWT with expiration
- Password hashing (bcrypt)
- Token stored in localStorage (frontend)

### API Security
- CORS configuration
- Input validation (Pydantic)
- SQL injection protection (SQLAlchemy ORM)

### Best Practices
- Never expose API keys in frontend
- Validate all inputs
- Use HTTPS in production
- Rate limiting (to be added)

## AI Integration

### Provider Abstraction

`LLMService` provides a unified interface:

```python
await llm_service.chat_completion(
    message="...",
    context={...},
    language="en",
    short_answer=False,
)
```

Supports:
- OpenAI (GPT-3.5, GPT-4)
- Anthropic (Claude)
- Local models (via Ollama)
- Mock responses (development)

### Embeddings

`EmbeddingService` uses sentence-transformers:
- Model: `all-MiniLM-L6-v2` (default)
- Generates 384-dimensional vectors
- Cosine similarity for search

## Performance Considerations

### Frontend
- Next.js automatic code splitting
- Image optimization
- Lazy loading for routes
- PWA-ready for offline support

### Backend
- Async/await for I/O operations
- Database connection pooling
- Caching (to be implemented)
- Background tasks (Celery, optional)

### AI/ML
- Embedding model lazy loading
- Batch embedding generation
- Vector search optimization (FAISS)

## Scalability

### Horizontal Scaling
- Stateless API (JWT)
- Database connection pooling
- Redis for sessions (optional)

### Vertical Scaling
- Async FastAPI handles concurrency
- Efficient vector search (FAISS)
- Model caching

## Future Enhancements

1. **Real-time features** - WebSockets for live chat
2. **Advanced caching** - Redis for API responses
3. **Background jobs** - Celery for heavy tasks
4. **Analytics** - User behavior tracking
5. **Mobile app** - React Native (if needed)
6. **Offline mode** - Service workers, IndexedDB
7. **Multi-tenancy** - University-specific instances

## Development Workflow

1. **Frontend changes** → Hot reload (Next.js)
2. **Backend changes** → Auto-reload (uvicorn --reload)
3. **Database changes** → SQLAlchemy migrations (Alembic)
4. **API testing** → Swagger UI at `/docs`

## Deployment

### Frontend
- Build: `npm run build`
- Deploy to Vercel, Netlify, or any static host
- Environment variables in hosting platform

### Backend
- Deploy to Heroku, AWS, DigitalOcean
- Set environment variables
- Run migrations on deploy
- Use production database

### Database
- Managed PostgreSQL (AWS RDS, Heroku Postgres)
- Regular backups
- Connection pooling

## Monitoring

### Recommended Tools
- **Error tracking** - Sentry
- **Analytics** - Google Analytics, Plausible
- **Uptime** - UptimeRobot
- **Logs** - CloudWatch, Papertrail

## Code Quality

### Frontend
- TypeScript for type safety
- ESLint for linting
- Prettier for formatting (recommended)

### Backend
- Pydantic for validation
- Type hints throughout
- Docstrings for functions
- Error handling

