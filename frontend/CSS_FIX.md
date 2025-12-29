# CSS MIME Type Error Fix

## Problem
In development mode, you might see this error:
```
Refused to apply style from 'http://localhost:3000/_next/static/css/app/layout.css' 
because its MIME type ('text/html') is not a supported stylesheet MIME type
```

## Solution

This is a known Next.js development issue where CSS files aren't generated immediately. Here's how to fix it:

### Option 1: Clean and Restart Dev Server (Recommended)
```bash
cd frontend
npm run dev:clean
```

This will:
1. Clear the `.next` cache
2. Clear `node_modules/.cache`
3. Restart the dev server with a clean state

### Option 2: Manual Clean
```bash
cd frontend
# Delete .next folder
rm -rf .next
# Or on Windows PowerShell:
Remove-Item -Recurse -Force .next

# Restart dev server
npm run dev
```

### Option 3: Use Production Build
```bash
cd frontend
npm run build
npm start
```

## Why This Happens

- Next.js in development mode generates CSS files on-demand
- Sometimes the browser requests CSS before Next.js has generated it
- The server returns a 404 HTML page instead of CSS
- This causes the MIME type error

## Prevention

- Always use `npm run dev:clean` when starting development
- If you see CSS errors, restart the dev server
- The build process works fine - this is only a dev mode issue

## Notes

- ✅ Build is successful (verified)
- ✅ CSS is properly imported in `app/layout.tsx`
- ✅ Production builds work correctly
- ⚠️ This only affects development mode

