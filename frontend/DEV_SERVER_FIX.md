# Dev Server 404 Errors - Complete Fix Guide

## Problem
Getting 404 errors for static files (CSS, JS) in development mode:
- `GET /_next/static/css/app/layout.css 404`
- `GET /_next/static/chunks/main-app.js 404`
- MIME type errors (HTML instead of CSS/JS)

## Root Cause
The dev server cache is corrupted or the server needs to be restarted with a clean state.

## Solution (Step by Step)

### Step 1: Stop Current Dev Server
Press `Ctrl+C` in the terminal where dev server is running.

### Step 2: Clean All Caches
```powershell
cd frontend
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force node_modules/.cache -ErrorAction SilentlyContinue
```

Or use the clean script:
```powershell
npm run clean
```

### Step 3: Clear Browser Cache
1. Open DevTools (F12)
2. Right-click on refresh button
3. Select "Empty Cache and Hard Reload"
4. Or use Ctrl+Shift+Delete to clear cache

### Step 4: Restart Dev Server
```powershell
npm run dev
```

Or use the clean dev command:
```powershell
npm run dev:clean
```

### Step 5: Verify Fix
After restarting, check:
- ✅ No 404 errors in console
- ✅ CSS files load correctly
- ✅ JavaScript files load correctly
- ✅ Page displays correctly

## Quick Fix Script

I've created a PowerShell script for easy restart:

```powershell
cd frontend
.\scripts\restart-dev.ps1
```

Or manually:
```powershell
cd frontend
npm run dev:clean
```

## If Issues Persist

### Option 1: Full Clean
```powershell
cd frontend
Remove-Item -Recurse -Force .next
Remove-Item -Recurse -Force node_modules/.cache
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
npm run dev
```

### Option 2: Reinstall Dependencies
```powershell
cd frontend
Remove-Item -Recurse -Force node_modules
Remove-Item -Recurse -Force .next
npm install
npm run dev
```

### Option 3: Use Production Build
```powershell
cd frontend
npm run build
npm start
```

## Prevention

1. **Always use `npm run dev:clean`** when starting development
2. **Clear browser cache** if you see old content
3. **Restart dev server** after major code changes
4. **Check port conflicts** - make sure port 3000 is not in use

## Common Issues

### Issue: Port Already in Use
```powershell
# Find process using port 3000
netstat -ano | findstr :3000

# Kill the process (replace PID with actual process ID)
taskkill /PID <PID> /F
```

### Issue: Cache Not Clearing
```powershell
# Force delete
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force node_modules/.cache -ErrorAction SilentlyContinue

# Verify deletion
Test-Path .next  # Should return False
```

## Notes

- ✅ Build is successful (verified)
- ✅ Code is correct
- ⚠️ This is a dev server cache issue
- 🔄 Restart dev server to fix

## Build Status

```
✓ Production Build: SUCCESS
✓ All Routes: WORKING
✓ Code: CORRECT
⚠️ Dev Server: NEEDS RESTART
```
