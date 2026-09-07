# Assistant IA

## Architecture à trois fournisseurs

```
AIProvider (interface abstraite)
├── MockAIProvider      → actif par défaut, aucune clé requise
├── OpenAIProvider       → actif si AI_PROVIDER=openai + OPENAI_API_KEY
└── AnthropicProvider    → actif si AI_PROVIDER=anthropic + ANTHROPIC_API_KEY
```

`app/ai/__init__.py::get_ai_provider()` choisit le fournisseur au démarrage selon
`.env`. Si le fournisseur demandé n'a pas de clé configurée, l'app retombe
automatiquement sur `MockAIProvider` plutôt que de planter.

## Contexte utilisateur

Avant chaque appel `chat()`, le backend construit un petit contexte (tâches en cours,
notes récentes, objectifs actifs) et le transmet au fournisseur — c'est ce qui permet
à l'assistant de répondre à "quelles sont mes tâches aujourd'hui ?" avec de vraies
données, même en mode Mock.

## Fonctionnalités connectées à de vraies données

- **Chat** avec historique de conversation persisté
- **Summarize** — résume le contenu d'une note
- **Extract Tasks** — détecte des lignes actionnables dans une note et les insère
  directement dans la liste de tâches de l'utilisateur (`POST /api/tasks`)

## RAG documentaire (non implémenté en Phase 1)

Le pipeline prévu (upload → extraction → chunking → embeddings → recherche
vectorielle → LLM) nécessite un vector store (pgvector ou Chroma) et un flux
d'upload de fichiers, tous deux hors périmètre de ce socle. `app/ai/base.py` est
conçu pour qu'un futur `RAGProvider` s'y branche sans changer les routers.
