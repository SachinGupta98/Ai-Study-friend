"""
routers/plans.py — Study Plan CRUD endpoints
"""
from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from auth import get_current_user
from database import get_db
from models import User, StudyPlan
from schemas import StudyPlanCreate, StudyPlanOut

router = APIRouter(prefix="/api/plans", tags=["plans"])


@router.get("", response_model=list[StudyPlanOut])
def get_plans(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Return all study plans for the current user, sorted by creation date (newest first)."""
    plans = (
        db.query(StudyPlan)
        .filter(StudyPlan.user_id == current_user.id)
        .order_by(StudyPlan.created_at.desc())
        .all()
    )
    return plans


@router.post("", response_model=StudyPlanOut, status_code=status.HTTP_200_OK)
def upsert_plan(
    payload: StudyPlanCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Create or update a study plan (upsert by plan ID).
    The full plan JSON is stored in the JSONB `data` column.
    """
    plan = db.query(StudyPlan).filter(
        StudyPlan.id == payload.id,
        StudyPlan.user_id == current_user.id,
    ).first()

    if plan:
        plan.data = payload.data
    else:
        plan = StudyPlan(id=payload.id, user_id=current_user.id, data=payload.data)
        db.add(plan)

    db.commit()
    db.refresh(plan)
    return plan


@router.delete("/{plan_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_plan(
    plan_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Delete a study plan by ID."""
    plan = db.query(StudyPlan).filter(
        StudyPlan.id == plan_id,
        StudyPlan.user_id == current_user.id,
    ).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Study plan not found.")
    db.delete(plan)
    db.commit()
