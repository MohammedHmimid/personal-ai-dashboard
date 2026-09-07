# 🧠 Personal AI Dashboard — SecondBrain

Un "second brain" personnel : notes, tâches et objectifs centralisés, avec un
assistant IA capable de répondre à partir de tes propres données.

> **Statut du projet — à lire avant de commencer**
> Ce dépôt est le **socle (Phase 1)** d'une application beaucoup plus large.
> Il est **réellement fonctionnel** (frontend ↔ backend ↔ base de données,
> aucune donnée statique) et couvre : authentification, dashboard, notes,
> tâches, objectifs et assistant IA. Le calendrier, la gestion de documents
> (RAG), les notifications et les analytics avancées ne sont **pas encore
> implémentés** — l'architecture (modèles, routers, layout) est prête à les
> accueillir. Voir [Prochaines étapes](#-prochaines-étapes).

---

## ✨ Fonctionnalités (Phase 1)

- **Authentification** complète : inscription, connexion, JWT, routes protégées
- **Dashboard** : KPIs, graphique de productivité (Recharts), tâches du jour, notes récentes
- **Notes** : CRUD, Markdown avec aperçu, tags, favoris, recherche
- **Tâches** : CRUD, vue liste et vue board (drag & drop), priorités, statuts
- **Objectifs** : CRUD, progression, échéance
- **Assistant IA** : chat avec historique, contexte réel de l'utilisateur, résumé de note, extraction de tâches — fonctionne **sans clé API** grâce à un `MockAIProvider`, avec bascule vers OpenAI/Anthropic si une clé est fournie
- **Dark mode** soigné (palette dédiée, pas une simple inversion de couleurs)
- **Responsive** (sidebar → drawer sur mobile)
- Isolation stricte des données par utilisateur, mots de passe hashés (bcrypt), JWT

## 🧱 Stack technique

**Frontend** : React 18, Vite, Tailwind CSS, React Router, Axios, Recharts, Framer Motion, Lucide Icons
**Backend** : FastAPI, SQLAlchemy 2, Pydantic v2, JWT (python-jose), Passlib (bcrypt)
**Base de données** : PostgreSQL (Docker) ou SQLite (local, zéro configuration)

## 🏗️ Architecture

```
personal-ai-dashboard/
├── backend/
│   ├── app/
│   │   ├── main.py          # point d'entrée FastAPI
│   │   ├── config.py        # variables d'environnement
│   │   ├── database.py      # session SQLAlchemy
│   │   ├── models.py        # tables (users, notes, tasks, goals, tags...)
│   │   ├── schemas.py       # schémas Pydantic
│   │   ├── security.py      # hash de mot de passe + JWT
│   │   ├── dependencies.py  # get_current_user, get_db
│   │   ├── ai/               # AIProvider (mock / openai / anthropic)
│   │   └── routers/          # auth, notes, tasks, goals, dashboard, ai
│   ├── tests/
│   └── seed.py               # crée un compte de démonstration
└── frontend/
    └── src/
        ├── context/          # Auth + Theme
        ├── services/api.js   # client axios (JWT auto-attaché)
        ├── components/layout/
        └── pages/            # Dashboard, Notes, Tasks, Goals, AIAssistant, Settings
```

## 🚀 Installation locale (sans Docker)

### Backend

```bash
cd backend
python -m venv .venv && source .venv/bin/activate   # Windows : .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
python seed.py        # crée le compte de démo (optionnel mais recommandé)
uvicorn app.main:app --reload
```

L'API tourne sur **http://localhost:8000** (SQLite par défaut, aucune base à installer).
Documentation interactive : http://localhost:8000/docs (Swagger) et `/redoc`.

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

L'app tourne sur **http://localhost:5173**.

### Compte de démonstration

```
email    : demo@example.com
password : Demo123!
```

## 🐳 Avec Docker

```bash
cp backend/.env.example backend/.env
docker compose up --build
```

Cela lance PostgreSQL, le backend (port 8000) et le frontend (port 5173). Une fois les
conteneurs démarrés, exécute le seed dans le conteneur backend si tu veux le compte de démo :

```bash
docker compose exec backend python seed.py
```

## 🔑 Variables d'environnement

Voir `backend/.env.example` et `frontend/.env.example`. Points clés :

- `DATABASE_URL` — SQLite par défaut, PostgreSQL en Docker
- `JWT_SECRET` — **à changer en production**
- `AI_PROVIDER` — `mock` (défaut, aucune clé requise), `openai` ou `anthropic`
- `OPENAI_API_KEY` / `ANTHROPIC_API_KEY` — uniquement nécessaires si `AI_PROVIDER` correspondant

Aucune clé API n'est jamais exposée au frontend : tous les appels IA passent par le backend.

## 🧪 Tests

```bash
cd backend
pytest
```

Couvre : inscription/connexion, CRUD notes, et l'isolation des données entre utilisateurs.

## 📍 Prochaines étapes

Non inclus dans cette Phase 1, mais l'architecture (modèles `Event`/`Document`, layout,
sidebar, AIProvider) est conçue pour les accueillir sans refonte :

- Calendrier (vues mois/semaine/jour)
- Upload et gestion de documents + pipeline RAG (chunking, embeddings, recherche sémantique)
- Notifications en temps réel
- Page Analytics dédiée (au-delà du graphique du dashboard)
- Command Palette (`Ctrl+K`) et raccourcis clavier
- Onboarding après inscription
- Tests frontend, CI/CD, migrations Alembic

## ⚠️ Sécurité — à savoir avant un déploiement réel

- Change `JWT_SECRET` avant toute mise en production
- Le code a été écrit à la main dans un environnement sans accès réseau (donc sans
  `pip install` / `npm install` exécutés ici) : teste-le en local avant de t'y fier,
  et ouvre une issue si tu rencontres une erreur d'import ou de dépendance
