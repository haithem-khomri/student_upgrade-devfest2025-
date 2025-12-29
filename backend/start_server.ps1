# Student AI Backend Server Startup Script
# Run this script to start the backend with MongoDB connection

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  STUDENT AI - BACKEND SERVER" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Set environment variables from .env file or environment
# IMPORTANT: Create a .env file in the backend directory with your credentials
# See .env.example for the required variables

# Load from .env file if it exists
if (Test-Path ".env") {
    Get-Content .env | ForEach-Object {
        if ($_ -match '^\s*([^#][^=]+)=(.*)$') {
            $key = $matches[1].Trim()
            $value = $matches[2].Trim()
            [Environment]::SetEnvironmentVariable($key, $value, "Process")
        }
    }
}

# Set defaults if not in .env
if (-not $env:MONGODB_URL) {
    Write-Host "[WARNING] MONGODB_URL not set. Please create .env file or set environment variables." -ForegroundColor Yellow
}
if (-not $env:MONGODB_DB_NAME) {
    $env:MONGODB_DB_NAME = "student_ai"
}
if (-not $env:LLM_PROVIDER) {
    $env:LLM_PROVIDER = "google"
}
if (-not $env:SECRET_KEY) {
    Write-Host "[WARNING] SECRET_KEY not set. Using default (NOT SECURE FOR PRODUCTION)." -ForegroundColor Yellow
    $env:SECRET_KEY = "dev-secret-key-change-in-production"
}

Write-Host "[OK] Environment variables loaded" -ForegroundColor Green
Write-Host "  - MongoDB DB: $env:MONGODB_DB_NAME" -ForegroundColor Gray
Write-Host "  - LLM Provider: $env:LLM_PROVIDER" -ForegroundColor Gray
Write-Host ""
Write-Host "[INFO] Starting server on http://localhost:8001" -ForegroundColor Yellow
Write-Host "  Press Ctrl+C to stop" -ForegroundColor Gray
Write-Host ""

# Start the server
python -m uvicorn main:app --reload --host 127.0.0.1 --port 8001

