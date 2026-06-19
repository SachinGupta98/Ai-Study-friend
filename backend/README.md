# 🚀 Vidya AI — Backend Setup & Run Guide

## Prerequisites

1. **Python 3.10+** — already installed ✅
2. **PostgreSQL 15+** — needs to be installed

---

## Step 1: Install PostgreSQL on Windows

### Option A — Official Installer (Recommended)
1. Download from: https://www.postgresql.org/download/windows/
2. Run the installer
3. Set a password for the `postgres` user — **remember this password!**
4. Keep the default port **5432**
5. Finish installation

### Option B — Chocolatey (if you have it)
```powershell
choco install postgresql
```

---

## Step 2: Configure the Backend

1. Open `backend/.env`
2. Update the `DATABASE_URL` with your PostgreSQL password:
   ```
   DATABASE_URL=postgresql://postgres:YOUR_POSTGRES_PASSWORD@localhost:5432/vidya_ai
   ```
3. (Optional) Generate a secure `SECRET_KEY`:
   ```powershell
   python -c "import secrets; print(secrets.token_hex(32))"
   ```
   Paste the output into `SECRET_KEY=` in `backend/.env`

---

## Step 3: Install Python Dependencies & Setup DB

```powershell
# From the project root
cd "d:\Anti projects\Ai Study Assistant\backend"

# Create virtual environment
python -m venv .venv

# Activate it
.venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create DB and tables (run ONCE)
python setup_db.py
```

---

## Step 4: Start the Backend Server

```powershell
# In the backend folder with .venv activated:
uvicorn main:app --reload
```

✅ Backend runs at: **http://localhost:8000**  
📖 Swagger API docs: **http://localhost:8000/docs**

---

## Step 5: Start the Frontend

In a **second** terminal:

```powershell
cd "d:\Anti projects\Ai Study Assistant"
npm run dev
```

✅ Frontend runs at: **http://localhost:5173**

---

## Running Both (Quick Start)

You need **2 terminals open simultaneously**:

| Terminal 1 (Backend) | Terminal 2 (Frontend) |
|---|---|
| `cd backend` | `cd "Ai Study Assistant"` |
| `.venv\Scripts\activate` | `npm run dev` |
| `uvicorn main:app --reload` | |

Or just double-click `backend\start_server.bat` for Terminal 1.

---

## Database Tables Created

| Table | Description |
|---|---|
| `users` | User accounts (username, bcrypt hashed password) |
| `study_plans` | Full study plan JSON per user |
| `tutor_sessions` | Tutor chat session JSON per user |
| `general_chats` | Companion chat history per user |
| `user_stats` | Quiz history per user |

---

## API Endpoints Reference

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/signup` | Create account → returns JWT |
| POST | `/api/auth/login` | Login → returns JWT |
| GET | `/api/auth/me` | Get current user |
| POST | `/api/auth/forgot-password` | Request password reset |
| GET | `/api/plans` | Get all study plans |
| POST | `/api/plans` | Create/update a plan |
| DELETE | `/api/plans/{id}` | Delete a plan |
| GET | `/api/sessions` | Get tutor chat sessions |
| POST | `/api/sessions` | Create/update a session |
| GET | `/api/chats/companion` | Get companion chat |
| POST | `/api/chats/companion` | Save companion chat |
| GET | `/api/stats` | Get user statistics |
| POST | `/api/stats/quiz` | Save a quiz result |

---

## Troubleshooting

### "FATAL: password authentication failed for user 'postgres'"
→ Open `backend/.env` and fix the password in `DATABASE_URL`

### "Connection refused (port 5432)"
→ PostgreSQL service is not running. Start it:
```powershell
net start postgresql-x64-15   # adjust version number
```
Or open **Services** in Windows and start the PostgreSQL service.

### "Module not found" errors
→ Make sure you activated the venv: `.venv\Scripts\activate`

### Frontend shows "Failed to fetch" on login
→ Make sure the backend server is running (`uvicorn main:app --reload`)
