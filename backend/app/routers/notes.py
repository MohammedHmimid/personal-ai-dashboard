from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app import models, schemas
from app.database import get_db
from app.dependencies import get_current_user
from app.tag_utils import resolve_tags

router = APIRouter(prefix="/api/notes", tags=["notes"])


def _get_owned_note(db: Session, note_id: int, user_id: int) -> models.Note:
    note = (
        db.query(models.Note)
        .filter(models.Note.id == note_id, models.Note.user_id == user_id)
        .first()
    )
    if not note:
        raise HTTPException(status_code=404, detail="Note introuvable.")
    return note


@router.get("", response_model=list[schemas.NoteOut])
def list_notes(
    search: str | None = None,
    category_id: int | None = None,
    favorite: bool | None = None,
    archived: bool = False,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    query = db.query(models.Note).filter(
        models.Note.user_id == current_user.id, models.Note.is_archived == archived
    )
    if search:
        like = f"%{search}%"
        query = query.filter(or_(models.Note.title.ilike(like), models.Note.content.ilike(like)))
    if category_id:
        query = query.filter(models.Note.category_id == category_id)
    if favorite is not None:
        query = query.filter(models.Note.is_favorite == favorite)
    return query.order_by(models.Note.updated_at.desc()).all()


@router.post("", response_model=schemas.NoteOut, status_code=201)
def create_note(
    payload: schemas.NoteCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    note = models.Note(
        user_id=current_user.id,
        title=payload.title,
        content=payload.content,
        category_id=payload.category_id,
    )
    note.tags = resolve_tags(db, current_user.id, payload.tags)
    db.add(note)
    db.commit()
    db.refresh(note)
    return note


@router.get("/{note_id}", response_model=schemas.NoteOut)
def get_note(note_id: int, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    return _get_owned_note(db, note_id, current_user.id)


@router.put("/{note_id}", response_model=schemas.NoteOut)
def update_note(
    note_id: int,
    payload: schemas.NoteUpdate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    note = _get_owned_note(db, note_id, current_user.id)
    data = payload.model_dump(exclude_unset=True, exclude={"tags"})
    for field, value in data.items():
        setattr(note, field, value)
    if payload.tags is not None:
        note.tags = resolve_tags(db, current_user.id, payload.tags)
    db.commit()
    db.refresh(note)
    return note


@router.delete("/{note_id}", status_code=204)
def delete_note(note_id: int, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    note = _get_owned_note(db, note_id, current_user.id)
    db.delete(note)
    db.commit()
