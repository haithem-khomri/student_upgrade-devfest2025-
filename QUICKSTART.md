# Quick Start Guide

Get up and running in 5 minutes!

## Prerequisites Check

- ✅ Node.js 18+ installed
- ✅ Python 3.10+ installed
- ✅ PostgreSQL installed and running

## Step 1: Frontend (2 minutes)

```bash
cd frontend
npm install
```

Create `frontend/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Start frontend:
```bash
npm run dev
```

✅ Frontend running at http://localhost:3000

## Step 2: Backend (3 minutes)

```bash
cd backend
python -m venv venv

# Windows:
venv\Scripts\activate

# Linux/Mac:
source venv/bin/activate

pip install -r requirements.txt
```

Create `backend/.env`:
```env
SECRET_KEY=dev-secret-key-change-in-production
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/student_platform
CORS_ORIGINS=["http://localhost:3000"]
```

**Create database:**
```sql
CREATE DATABASE student_platform;
```

Start backend:
```bash
uvicorn main:app --reload
```

✅ Backend running at http://localhost:8000
✅ API docs at http://localhost:8000/docs

## Step 3: Test It!

1. Open http://localhost:3000
2. Click "Sign In"
3. Use any email/password (e.g., `test@university.edu` / `password`)
4. Explore the dashboard!

## What Works Without API Keys

- ✅ All UI and navigation
- ✅ Authentication (demo mode)
- ✅ Study decision engine (rule-based logic)
- ✅ Mock AI responses (for development)

## Enable Real AI (Optional)

Add to `backend/.env`:
```env
OPENAI_API_KEY=sk-your-key-here
LLM_PROVIDER=openai
```

Restart backend to use real AI responses.

## Troubleshooting

**Port 3000 in use?**
```bash
# Find and kill process
# Windows: netstat -ano | findstr :3000
# Linux/Mac: lsof -ti:3000 | xargs kill
```

**Database connection error?**
- Check PostgreSQL is running
- Verify database exists
- Check `DATABASE_URL` in `.env`

**Module not found?**
```bash
# Frontend:
rm -rf node_modules package-lock.json
npm install

# Backend:
pip install -r requirements.txt --upgrade
```

## Next Steps

- Read [SETUP.md](./SETUP.md) for detailed configuration
- Read [ARCHITECTURE.md](./ARCHITECTURE.md) for system design
- Add your OpenAI API key for real AI features
- Customize design tokens in `frontend/styles/design-tokens.css`

Happy coding! 🚀

