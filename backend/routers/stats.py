"""
routers/stats.py — User statistics computation and quiz result saving
"""
from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from auth import get_current_user
from database import get_db
from models import User, StudyPlan, TutorSession, GeneralChat, UserStats
from schemas import SaveQuizResult, UserStatsOut, QuizRecord

router = APIRouter(prefix="/api/stats", tags=["stats"])


def _compute_streak(sorted_dates: list[str]) -> int:
    """
    Given a list of date strings (YYYY-MM-DD) sorted descending,
    compute the current consecutive study streak.
    """
    if not sorted_dates:
        return 0

    today = datetime.now(timezone.utc).date()
    yesterday = today - timedelta(days=1)

    # Streak only counts if the most recent date is today or yesterday
    try:
        most_recent = datetime.strptime(sorted_dates[0], "%Y-%m-%d").date()
    except Exception:
        return 0

    if most_recent not in (today, yesterday):
        return 0

    streak = 1
    for i in range(len(sorted_dates) - 1):
        try:
            current = datetime.strptime(sorted_dates[i], "%Y-%m-%d").date()
            nxt = datetime.strptime(sorted_dates[i + 1], "%Y-%m-%d").date()
            if (current - nxt).days == 1:
                streak += 1
            elif (current - nxt).days == 0:
                continue
            else:
                break
        except Exception:
            break

    return streak


@router.get("", response_model=UserStatsOut)
def get_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Compute and return all user statistics holistically:
    - Current streak across all learning activities (tasks, tutor chats, companion sessions, quizzes, roadmaps)
    - Total tasks completed
    - Quizzes taken & average score
    - Comprehensive list of active dates for the heatmap
    - Number of plans created
    - Total study sessions count and estimated study minutes
    """
    plans = db.query(StudyPlan).filter(StudyPlan.user_id == current_user.id).all()
    tutor_sessions = db.query(TutorSession).filter(TutorSession.user_id == current_user.id).all()
    general_chat = db.query(GeneralChat).filter(GeneralChat.user_id == current_user.id).first()
    stats_row = db.query(UserStats).filter(UserStats.user_id == current_user.id).first()

    completion_dates: set[str] = set()
    total_tasks_completed = 0

    # 1. Study Plan tasks & roadmap creation
    for plan_row in plans:
        if plan_row.created_at:
            completion_dates.add(plan_row.created_at.strftime("%Y-%m-%d"))
        if plan_row.updated_at:
            completion_dates.add(plan_row.updated_at.strftime("%Y-%m-%d"))

        plan_data = plan_row.data or {}
        for week in plan_data.get("weekly_plans", []):
            for day in week.get("daily_tasks", []):
                for task in day.get("tasks", []):
                    if task.get("completed"):
                        total_tasks_completed += 1
                        completed_at = task.get("completedAt", "")
                        if completed_at:
                            date_str = completed_at.split("T")[0]
                            completion_dates.add(date_str)
                        elif plan_row.updated_at:
                            completion_dates.add(plan_row.updated_at.strftime("%Y-%m-%d"))

    # 2. Tutor Chat Sessions (interactive learning time)
    for session_row in tutor_sessions:
        if session_row.created_at:
            completion_dates.add(session_row.created_at.strftime("%Y-%m-%d"))
        if session_row.updated_at:
            completion_dates.add(session_row.updated_at.strftime("%Y-%m-%d"))
        # Check messages for timestamps
        s_data = session_row.data or {}
        last_updated = s_data.get("lastUpdatedAt")
        if last_updated:
            completion_dates.add(last_updated.split("T")[0])

    # 3. AI Companion Chat Sessions
    if general_chat and general_chat.updated_at:
        completion_dates.add(general_chat.updated_at.strftime("%Y-%m-%d"))

    # 4. Quizzes & Focus Sessions from UserStats
    quiz_history: list[dict] = []
    focus_history: list[dict] = []
    if stats_row and stats_row.data:
        quiz_history = stats_row.data.get("quizHistory", [])
        focus_history = stats_row.data.get("focusHistory", [])

    quizzes_taken = len(quiz_history)
    average_quiz_score = 0
    if quizzes_taken > 0:
        total_score = sum(
            q.get("score", 0) / max(q.get("totalQuestions", 1), 1)
            for q in quiz_history
        )
        average_quiz_score = round((total_score / quizzes_taken) * 100)
        for q in quiz_history:
            completed_at = q.get("completedAt", "")
            if completed_at:
                completion_dates.add(completed_at.split("T")[0])

    for f in focus_history:
        completed_at = f.get("completedAt", "")
        if completed_at:
            completion_dates.add(completed_at.split("T")[0])

    # 5. Study Sessions & Minutes Calculation
    study_sessions_count = (
        len(tutor_sessions)
        + (1 if general_chat and len((general_chat.data or {}).get("messages", [])) > 1 else 0)
        + len(focus_history)
    )

    focus_minutes = sum(f.get("durationMinutes", 25) for f in focus_history)
    total_study_minutes = (study_sessions_count * 15) + focus_minutes + (total_tasks_completed * 10)

    # 6. Streak & Heatmap Dates (sorted descending)
    sorted_dates = sorted(list(completion_dates), reverse=True)
    current_streak = _compute_streak(sorted_dates)

    return UserStatsOut(
        currentStreak=current_streak,
        totalTasksCompleted=total_tasks_completed,
        quizzesTaken=quizzes_taken,
        averageQuizScore=average_quiz_score,
        completionDates=sorted_dates,
        plansCreated=len(plans),
        studySessionsCount=study_sessions_count,
        totalStudyMinutes=total_study_minutes,
    )


@router.post("/quiz", status_code=status.HTTP_200_OK)
def save_quiz_result(
    payload: SaveQuizResult,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Append a quiz result to the user's quiz history."""
    stats_row = db.query(UserStats).filter(UserStats.user_id == current_user.id).first()

    if stats_row:
        existing_data = dict(stats_row.data) if stats_row.data else {}
        quiz_history = list(existing_data.get("quizHistory", []))
        quiz_history.append(payload.result.model_dump())
        stats_row.data = {**existing_data, "quizHistory": quiz_history}
    else:
        stats_row = UserStats(
            user_id=current_user.id,
            data={"quizHistory": [payload.result.model_dump()]},
        )
        db.add(stats_row)

    db.commit()
    return {"message": "Quiz result saved."}


@router.post("/focus", status_code=status.HTTP_200_OK)
def save_focus_session(
    payload: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Record a completed Pomodoro / Deep Focus session."""
    stats_row = db.query(UserStats).filter(UserStats.user_id == current_user.id).first()
    record = {
        "completedAt": payload.get("completedAt", datetime.now(timezone.utc).isoformat()),
        "durationMinutes": int(payload.get("durationMinutes", 25)),
    }

    if stats_row:
        existing_data = dict(stats_row.data) if stats_row.data else {}
        focus_history = list(existing_data.get("focusHistory", []))
        focus_history.append(record)
        stats_row.data = {**existing_data, "focusHistory": focus_history}
    else:
        stats_row = UserStats(
            user_id=current_user.id,
            data={"focusHistory": [record]},
        )
        db.add(stats_row)

    db.commit()
    return {"message": "Focus session recorded."}
