# Backend Setup Guide | دليل إعداد الـ Backend

## Quick Start

1. Create a `.env` file in the `backend` folder
2. Configure MongoDB and LLM provider

---

## MongoDB Configuration

### Option 1: MongoDB Atlas (Recommended for Production)

1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Create a free cluster
3. Get your connection string
4. Add to `.env`:

```env
MONGODB_URL=mongodb+srv://username:password@cluster.xxxxx.mongodb.net/student_ai?retryWrites=true&w=majority
MONGODB_DB_NAME=student_ai
```

### Option 2: Local MongoDB

1. Install MongoDB locally
2. Add to `.env`:

```env
MONGODB_URL=mongodb://localhost:27017/student_ai
MONGODB_DB_NAME=student_ai
```

---

## LLM Configuration Options

### Option 1: OpenAI (GPT)

```env
LLM_PROVIDER=openai
OPENAI_API_KEY=sk-your-api-key-here
OPENAI_MODEL=gpt-4-turbo-preview
```

### Option 2: Anthropic (Claude)

```env
LLM_PROVIDER=anthropic
ANTHROPIC_API_KEY=sk-ant-your-api-key-here
ANTHROPIC_MODEL=claude-3-sonnet-20240229
```

### Option 3: Google (Gemini)

```env
LLM_PROVIDER=google
GOOGLE_API_KEY=your-api-key-here
GOOGLE_MODEL=gemini-pro
```

### Option 4: Custom API

For integrating your own LLM API:

```env
LLM_PROVIDER=custom
CUSTOM_LLM_API_URL=https://your-api.com/v1/chat
CUSTOM_LLM_API_KEY=your-api-key
```

**For Custom API**, you may need to modify the `CustomLLMProvider` class in:
`backend/app/services/ai/llm_service.py`

Edit these methods to match your API format:
- `_build_request()` - Build the request body
- `_build_headers()` - Set authentication headers
- `_parse_response()` - Parse the response

### Option 5: No LLM (Fallback Mode)

```env
LLM_PROVIDER=none
```

This uses predefined responses for common questions.

---

## Full .env Example

```env
# ============================================
# MongoDB Configuration
# ============================================
MONGODB_URL=mongodb+srv://username:password@cluster.xxxxx.mongodb.net/student_ai
MONGODB_DB_NAME=student_ai

# ============================================
# LLM Provider
# ============================================
LLM_PROVIDER=openai
OPENAI_API_KEY=sk-xxxxx
OPENAI_MODEL=gpt-4-turbo-preview

# ============================================
# Security
# ============================================
SECRET_KEY=your-secure-random-string

# ============================================
# CORS (Frontend URLs)
# ============================================
CORS_ORIGINS=["http://localhost:3000", "http://localhost:3001"]
```

---

## Testing the Chat API

Once configured, test the chat endpoint:

```bash
curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "كيف أستعد للامتحانات؟", "language": "ar"}'
```

---

## API Endpoints

- `POST /api/chat` - Public chat (no auth required)
- `GET /api/chat/health` - Check LLM configuration status
- `POST /api/v1/chatbot/chat` - Authenticated chat (requires login)

