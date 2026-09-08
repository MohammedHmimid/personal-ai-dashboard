from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.database import Base, engine
from app.routers import ai, auth, dashboard, goals, notes, tasks

settings = get_settings()

Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.frontend_origin,
        "https://personal-ai-dashboard-2q1t.vercel.app",
        "http://localhost:5173",
        "http://localhost:3000",
    ],
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