from collections import defaultdict
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app import models, schemas
from app.database import get_db
from app.dependencies import get_current_user

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])

WEEKDAY_LABELS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"]


@router.get("/summary", response_model=schemas.DashboardSummary)
def get_summary(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    now = datetime.utcnow()
    week_ago = now - timedelta(days=7)
    two_weeks_ago = now - timedelta(days=14)

    all_tasks = db.query(models.Task).filter(models.Task.user_id == current_user.id).all()
    total_tasks = len(all_tasks)
    completed_tasks = sum(1 for t in all_tasks if t.status == "done")

    tasks_this_week = sum(1 for t in all_tasks if t.created_at >= week_ago)
    tasks_prior_week = sum(1 for t in all_tasks if two_weeks_ago <= t.created_at < week_ago)
    if tasks_prior_week:
        tasks_change_pct = round((tasks_this_week - tasks_prior_week) / tasks_prior_week * 100, 1)
    else:
        tasks_change_pct = 100.0 if tasks_this_week else 0.0

    total_notes = db.query(models.Note).filter(
        models.Note.user_id == current_user.id, models.Note.is_archived == False  # noqa: E712
    ).count()

    goals = db.query(models.Goal).filter(models.Goal.user_id == current_user.id).all()
    active_goals = [g for g in goals if g.status == "active"]
    avg_progress = round(sum(g.progress for g in active_goals) / len(active_goals), 1) if active_goals else 0.0

    # Graphique "Productivity" : tâches créées vs terminées par jour, 7 derniers jours.
    created_by_day: dict[str, int] = defaultdict(int)
    done_by_day: dict[str, int] = defaultdict(int)
    days = [(now - timedelta(days=offset)).date() for offset in range(6, -1, -1)]

    for task in all_tasks:
        created_date = task.created_at.date()
        if created_date in days:
            created_by_day[created_date.isoformat()] += 1
        if task.status == "done":
            done_date = (task.updated_at or task.created_at).date()
            if done_date in days:
                done_by_day[done_date.isoformat()] += 1

    productivity = [
        {
            "day": WEEKDAY_LABELS[d.weekday()],
            "date": d.isoformat(),
            "created": created_by_day.get(d.isoformat(), 0),
            "completed": done_by_day.get(d.isoformat(), 0),
        }
        for d in days
    ]

    recent_notes = (
        db.query(models.Note)
        .filter(models.Note.user_id == current_user.id, models.Note.is_archived == False)  # noqa: E712
        .order_by(models.Note.updated_at.desc())
        .limit(5)
        .all()
    )

    today_start = datetime(now.year, now.month, now.day)
    today_end = today_start + timedelta(days=1)
    today_tasks = (
        db.query(models.Task)
        .filter(
            models.Task.user_id == current_user.id,
            models.Task.status != "done",
            (models.Task.due_date == None) | (models.Task.due_date < today_end),  # noqa: E711
        )
        .order_by(models.Task.priority.desc())
        .limit(8)
        .all()
    )

    return schemas.DashboardSummary(
        total_tasks=total_tasks,
        completed_tasks=completed_tasks,
        tasks_change_pct=tasks_change_pct,
        total_notes=total_notes,
        active_goals=len(active_goals),
        avg_goal_progress=avg_progress,
        productivity=productivity,
        recent_notes=recent_notes,
        today_tasks=today_tasks,
    )
