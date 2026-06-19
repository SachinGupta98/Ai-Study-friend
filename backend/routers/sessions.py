"""
routers/sessions.py — Tutor Chat Session CRUD endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from auth import get_current_user
from database import get_db
from models import User, TutorSession
from schemas import TutorSessionCreate, TutorSessionOut

router = APIRouter(prefix="/api/sessions", tags=["sessions"])


@router.get("", response_model=list[TutorSessionOut])
def get_sessions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Return all tutor chat sessions for the current user."""
    sessions = (
        db.query(TutorSession)
        .filter(TutorSession.user_id == current_user.id)
        .order_by(TutorSession.updated_at.desc())
        .all()
    )
    return sessions


@router.post("", response_model=TutorSessionOut, status_code=status.HTTP_200_OK)
def upsert_session(
    payload: TutorSessionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Create or update a tutor chat session by ID."""
    session = db.query(TutorSession).filter(
        TutorSession.id == payload.id,
        TutorSession.user_id == current_user.id,
    ).first()

    if session:
        session.data = payload.data
    else:
        session = TutorSession(id=payload.id, user_id=current_user.id, data=payload.data)
        db.add(session)

    db.commit()
    db.refresh(session)
    return session


@router.delete("/{session_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_session(
    session_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Delete a tutor chat session by ID."""
    session = db.query(TutorSession).filter(
        TutorSession.id == session_id,
        TutorSession.user_id == current_user.id,
    ).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found.")
    db.delete(session)
    db.commit()
