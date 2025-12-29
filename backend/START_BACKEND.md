# How to Start the Backend

## Quick Start (First Time)

### 1. Navigate to Backend Directory
```bash
cd backend
```

### 2. Create Virtual Environment
```bash
# Windows
python -m venv venv

# Linux/Mac
python3 -m venv venv
```

### 3. Activate Virtual Environment

**Windows:**
```bash
venv\Scripts\activate
```

**Linux/Mac:**
```bash
source venv/bin/activate
```

### 4. Install Dependencies
```bash
pip install -r requirements.txt
```

### 5. Create .env File
Create a `.env` file in the `backend` directory with:

```env
SECRET_KEY=dev-secret-key-change-in-production
DATABASE_URL=postgresql://user:password@localhost:5432/student_platform
CORS_ORIGINS=["http://localhost:3000"]
OPENAI_API_KEY=
LLM_PROVIDER=openai
```

**Note:** For development without a database, you can use SQLite:
```env
DATABASE_URL=sqlite:///./student_platform.db
```

### 6. Start the Server
```bash
uvicorn main:app --reload
```

The backend will start at: **http://localhost:8000**

## Quick Start (After Setup)

If you've already set up the environment:

```bash
cd backend
venv\Scripts\activate  # Windows
# or
source venv/bin/activate  # Linux/Mac

uvicorn main:app --reload
```

## Verify It's Running

1. Open browser: http://localhost:8000
2. Should see: `{"message":"AI Student Productivity Platform API","version":"1.0.0"}`

3. API Documentation: http://localhost:8000/docs
4. Health Check: http://localhost:8000/health

## Common Issues

### Port Already in Use
```bash
# Find process using port 8000
# Windows:
netstat -ano | findstr :8000

# Linux/Mac:
lsof -ti:8000
```

### Module Not Found
```bash
pip install -r requirements.txt --upgrade
```

### Database Connection Error
- Make sure PostgreSQL is running
- Check DATABASE_URL in .env
- Or use SQLite for development (see .env example above)

## Production Mode

```bash
uvicorn main:app --host 0.0.0.0 --port 8000
```

## With Custom Port

```bash
uvicorn main:app --reload --port 8001
```

