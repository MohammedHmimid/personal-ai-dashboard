"""Crée un compte de démonstration rempli de données réalistes.

Usage :
    python seed.py
"""
from datetime import datetime, timedelta

from app.database import Base, SessionLocal, engine
from app.models import Category, Goal, Note, Tag, Task, User
from app.security import hash_password

DEMO_EMAIL = "demo@example.com"
DEMO_PASSWORD = "Demo123!"


def run():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    existing = db.query(User).filter(User.email == DEMO_EMAIL).first()
    if existing:
        print(f"Le compte démo existe déjà : {DEMO_EMAIL}")
        db.close()
        return

    user = User(name="Sarah Amrani", email=DEMO_EMAIL, hashed_password=hash_password(DEMO_PASSWORD))
    db.add(user)
    db.flush()

    work = Category(user_id=user.id, name="Travail", color="#7C8FFF")
    perso = Category(user_id=user.id, name="Personnel", color="#F5B759")
    db.add_all([work, perso])
    db.flush()

    tag_ml = Tag(user_id=user.id, name="machine-learning")
    tag_docker = Tag(user_id=user.id, name="docker")
    db.add_all([tag_ml, tag_docker])
    db.flush()

    notes = [
        Note(
            user_id=user.id,
            title="Notes de cours — Réseaux de neurones",
            content="# Réseaux de neurones\n\nUn réseau de neurones est composé de couches...\n\n## Backpropagation\n\nL'algorithme ajuste les poids en propageant l'erreur en arrière.",
            category_id=work.id,
            is_favorite=True,
            tags=[tag_ml],
        ),
        Note(
            user_id=user.id,
            title="Idées de projet — Dashboard IA",
            content="- Ajouter un mode sombre\n- Intégrer un vrai fournisseur IA\n- Prévoir une architecture RAG",
            category_id=work.id,
            tags=[],
        ),
        Note(
            user_id=user.id,
            title="Setup Docker Compose",
            content="Penser à documenter les variables d'environnement dans .env.example.",
            category_id=work.id,
            tags=[tag_docker],
        ),
        Note(
            user_id=user.id,
            title="Liste de courses",
            content="- Légumes\n- Café\n- Cahiers",
            category_id=perso.id,
        ),
    ]
    db.add_all(notes)

    now = datetime.utcnow()
    tasks = [
        Task(user_id=user.id, title="Finaliser le rapport de stage", status="in_progress", priority="high",
             due_date=now + timedelta(hours=6), category_id=work.id),
        Task(user_id=user.id, title="Revoir le chapitre sur les CNN", status="todo", priority="medium",
             due_date=now + timedelta(hours=3), category_id=work.id),
        Task(user_id=user.id, title="Préparer la soutenance", status="todo", priority="urgent",
             due_date=now + timedelta(days=2), category_id=work.id),
        Task(user_id=user.id, title="Répondre aux emails", status="done", priority="low",
             due_date=now - timedelta(hours=2), category_id=work.id),
        Task(user_id=user.id, title="Séance de sport", status="todo", priority="low",
             due_date=now + timedelta(hours=10), category_id=perso.id),
        Task(user_id=user.id, title="Corriger le bug d'auth JWT", status="in_progress", priority="high",
             due_date=now + timedelta(hours=8), category_id=work.id),
    ]
    db.add_all(tasks)

    goals = [
        Goal(user_id=user.id, title="Apprendre le Machine Learning", progress=80,
             deadline=now + timedelta(days=25), status="active",
             description="Suivre le cours du master et pratiquer sur des projets réels."),
        Goal(user_id=user.id, title="Terminer le Personal AI Dashboard", progress=45,
             deadline=now + timedelta(days=14), status="active",
             description="MVP fonctionnel avec auth, notes, tâches et assistant IA."),
        Goal(user_id=user.id, title="Lire 12 articles de recherche", progress=100,
             deadline=now - timedelta(days=5), status="completed"),
    ]
    db.add_all(goals)

    db.commit()
    db.close()

    print("Compte de démonstration créé :")
    print(f"  email    : {DEMO_EMAIL}")
    print(f"  password : {DEMO_PASSWORD}")


if __name__ == "__main__":
    run()
