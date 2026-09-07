# Base de données

SQLAlchemy avec support SQLite (dev, par défaut) et PostgreSQL (`DATABASE_URL`).

## Tables (Phase 1)

- **users** — id, name, email, hashed_password, avatar_url, theme, created_at, updated_at
- **categories** — id, user_id, name, color
- **tags** — id, user_id, name
- **notes** — id, user_id, title, content (Markdown), category_id, is_favorite, is_archived, created_at, updated_at
- **note_tags** — table d'association (many-to-many notes ↔ tags)
- **tasks** — id, user_id, title, description, status, priority, due_date, category_id, created_at, updated_at
- **task_tags** — table d'association (many-to-many tasks ↔ tags)
- **goals** — id, user_id, title, description, progress, deadline, status, created_at, updated_at
- **conversations** — id, user_id, title, created_at, updated_at
- **messages** — id, conversation_id, role, content, created_at

Toutes les tables métier portent un `user_id` avec suppression en cascade
(`ondelete="CASCADE"`) : supprimer un utilisateur supprime toutes ses données.

## Non encore modélisé (Phase 2)

`events` (calendrier), `documents` (upload + RAG), `notifications`.
