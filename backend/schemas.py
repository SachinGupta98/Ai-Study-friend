"""
schemas.py — Pydantic v2 request/response schemas
"""
from __future__ import annotations
from typing import Any, Optional
from pydantic import BaseModel, field_validator


# ── Auth Schemas ──────────────────────────────────────────────────────────────

class UserCreate(BaseModel):
    username: str
    password: str

    @field_validator("username")
    @classmethod
    def username_valid(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Username cannot be empty")
        if len(v) < 3:
            raise ValueError("Username must be at least 3 characters")
        if len(v) > 64:
            raise ValueError("Username must be at most 64 characters")
        return v.lower()

    @field_validator("password")
    @classmethod
    def password_valid(cls, v: str) -> str:
        if len(v) < 6:
            raise ValueError("Password must be at least 6 characters")
        return v


class UserLogin(BaseModel):
    username: str
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    username: str


class TokenData(BaseModel):
    username: Optional[str] = None


class UserOut(BaseModel):
    username: str

    class Config:
        from_attributes = True


# ── Study Plan Schemas ────────────────────────────────────────────────────────

class StudyPlanCreate(BaseModel):
    """Accepts the full plan JSON blob from the frontend."""
    id: str
    data: dict[str, Any]


class StudyPlanOut(BaseModel):
    id: str
    data: dict[str, Any]

    class Config:
        from_attributes = True


# ── Tutor Session Schemas ─────────────────────────────────────────────────────

class TutorSessionCreate(BaseModel):
    id: str
    data: dict[str, Any]


class TutorSessionOut(BaseModel):
    id: str
    data: dict[str, Any]

    class Config:
        from_attributes = True


# ── General Chat Schemas ──────────────────────────────────────────────────────

class GeneralChatSave(BaseModel):
    messages: list[dict[str, Any]]


class GeneralChatOut(BaseModel):
    messages: list[dict[str, Any]]


# ── Stats Schemas ─────────────────────────────────────────────────────────────

class QuizRecord(BaseModel):
    quizTitle: str
    score: int
    totalQuestions: int
    completedAt: str


class SaveQuizResult(BaseModel):
    result: QuizRecord


class UserStatsOut(BaseModel):
    currentStreak: int
    totalTasksCompleted: int
    quizzesTaken: int
    averageQuizScore: int
    completionDates: list[str]
    plansCreated: int


# ── Forgot Password ───────────────────────────────────────────────────────────

class ForgotPasswordRequest(BaseModel):
    username: str
