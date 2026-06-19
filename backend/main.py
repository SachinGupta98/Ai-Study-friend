"""
main.py — FastAPI application entry point
"""
import os
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from dotenv import load_dotenv

from database import Base, engine
from routers import auth, plans, sessions, chats, stats

load_dotenv()

# Create all database tables (runs on startup if they don't exist)
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Vidya AI — Study Assistant Backend",
    description="REST API powering the AI Study Assistant frontend (React/Vite).",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# ── CORS ─────────────────────────────────────────────────────────────────────
# Allow all origins — safe because the frontend is served from this same server.
# In a multi-domain setup, restrict this to your frontend domain.
allowed_origins_env = os.getenv("FRONTEND_ORIGIN", "*")
allowed_origins = (
    ["*"]
    if allowed_origins_env == "*"
    else [o.strip() for o in allowed_origins_env.split(",")]
    + [
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
    ]
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(auth.router)
app.include_router(plans.router)
app.include_router(sessions.router)
app.include_router(chats.router)
app.include_router(stats.router)


@app.get("/health", tags=["health"])
def health_check():
    """Basic health-check endpoint."""
    return {
        "status": "ok",
        "service": "Vidya AI Backend",
        "docs": "/docs",
    }


# ── Serve React Frontend (Production) ────────────────────────────────────────
# The React app is built into ../dist by `npm run build`.
# We serve it from FastAPI so everything runs on ONE Render service.
DIST_DIR = Path(__file__).parent.parent / "dist"

if DIST_DIR.exists():
    # Serve static assets (JS, CSS, images)
    app.mount("/assets", StaticFiles(directory=DIST_DIR / "assets"), name="assets")

    # Serve the root index.html and any other static files at root level
    @app.get("/", tags=["frontend"])
    def serve_root():
        return FileResponse(DIST_DIR / "index.html")

    # Catch-all: serve index.html for any unmatched route (React Router SPA support)
    @app.get("/{full_path:path}", tags=["frontend"])
    def serve_spa(full_path: str):
        # Don't intercept API or docs routes
        if full_path.startswith("api/") or full_path.startswith("docs") or full_path.startswith("redoc"):
            from fastapi import HTTPException
            raise HTTPException(status_code=404, detail="Not found")
        file_path = DIST_DIR / full_path
        if file_path.exists() and file_path.is_file():
            return FileResponse(file_path)
        return FileResponse(DIST_DIR / "index.html")
else:
    @app.get("/", tags=["health"])
    def health_check_root():
        return {
            "status": "ok",
            "service": "Vidya AI Backend",
            "docs": "/docs",
        }
