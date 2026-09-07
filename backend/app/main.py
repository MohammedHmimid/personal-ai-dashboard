from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.database import Base, engine
from app.routers import ai, auth, dashboard, goals, notes, tasks

settings = get_settings()

# Crée les tables si elles n'existent pas encore (suffisant pour ce projet ;
# passer à Alembic pour de vraies migrations en production).
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Personal AI Dashboard API",
    description="API du Second Brain personnel : notes, tâches, objectifs et assistant IA.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_origin, "http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(notes.router)
app.include_router(tasks.router)
app.include_router(goals.router)
app.include_router(dashboard.router)
app.include_router(ai.router)


@app.get("/api/health")
def health():
    return {"status": "ok"}
