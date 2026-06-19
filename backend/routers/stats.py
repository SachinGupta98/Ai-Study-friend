"""
routers/stats.py — User statistics computation and quiz result saving
"""
from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from auth import get_current_user
from database import get_db
from models import User, StudyPlan, UserStats
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
    most_recent = datetime.strptime(sorted_dates[0], "%Y-%m-%d").date()
    if most_recent not in (today, yesterday):
        return 0

    streak = 1
    for i in range(len(sorted_dates) - 1):
        current = datetime.strptime(sorted_dates[i], "%Y-%m-%d").date()
        nxt = datetime.strptime(sorted_dates[i + 1], "%Y-%m-%d").date()
        if (current - nxt).days == 1:
            streak += 1
        else:
            break

    return streak


@router.get("", response_model=UserStatsOut)
def get_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Compute and return all user statistics:
    - Current streak (consecutive days with completed tasks or quizzes)
    - Total tasks completed
    - Quizzes taken & average score
    - List of completion dates for the heatmap
    - Number of plans created
    """
    plans = db.query(StudyPlan).filter(StudyPlan.user_id == current_user.id).all()
    stats_row = db.query(UserStats).filter(UserStats.user_id == current_user.id).first()

    # --- Task Stats ---
    completion_dates: set[str] = set()
    total_tasks_completed = 0

    for plan_row in plans:
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

    # --- Quiz Stats ---
    quiz_history: list[dict] = []
    if stats_row and stats_row.data:
        quiz_history = stats_row.data.get("quizHistory", [])

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

    # --- Streak ---
    sorted_dates = sorted(completion_dates, reverse=True)
    current_streak = _compute_streak(sorted_dates)

    return UserStatsOut(
        currentStreak=current_streak,
        totalTasksCompleted=total_tasks_completed,
        quizzesTaken=quizzes_taken,
        averageQuizScore=average_quiz_score,
        completionDates=sorted_dates,
        plansCreated=len(plans),
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
