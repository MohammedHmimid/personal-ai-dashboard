from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import models, schemas
from app.database import get_db
from app.dependencies import get_current_user
from app.tag_utils import resolve_tags

router = APIRouter(prefix="/api/tasks", tags=["tasks"])


def _get_owned_task(db: Session, task_id: int, user_id: int) -> models.Task:
    task = (
        db.query(models.Task)
        .filter(models.Task.id == task_id, models.Task.user_id == user_id)
        .first()
    )
    if not task:
        raise HTTPException(status_code=404, detail="Tâche introuvable.")
    return task


@router.get("", response_model=list[schemas.TaskOut])
def list_tasks(
    status: str | None = None,
    priority: str | None = None,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    query = db.query(models.Task).filter(models.Task.user_id == current_user.id)
    if status:
        query = query.filter(models.Task.status == status)
    if priority:
        query = query.filter(models.Task.priority == priority)
    return query.order_by(models.Task.created_at.desc()).all()


@router.post("", response_model=schemas.TaskOut, status_code=201)
def create_task(
    payload: schemas.TaskCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    task = models.Task(
        user_id=current_user.id,
        title=payload.title,
        description=payload.description,
        status=payload.status,
        priority=payload.priority,
        due_date=payload.due_date,
        category_id=payload.category_id,
    )
    task.tags = resolve_tags(db, current_user.id, payload.tags)
    db.add(task)
    db.commit()
    db.refresh(task)
    return task


@router.put("/{task_id}", response_model=schemas.TaskOut)
def update_task(
    task_id: int,
    payload: schemas.TaskUpdate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    task = _get_owned_task(db, task_id, current_user.id)
    data = payload.model_dump(exclude_unset=True, exclude={"tags"})
    for field, value in data.items():
        setattr(task, field, value)
    if payload.tags is not None:
        task.tags = resolve_tags(db, current_user.id, payload.tags)
    db.commit()
    db.refresh(task)
    return task


@router.delete("/{task_id}", status_code=204)
def delete_task(task_id: int, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    task = _get_owned_task(db, task_id, current_user.id)
    db.delete(task)
    db.commit()
