from sqlalchemy.orm import Session

from app import models


def resolve_tags(db: Session, user_id: int, tag_names: list[str]) -> list[models.Tag]:
    """Retrouve les tags existants de l'utilisateur ou les crée à la volée."""
    tags: list[models.Tag] = []
    for raw_name in tag_names:
        name = raw_name.strip()
        if not name:
            continue
        tag = (
            db.query(models.Tag)
            .filter(models.Tag.user_id == user_id, models.Tag.name == name)
            .first()
        )
        if not tag:
            tag = models.Tag(user_id=user_id, name=name)
            db.add(tag)
            db.flush()
        tags.append(tag)
    return tags
