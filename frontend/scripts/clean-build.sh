#!/bin/bash
# Clean build script for Linux/Mac
# Clears Next.js cache and rebuilds

echo "Cleaning Next.js build cache..."

# Remove .next directory
if [ -d ".next" ]; then
    rm -rf .next
    echo "✓ Removed .next directory"
fi

# Remove node_modules/.cache if exists
if [ -d "node_modules/.cache" ]; then
    rm -rf node_modules/.cache
    echo "✓ Removed node_modules/.cache"
fi

echo ""
echo "Running build..."
npm run build

if [ $? -eq 0 ]; then
    echo ""
    echo "✓ Build completed successfully!"
else
    echo ""
    echo "✗ Build failed!"
    exit 1
fi

