# Student AI Backend Server Startup Script
# Run this script to start the backend with MongoDB connection

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  STUDENT AI - BACKEND SERVER" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Set environment variables
$env:MONGODB_URL = "mongodb+srv://haithemkho_db_user:mgkWMfbZJq1m1BAu@cluster0.pyk8hj8.mongodb.net/student_ai?retryWrites=true&w=majority&appName=Cluster0"
$env:MONGODB_DB_NAME = "student_ai"
$env:LLM_PROVIDER = "google"
$env:GOOGLE_API_KEY = "AIzaSyAvcJO9FWFN2F1kLk7fRNyRw7pwNgmdbFQ"
$env:SECRET_KEY = "student-ai-secret-key-2025"

Write-Host "[OK] Environment variables set" -ForegroundColor Green
Write-Host "  - MongoDB: student_ai @ cluster0.pyk8hj8.mongodb.net" -ForegroundColor Gray
Write-Host "  - LLM Provider: $env:LLM_PROVIDER" -ForegroundColor Gray
Write-Host ""
Write-Host "[INFO] Starting server on http://localhost:8001" -ForegroundColor Yellow
Write-Host "  Press Ctrl+C to stop" -ForegroundColor Gray
Write-Host ""

# Start the server
python -m uvicorn main:app --reload --host 127.0.0.1 --port 8001

