"""
auth.py — Supabase JWT verification for FastAPI

Supabase Auth uses:
  - Asymmetric keys (ES256 / RS256) validated against the project's public JWKS endpoint
    (https://<project-ref>.supabase.co/auth/v1/.well-known/jwks.json)
  - Symmetric key (HS256) validated against SUPABASE_JWT_SECRET (for older/custom tokens)

This module dynamically inspects the token's 'alg' header and verifies it accordingly.
On successful verification, the Supabase user UUID ('sub') is used to find or auto-create
the corresponding User record in PostgreSQL.
"""
import os
import bcrypt
from datetime import datetime, timedelta, timezone
from typing import Optional

import jwt as pyjwt
from jwt import PyJWKClient
from dotenv import load_dotenv
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from pathlib import Path

# Load from backend/.env if it exists, otherwise fallback to root .env
backend_env = Path(__file__).resolve().parent / ".env"
if backend_env.exists():
    load_dotenv(dotenv_path=backend_env)
load_dotenv()

# ── Supabase Auth Config ──────────────────────────────────────────────────────
SUPABASE_URL = (
    os.getenv("SUPABASE_URL")
    or os.getenv("VITE_SUPABASE_URL")
    or "https://ozkcrhkfetaiwcxnlkvz.supabase.co"
).rstrip("/")

SUPABASE_JWT_SECRET = os.getenv("SUPABASE_JWT_SECRET", "")

# Initialize JWKS client with key caching
jwks_url = f"{SUPABASE_URL}/auth/v1/.well-known/jwks.json"
jwks_client = PyJWKClient(jwks_url, cache_keys=True, max_cached_keys=16)

# Legacy JWT Settings (kept for backward compatibility)
SECRET_KEY = os.getenv("SECRET_KEY", "CHANGE-ME-IN-PRODUCTION")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "10080"))

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

from database import get_db
from models import User, UserStats


# ── Password Hashing (legacy helpers) ─────────────────────────────────────────

def hash_password(password: str) -> str:
    pwd_bytes = password.encode("utf-8")
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(pwd_bytes, salt).decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))
    except Exception:
        return False


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (
        expires_delta if expires_delta else timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    to_encode.update({"exp": expire})
    return pyjwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


# ── Supabase JWT Verification (supports ES256, RS256, HS256) ──────────────────

def verify_supabase_token(token: str) -> dict:
    """
    Decode and verify a Supabase-issued JWT.
    Supports ES256, RS256 (via public JWKS) and HS256 (via SUPABASE_JWT_SECRET).
    """
    try:
        header = pyjwt.get_unverified_header(token)
        alg = header.get("alg", "ES256")
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid token format: {e}",
            headers={"WWW-Authenticate": "Bearer"},
        )

    try:
        if alg in ["ES256", "RS256"]:
            # Verified with public key from Supabase JWKS
            signing_key = jwks_client.get_signing_key_from_jwt(token)
            payload = pyjwt.decode(
                token,
                signing_key.key,
                algorithms=["ES256", "RS256"],
                options={"verify_aud": False},
            )
            return payload
        elif alg == "HS256":
            # Verified with symmetric secret
            if not SUPABASE_JWT_SECRET:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="SUPABASE_JWT_SECRET is not configured on the server.",
                )
            payload = pyjwt.decode(
                token,
                SUPABASE_JWT_SECRET,
                algorithms=["HS256"],
                options={"verify_aud": False},
            )
            return payload
        else:
            # Fallback for any other algorithm
            signing_key = jwks_client.get_signing_key_from_jwt(token)
            payload = pyjwt.decode(
                token,
                signing_key.key,
                algorithms=[alg],
                options={"verify_aud": False},
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
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Token verification failed: {e}",
            headers={"WWW-Authenticate": "Bearer"},
        )


def get_or_create_user_from_supabase(payload: dict, db: Session) -> User:
    """
    Given a verified Supabase JWT payload, find or create the corresponding
    User row in our database using the Supabase UUID ('sub').
    """
    supabase_uid = payload.get("sub")
    email = payload.get("email") or ""

    if not supabase_uid:
        raise HTTPException(status_code=401, detail="Invalid token: missing user ID.")

    user = db.query(User).filter(User.username == supabase_uid).first()

    if not user:
        user = User(
            username=supabase_uid,
            email=email,
            hashed_password="supabase",
            is_active=True,
        )
        db.add(user)
        db.flush()

        stats = UserStats(user_id=user.id, data={"quizHistory": []})
        db.add(stats)
        db.commit()
        db.refresh(user)

    return user


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> User:
    """
    FastAPI dependency — verifies the Bearer token and returns the current User.
    """
    payload = verify_supabase_token(token)
    return get_or_create_user_from_supabase(payload, db)
