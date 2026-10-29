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

echo "=== Step 4: Initializing database tables on Supabase ==="
cd backend
python -c "
from database import Base, engine
import models  # registers all ORM models
Base.metadata.create_all(bind=engine)
print('  [OK] All database tables created/verified successfully.')
"
cd ..

echo "=== Build complete! ==="
