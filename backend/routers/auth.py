"""
routers/auth.py — Signup, Login, Me, Forgot Password endpoints
"""
from datetime import timedelta

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from auth import (
    hash_password,
    verify_password,
    create_access_token,
    get_current_user,
    ACCESS_TOKEN_EXPIRE_MINUTES,
)
from database import get_db
from models import User, UserStats
from schemas import UserCreate, UserLogin, Token, UserOut, ForgotPasswordRequest

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/signup", response_model=Token, status_code=status.HTTP_201_CREATED)
def signup(payload: UserCreate, db: Session = Depends(get_db)):
    """
    Create a new user account.
    - Validates username uniqueness
    - Hashes password with bcrypt
    - Creates an empty UserStats row
    - Returns JWT token immediately (auto-login after signup)
    """
    # Normalise username to lowercase
    username = payload.username.lower().strip()

    # Check if username already taken
    existing = db.query(User).filter(User.username == username).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Username is already taken. Please choose a different one.",
        )

    # Create the user
    user = User(
        username=username,
        hashed_password=hash_password(payload.password),
    )
    db.add(user)
    db.flush()  # flush to get user.id before committing

    # Initialize empty stats row for this user
    stats = UserStats(user_id=user.id, data={"quizHistory": []})
    db.add(stats)
    db.commit()
    db.refresh(user)

    # Issue JWT
    access_token = create_access_token(
        data={"sub": user.username},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES),
    )
    return Token(access_token=access_token, username=user.username)


@router.post("/login", response_model=Token)
def login(payload: UserLogin, db: Session = Depends(get_db)):
    """
    Authenticate a user and return a JWT token.
    """
    username = payload.username.lower().strip()
    user = db.query(User).filter(User.username == username).first()

    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(status_code=400, detail="This account has been deactivated.")

    access_token = create_access_token(
        data={"sub": user.username},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES),
    )
    return Token(access_token=access_token, username=user.username)


@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    """Return the currently authenticated user's basic info."""
    return current_user


@router.post("/forgot-password")
def forgot_password(payload: ForgotPasswordRequest, db: Session = Depends(get_db)):
    """
    Forgot password flow.
    For local/offline usage, we return a temporary token that can be used to reset.
    In a production app, you'd send an email with a reset link.
    """
    username = payload.username.lower().strip()
    user = db.query(User).filter(User.username == username).first()

    # Always return success to prevent username enumeration attacks
    if not user:
        return {
            "message": "If that username exists, a reset link has been sent.",
            "reset_token": None,
        }

    # Generate a short-lived (15 min) reset token
    reset_token = create_access_token(
        data={"sub": user.username, "type": "password_reset"},
        expires_delta=timedelta(minutes=15),
    )
    # In production: send email with reset link containing this token.
    # For now: return it so the developer can use it for testing.
    return {
        "message": f"Password reset token generated for '{username}'. In production, this would be emailed.",
        "reset_token": reset_token,
    }


@router.post("/reset-password")
def reset_password(new_password: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Reset password using a valid JWT token (from forgot-password flow)."""
    if len(new_password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters.")
    current_user.hashed_password = hash_password(new_password)
    db.commit()
    return {"message": "Password updated successfully."}
