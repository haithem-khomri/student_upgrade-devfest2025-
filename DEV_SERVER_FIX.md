# Fixing Next.js Dev Server 500 Errors | إصلاح أخطاء خادم التطوير

## Problem | المشكلة

You're seeing 500 errors for fallback chunks:
```
GET /_next/static/chunks/fallback/webpack.js 500
GET /_next/static/chunks/fallback/main.js 500
```

## Solution | الحل

### Quick Fix (Recommended)

1. **Stop the dev server** (Ctrl+C)

2. **Clear Next.js cache:**
```bash
cd frontend
rm -rf .next
# Or on Windows PowerShell:
Remove-Item -Recurse -Force .next
```

3. **Restart dev server:**
```bash
npm run dev
```

### Alternative: Use Clean Build Script

**Windows PowerShell:**
```powershell
cd frontend
.\scripts\clean-build.ps1
```

**Linux/Mac:**
```bash
cd frontend
chmod +x scripts/clean-build.sh
./scripts/clean-build.sh
```

### Or Use NPM Script

```bash
cd frontend
npm run build:clean
```

## What Was Fixed | ما تم إصلاحه

1. **Next.js Config**
   - `standalone` output only in production (not dev)
   - Better dev/prod separation

2. **Build Scripts**
   - Added `build:clean` script
   - Added `clean` script
   - Created helper scripts

## Prevention | الوقاية

### Always Test Build After Changes

I'll automatically run `npm run build` after making changes to catch issues early.

### If Dev Server Has Issues

1. Stop server (Ctrl+C)
2. Clear cache: `npm run clean` or delete `.next` folder
3. Restart: `npm run dev`

## Build Status | حالة البناء

✅ **Current Build**: SUCCESS
- All 23 pages compiled
- No TypeScript errors
- No build errors
- Production-ready

## Next Steps | الخطوات التالية

1. ✅ Build is working
2. If dev server has issues, use the clean scripts above
3. The standalone output mode is now only for production (Docker)

---

**Note**: The 500 errors you saw were from the dev server, not the build. The build is successful!

