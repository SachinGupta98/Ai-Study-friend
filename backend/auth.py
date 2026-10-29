"""
auth.py — Supabase JWT verification for FastAPI

Supabase signs JWTs with the project's JWT_SECRET (found in:
  Supabase → Project Settings → API → JWT Settings → JWT Secret)

We verify the incoming Bearer token against this secret.
The token's 'sub' field contains the Supabase user UUID.
We use that UUID as the user identifier in our database.

NOTE: We keep bcrypt/password helpers for any legacy endpoints,
but the primary auth flow is: Supabase issues JWT → FastAPI verifies it.
"""
import os
import bcrypt
from datetime import datetime, timedelta, timezone
from typing import Optional

import jwt as pyjwt  # PyJWT
from dotenv import load_dotenv
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from database import get_db
from models import User, UserStats

load_dotenv()

# ── Supabase JWT Config ───────────────────────────────────────────────────────
# Get from: Supabase → Project Settings → API → JWT Settings → JWT Secret
SUPABASE_JWT_SECRET = os.getenv("SUPABASE_JWT_SECRET", "")

# Keep legacy custom JWT config for any backward compatibility
SECRET_KEY = os.getenv("SECRET_KEY", "CHANGE-ME-IN-PRODUCTION")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "10080"))

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


# ── Password Hashing (kept for any legacy usage) ──────────────────────────────

def hash_password(password: str) -> str:
    """Hash a plain-text password using bcrypt."""
    pwd_bytes = password.encode("utf-8")
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(pwd_bytes, salt)
    return hashed.decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain-text password against a bcrypt hash."""
    try:
        return bcrypt.checkpw(
            plain_password.encode("utf-8"),
            hashed_password.encode("utf-8"),
        )
    except Exception:
        return False


# ── Custom JWT (legacy — kept for backward compatibility) ─────────────────────

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create a signed JWT token with an expiry."""
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (
        expires_delta if expires_delta else timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    to_encode.update({"exp": expire})
    import jose.jwt as jose_jwt
    return jose_jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


# ── Supabase JWT Verification ─────────────────────────────────────────────────

def verify_supabase_token(token: str) -> dict:
    """
    Decode and verify a Supabase-issued JWT.
    Returns the payload dict (includes 'sub' = Supabase user UUID, 'email', etc.)
    Raises HTTPException 401 on any failure.
    """
    if not SUPABASE_JWT_SECRET:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="SUPABASE_JWT_SECRET is not configured on the server.",
        )
    try:
        payload = pyjwt.decode(
            token,
            SUPABASE_JWT_SECRET,
            algorithms=["HS256"],
            options={"verify_aud": False},  # Supabase audience varies
        )
        return payload
    except pyjwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session expired. Please log in again.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except pyjwt.InvalidTokenError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid token: {e}",
            headers={"WWW-Authenticate": "Bearer"},
        )


def get_or_create_user_from_supabase(payload: dict, db: Session) -> User:
    """
    Given a verified Supabase JWT payload, find or create the corresponding
    User row in our database. Uses Supabase UUID as the stable identifier.

    This enables seamless first-login: the user record is auto-created
    the first time they authenticate via Supabase.
    """
    supabase_uid = payload.get("sub")  # Supabase user UUID
    email = payload.get("email") or ""
    # For Google OAuth, display name comes from user_metadata
    user_meta = payload.get("user_metadata", {}) or {}
    display_name = user_meta.get("full_name") or user_meta.get("name") or email.split("@")[0] or "user"

    if not supabase_uid:
        raise HTTPException(status_code=401, detail="Invalid token: missing user ID.")

    # Try to find existing user by Supabase UUID (stored as username)
    user = db.query(User).filter(User.username == supabase_uid).first()

    if not user:
        # First time this Supabase user hits our API — create their record
        user = User(
            username=supabase_uid,       # Store Supabase UUID as username
            email=email,
            hashed_password="supabase",  # Placeholder — auth is via Supabase
            is_active=True,
        )
        db.add(user)
        db.flush()

        # Initialize empty stats for the new user
        stats = UserStats(user_id=user.id, data={"quizHistory": []})
        db.add(stats)
        db.commit()
        db.refresh(user)

    return user


# ── FastAPI Dependency ────────────────────────────────────────────────────────

def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> User:
    """
    FastAPI dependency — verifies the Supabase Bearer token and returns the User.
    Auto-creates the user row on first login.
    Raises 401 if the token is invalid or expired.
    """
    payload = verify_supabase_token(token)
    return get_or_create_user_from_supabase(payload, db)
