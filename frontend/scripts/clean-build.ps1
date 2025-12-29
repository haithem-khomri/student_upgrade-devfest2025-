# Clean build script for Windows PowerShell
# Clears Next.js cache and rebuilds

Write-Host "Cleaning Next.js build cache..." -ForegroundColor Yellow

# Remove .next directory
if (Test-Path ".next") {
    Remove-Item -Recurse -Force ".next"
    Write-Host "✓ Removed .next directory" -ForegroundColor Green
}

# Remove node_modules/.cache if exists
if (Test-Path "node_modules/.cache") {
    Remove-Item -Recurse -Force "node_modules/.cache"
    Write-Host "✓ Removed node_modules/.cache" -ForegroundColor Green
}

Write-Host ""
Write-Host "Running build..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✓ Build completed successfully!" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "✗ Build failed!" -ForegroundColor Red
    exit 1
}

