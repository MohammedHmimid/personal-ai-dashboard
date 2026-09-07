# Architecture

## Vue d'ensemble

```
┌─────────────┐      REST + JWT       ┌─────────────┐      SQLAlchemy      ┌────────────┐
│  React SPA  │ ────────────────────▶ │   FastAPI   │ ────────────────────▶ │ PostgreSQL │
│  (Vite)     │ ◀──────────────────── │             │ ◀──────────────────── │ / SQLite   │
└─────────────┘                        └─────────────┘                       └────────────┘
                                              │
                                              ▼
                                        ┌───────────┐
                                        │ AIProvider │  mock | openai | anthropic
                                        └───────────┘
```

## Principes

- **Séparation stricte des couches** : `routers` (HTTP) → logique métier inline (simple
  pour ce périmètre) → `models` (persistance). Un projet plus gros séparerait des
  `services/`/`repositories/` dédiés ; ce n'était pas nécessaire pour la Phase 1.
- **Isolation par utilisateur** : chaque requête passe par `get_current_user` (JWT) et
  chaque requête SQL filtre explicitement sur `user_id`. Voir `tests/test_notes.py::
  test_notes_are_isolated_between_users`.
- **AIProvider** : interface abstraite (`app/ai/base.py`). `MockAIProvider` est utilisé
  par défaut ; `OpenAIProvider`/`AnthropicProvider` prennent le relais automatiquement
  dès qu'une clé API est configurée (`app/ai/__init__.py::get_ai_provider`).
- **Frontend** : contexts React (`AuthContext`, `ThemeContext`) + un client axios unique
  (`services/api.js`) qui attache le JWT et gère la déconnexion sur 401.

## Ce qui manque pour une V2 "grande échelle"

- Migrations Alembic (actuellement `Base.metadata.create_all`, suffisant en dev)
- File d'attente / websockets pour les notifications temps réel
- Vector store (pgvector/Chroma) pour le RAG documentaire
- Cache (Redis) pour les endpoints d'analytics
