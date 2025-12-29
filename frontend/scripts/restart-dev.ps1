# PowerShell script to restart dev server with clean cache
Write-Host "Cleaning cache..." -ForegroundColor Yellow
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force node_modules/.cache -ErrorAction SilentlyContinue
Write-Host "Cache cleaned!" -ForegroundColor Green

Write-Host "Starting dev server..." -ForegroundColor Yellow
npm run dev




