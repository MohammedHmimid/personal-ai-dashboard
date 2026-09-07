from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app import models, schemas
from app.ai import get_ai_provider
from app.database import get_db
from app.dependencies import get_current_user

router = APIRouter(prefix="/api/ai", tags=["ai"])


def _build_context(db: Session, user_id: int) -> dict:
    notes = (
        db.query(models.Note)
        .filter(models.Note.user_id == user_id, models.Note.is_archived == False)  # noqa: E712
        .order_by(models.Note.updated_at.desc())
        .limit(5)
        .all()
    )
    tasks = (
        db.query(models.Task)
        .filter(models.Task.user_id == user_id, models.Task.status != "done")
        .limit(10)
        .all()
    )
    goals = db.query(models.Goal).filter(models.Goal.user_id == user_id, models.Goal.status == "active").all()

    return {
        "recent_notes": [n.title for n in notes],
        "today_tasks": [t.title for t in tasks],
        "goals": [f"{g.title} ({g.progress}%)" for g in goals],
    }


@router.get("/conversations", response_model=list[schemas.ConversationOut])
def list_conversations(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    return (
        db.query(models.Conversation)
        .filter(models.Conversation.user_id == current_user.id)
        .order_by(models.Conversation.updated_at.desc())
        .all()
    )


@router.get("/conversations/{conversation_id}", response_model=schemas.ConversationDetailOut)
def get_conversation(
    conversation_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    convo = (
        db.query(models.Conversation)
        .filter(models.Conversation.id == conversation_id, models.Conversation.user_id == current_user.id)
        .first()
    )
    if not convo:
        raise HTTPException(status_code=404, detail="Conversation introuvable.")
    return convo


@router.delete("/conversations/{conversation_id}", status_code=204)
def delete_conversation(
    conversation_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    convo = (
        db.query(models.Conversation)
        .filter(models.Conversation.id == conversation_id, models.Conversation.user_id == current_user.id)
        .first()
    )
    if not convo:
        raise HTTPException(status_code=404, detail="Conversation introuvable.")
    db.delete(convo)
    db.commit()


@router.post("/chat", response_model=schemas.ChatMessageOut)
def chat(
    payload: schemas.ChatMessageIn,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if payload.conversation_id:
        convo = (
            db.query(models.Conversation)
            .filter(
                models.Conversation.id == payload.conversation_id,
                models.Conversation.user_id == current_user.id,
            )
            .first()
        )
        if not convo:
            raise HTTPException(status_code=404, detail="Conversation introuvable.")
    else:
        title = payload.message[:60]
        convo = models.Conversation(user_id=current_user.id, title=title)
        db.add(convo)
        db.flush()

    db.add(models.Message(conversation_id=convo.id, role="user", content=payload.message))

    provider = get_ai_provider()
    context = _build_context(db, current_user.id)
    reply = provider.chat(payload.message, context)

    db.add(models.Message(conversation_id=convo.id, role="assistant", content=reply))
    db.commit()

    return schemas.ChatMessageOut(conversation_id=convo.id, reply=reply, provider=provider.name)


class TextIn(BaseModel):
    text: str


@router.post("/summarize")
def summarize(payload: TextIn):
    provider = get_ai_provider()
    return {"summary": provider.summarize(payload.text), "provider": provider.name}


@router.post("/extract-tasks")
def extract_tasks(payload: TextIn):
    provider = get_ai_provider()
    return {"tasks": provider.extract_tasks(payload.text), "provider": provider.name}
