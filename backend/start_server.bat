@echo off
echo ============================================================
echo  Vidya AI — Backend Setup Script
echo ============================================================
echo.

REM Add PostgreSQL to PATH (installed at D:\postgresql)
SET "PATH=D:\postgresql\bin;%PATH%"

REM Step 1: Navigate to backend folder
cd /d "%~dp0"

REM Step 2: Create a virtual environment if it doesn't exist
if not exist ".venv" (
    echo [1/4] Creating Python virtual environment...
    python -m venv .venv
) else (
    echo [1/4] Virtual environment already exists.
)

REM Step 3: Activate venv and install requirements
echo [2/4] Installing/updating Python dependencies...
call .venv\Scripts\activate.bat
pip install -r requirements.txt --quiet

REM Step 4: Check if .env is configured
if "%DATABASE_URL%"=="" (
    echo.
    echo [3/4] Checking .env configuration...
    findstr /C:"YOUR_PASSWORD_HERE" .env >nul 2>&1
    if not errorlevel 1 (
        echo.
        echo  *** ACTION REQUIRED ***
        echo  Open backend\.env and replace YOUR_PASSWORD_HERE with your PostgreSQL password.
        echo  Then re-run this script.
        echo.
        pause
        exit /b 1
    )
) else (
    echo [3/4] Database URL configured.
)

REM Step 5: Start the server
echo [4/4] Starting FastAPI server on http://localhost:8000 ...
echo       API docs: http://localhost:8000/docs
echo       Press Ctrl+C to stop.
echo.
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
