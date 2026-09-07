from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import models, schemas
from app.database import get_db
from app.dependencies import get_current_user

router = APIRouter(prefix="/api/goals", tags=["goals"])


def _get_owned_goal(db: Session, goal_id: int, user_id: int) -> models.Goal:
    goal = (
        db.query(models.Goal)
        .filter(models.Goal.id == goal_id, models.Goal.user_id == user_id)
        .first()
    )
    if not goal:
        raise HTTPException(status_code=404, detail="Objectif introuvable.")
    return goal


@router.get("", response_model=list[schemas.GoalOut])
def list_goals(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    return (
        db.query(models.Goal)
        .filter(models.Goal.user_id == current_user.id)
        .order_by(models.Goal.created_at.desc())
        .all()
    )


@router.post("", response_model=schemas.GoalOut, status_code=201)
def create_goal(
    payload: schemas.GoalCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    goal = models.Goal(user_id=current_user.id, **payload.model_dump())
    db.add(goal)
    db.commit()
    db.refresh(goal)
    return goal


@router.put("/{goal_id}", response_model=schemas.GoalOut)
def update_goal(
    goal_id: int,
    payload: schemas.GoalUpdate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    goal = _get_owned_goal(db, goal_id, current_user.id)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(goal, field, value)
    db.commit()
    db.refresh(goal)
    return goal


@router.delete("/{goal_id}", status_code=204)
def delete_goal(goal_id: int, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    goal = _get_owned_goal(db, goal_id, current_user.id)
    db.delete(goal)
    db.commit()
