"""Configuration centralisée de l'application, lue depuis les variables
d'environnement (voir .env.example)."""
from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # Base de données
    database_url: str = "sqlite:///./app.db"

    # Sécurité / JWT
    jwt_secret: str = "change-me-in-production-please"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24

    # Assistant IA
    ai_provider: str = "mock"  # mock | openai | anthropic
    openai_api_key: str = ""
    anthropic_api_key: str = ""

    # CORS
    frontend_origin: str = "http://localhost:5173"


@lru_cache
def get_settings() -> Settings:
    return Settings()
