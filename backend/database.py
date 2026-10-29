"""
database.py — SQLAlchemy engine and session factory
"""
import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise RuntimeError(
        "DATABASE_URL is not set. Please create backend/.env with your PostgreSQL connection string.\n"
        "Example: DATABASE_URL=postgresql://postgres:password@localhost:5432/vidya_ai\n"
        "For Supabase: postgresql://postgres:[PASSWORD]@db.[REF].supabase.co:5432/postgres?sslmode=require"
    )

# ── Supabase SSL fix ──────────────────────────────────────────────────────────
# Supabase requires SSL. If the URL points to Supabase and sslmode is not
# already specified, append it automatically so deploys never fail with SSL errors.
if "supabase.co" in DATABASE_URL and "sslmode" not in DATABASE_URL:
    DATABASE_URL = DATABASE_URL + ("&" if "?" in DATABASE_URL else "?") + "sslmode=require"

# connect_args for psycopg2 — ensures SSL is enforced at the driver level too
connect_args = {"sslmode": "require"} if "supabase.co" in DATABASE_URL else {}

engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    echo=False,
    connect_args=connect_args,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    """FastAPI dependency that yields a DB session and closes it on exit."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
