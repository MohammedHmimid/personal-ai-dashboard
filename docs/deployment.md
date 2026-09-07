# Déploiement

## Local / Docker

Voir le README à la racine (installation locale ou `docker compose up --build`).

## Avant un vrai déploiement

- [ ] Générer un `JWT_SECRET` fort et unique (ex. `openssl rand -hex 32`)
- [ ] Utiliser PostgreSQL (pas SQLite) en production
- [ ] Restreindre `FRONTEND_ORIGIN` (CORS) au domaine réel du frontend
- [ ] Servir le frontend en build statique (`npm run build`) derrière un CDN/nginx,
      plutôt qu'avec le serveur de dev Vite
- [ ] Ajouter des migrations Alembic si le schéma doit évoluer sans perte de données
- [ ] Mettre les clés IA (`OPENAI_API_KEY`/`ANTHROPIC_API_KEY`) dans un gestionnaire de
      secrets (jamais commitées, jamais exposées au frontend)
- [ ] Ajouter un reverse proxy HTTPS (nginx/Caddy/Traefik) devant les deux services
