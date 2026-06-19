"""
models.py — SQLAlchemy ORM models (maps to PostgreSQL tables)
"""
import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, ForeignKey, DateTime, Boolean
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from database import Base


def utcnow():
    return datetime.now(timezone.utc)


class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    username = Column(String(64), unique=True, nullable=False, index=True)
    email = Column(String(255), unique=True, nullable=True)
    hashed_password = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), default=utcnow)

    # Relationships
    study_plans = relationship("StudyPlan", back_populates="owner", cascade="all, delete-orphan")
    tutor_sessions = relationship("TutorSession", back_populates="owner", cascade="all, delete-orphan")
    general_chat = relationship("GeneralChat", back_populates="owner", uselist=False, cascade="all, delete-orphan")
    user_stats = relationship("UserStats", back_populates="owner", uselist=False, cascade="all, delete-orphan")


class StudyPlan(Base):
    __tablename__ = "study_plans"

    id = Column(String(64), primary_key=True, index=True)  # e.g. "1718523600000"
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    data = Column(JSONB, nullable=False)           # Full StudyPlan JSON blob
    created_at = Column(DateTime(timezone=True), default=utcnow)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)

    owner = relationship("User", back_populates="study_plans")


class TutorSession(Base):
    __tablename__ = "tutor_sessions"

    id = Column(String(64), primary_key=True, index=True)  # e.g. "session-1718523600000"
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    data = Column(JSONB, nullable=False)           # Full TutorChatSession JSON blob
    created_at = Column(DateTime(timezone=True), default=utcnow)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)

    owner = relationship("User", back_populates="tutor_sessions")


class GeneralChat(Base):
    __tablename__ = "general_chats"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    data = Column(JSONB, nullable=False, default=lambda: {"messages": []})  # {"messages": [...]}
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)

    owner = relationship("User", back_populates="general_chat")


class UserStats(Base):
    __tablename__ = "user_stats"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    data = Column(JSONB, nullable=False, default=lambda: {"quizHistory": []})  # {"quizHistory": [...]}
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)

    owner = relationship("User", back_populates="user_stats")
