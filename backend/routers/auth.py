"""
routers/auth.py — Auth endpoints (Supabase Auth migration)

Sign Up / Sign In / Forgot Password are now handled entirely by Supabase on the frontend.
This router only provides:
  - GET /api/auth/me  — returns the current user's info (validates the Supabase JWT)

The legacy POST /signup and POST /login endpoints are kept as stubs
so old clients don't get 404s, but they redirect users to use Supabase.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from auth import get_current_user
from database import get_db
from models import User
from schemas import UserOut

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    """Return the currently authenticated user's info. Validates the Supabase JWT."""
    return current_user


@router.post("/signup")
def signup_stub():
    """
    Sign-up is handled by Supabase Auth on the frontend.
    Users are auto-provisioned in our DB on their first API call.
    """
    raise HTTPException(
        status_code=status.HTTP_410_GONE,
        detail="Sign-up is now handled by Supabase Auth. Use the frontend sign-up form.",
    )


@router.post("/login")
def login_stub():
    """
    Login is handled by Supabase Auth on the frontend.
    """
    raise HTTPException(
        status_code=status.HTTP_410_GONE,
        detail="Login is now handled by Supabase Auth. Use the frontend sign-in form.",
    )


@router.post("/forgot-password")
def forgot_password_stub():
    """
    Password reset is now handled by Supabase Auth (real emails sent automatically).
    """
    raise HTTPException(
        status_code=status.HTTP_410_GONE,
        detail="Password reset is now handled by Supabase Auth. Use the 'Forgot Password' button on the login page.",
    )
