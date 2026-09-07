# API

Documentation interactive générée automatiquement par FastAPI :
`GET /docs` (Swagger UI) et `GET /redoc`.

## Authentification

| Méthode | Route              | Description                    |
|---------|---------------------|--------------------------------|
| POST    | /api/auth/register  | Créer un compte                |
| POST    | /api/auth/login     | Se connecter (retourne un JWT) |
| GET     | /api/auth/me        | Profil de l'utilisateur connecté |
| PUT     | /api/auth/me        | Modifier nom / thème           |

Toutes les routes ci-dessous requièrent l'en-tête `Authorization: Bearer <token>`.

## Notes

| Méthode | Route            |
|---------|------------------|
| GET     | /api/notes       |
| POST    | /api/notes       |
| GET     | /api/notes/{id}  |
| PUT     | /api/notes/{id}  |
| DELETE  | /api/notes/{id}  |

Paramètres de requête `GET /api/notes` : `search`, `category_id`, `favorite`, `archived`.

## Tâches

| Méthode | Route           |
|---------|-----------------|
| GET     | /api/tasks      |
| POST    | /api/tasks      |
| PUT     | /api/tasks/{id} |
| DELETE  | /api/tasks/{id} |

## Objectifs

| Méthode | Route           |
|---------|-----------------|
| GET     | /api/goals      |
| POST    | /api/goals      |
| PUT     | /api/goals/{id} |
| DELETE  | /api/goals/{id} |

## Dashboard

| Méthode | Route                  |
|---------|--------------------------|
| GET     | /api/dashboard/summary  | KPIs, productivité 7 jours, tâches du jour, notes récentes |

## Assistant IA

| Méthode | Route                              |
|---------|-------------------------------------|
| GET     | /api/ai/conversations               |
| GET     | /api/ai/conversations/{id}          |
| DELETE  | /api/ai/conversations/{id}          |
| POST    | /api/ai/chat                        | `{ conversation_id?, message }` |
| POST    | /api/ai/summarize                   | `{ text }` |
| POST    | /api/ai/extract-tasks               | `{ text }` |
