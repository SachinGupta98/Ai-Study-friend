#!/bin/bash
# build.sh — Render build script
# Builds the Vite frontend first (bakes VITE_* env vars), then installs Python deps

set -e  # Exit immediately on error

echo "=== Step 1: Installing Node.js dependencies ==="
npm install

echo "=== Step 2: Building Vite frontend (bakes VITE_GROQ_API_KEY into bundle) ==="
npm run build

echo "=== Step 3: Installing Python backend dependencies ==="
pip install -r backend/requirements.txt

echo "=== Build complete! ==="
