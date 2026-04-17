# Architecture — DevOpsCorp

## Vue d'ensemble

DevOpsCorp est une application web basée sur une architecture **microservices** : chaque service est indépendant, conteneurisé avec Docker et communique via HTTP/REST.

```
┌──────────────────────────────────────────────────────────────┐
│                     Navigateur (React)                       │
│                      localhost:3000                          │
└──────────────┬──────────────────────────┬────────────────────┘
               │ HTTP REST                │ HTTP REST
               ▼                          ▼
┌──────────────────────┐    ┌─────────────────────────────┐
│    Auth API (PHP)    │    │   Product API (Python)      │
│    localhost:8080    │    │   localhost:5000            │
│  Apache + SQLite     │    │  FastAPI + PostgreSQL       │
│  JWT HS256           │    │  JWT (même secret partagé)  │
└──────────────────────┘    └─────────────────────────────┘
         │                               │
         └──────────────┬────────────────┘
                        │  réseau bridge Docker
                        │  devopscorp-network
                        │
          ┌─────────────┼─────────────┐
          ▼             ▼             ▼
    ┌──────────┐  ┌──────────┐  ┌──────────┐
    │  SQLite  │  │PostgreSQL│  │  MySQL   │
    │(auth-api)│  │(products)│  │(optionnel│
    └──────────┘  └──────────┘  └──────────┘
```

## Services

| Service | Technologie | Port local | Base de données |
|---|---|---|---|
| Frontend | React + Vite | 3000 | — |
| Auth API | PHP 8 + Apache | 8080 | SQLite |
| Product API | Python 3 + FastAPI | 5000 | PostgreSQL 15 |
| Prometheus | — | 9090 | — |
| Grafana | — | 3001 | — |
| SonarQube | — | 9000 | — |
| PostgreSQL | — | 5432 | — |
| MySQL | — | 3306 | — (optionnel) |

## Flux d'authentification

```
Client              Auth API (PHP)         Product API (Python)
  │                      │                        │
  │─ POST /api/login ──► │                        │
  │◄─ { token: JWT } ────│                        │
  │                      │                        │
  │─ GET /products ───────────────────────────── ►│
  │   Authorization: Bearer <token>               │
  │                      │   ◄─ vérifie JWT ──────│
  │◄─ 200 [ liste ] ──────────────────────────── ─│
```

1. Le client s'authentifie sur l'**Auth API** et reçoit un **JWT signé HS256** (1h de validité).
2. Le token est stocké en `localStorage` côté navigateur.
3. Chaque requête vers la **Product API** inclut le token dans le header `Authorization: Bearer`.
4. La Product API valide la signature JWT avec le même `JWT_SECRET` partagé.
5. Les routes d'écriture (POST/PUT/DELETE produits) exigent en plus le rôle `admin`.

## Modèles de données

### Users (Auth API — SQLite)

| Colonne | Type | Contrainte |
|---|---|---|
| id | INTEGER | PK, AUTOINCREMENT |
| username | TEXT | NOT NULL, UNIQUE |
| email | TEXT | NOT NULL, UNIQUE |
| password | TEXT | NOT NULL (bcrypt) |
| role | TEXT | DEFAULT 'user' |
| created_at | TIMESTAMP | DEFAULT NOW |

### Products (Product API — PostgreSQL / SQLite)

| Colonne | Type | Contrainte |
|---|---|---|
| id | INTEGER | PK, AUTOINCREMENT |
| name | TEXT | NOT NULL |
| description | TEXT | nullable |
| price | REAL | NOT NULL |
| stock | INTEGER | DEFAULT 0 |
| category | TEXT | nullable |
| created_at | TIMESTAMP | DEFAULT NOW |
| updated_at | TIMESTAMP | DEFAULT NOW |

## Architecture Docker

L'ensemble tourne via **Docker Compose** :

- Réseau bridge interne `devopscorp-network` — les services communiquent par nom de service.
- Volumes nommés pour la persistance : `postgres-data`, `grafana-data`, `sonarqube-data`.
- `depends_on` avec healthcheck PostgreSQL : la Product API attend que la BDD réponde avant de démarrer.
- Prometheus scrape `/metrics` sur les ports 8080 (Auth API) et 5000 (Product API).
- Le frontend tourne en mode `dev` (Vite HMR) en local ; le build de production utilise le stage `nginx`.

## Infrastructure as Code

| Outil | Rôle | Répertoire |
|---|---|---|
| Terraform | Provisioning cloud (VMs, réseau, BDD) | `infra/terraform/` |
| Ansible | Configuration des serveurs, déploiement | `infra/ansible/` |
| Docker Compose | Orchestration locale et CI | `docker-compose.yml` |

## Pipeline CI/CD (GitHub Actions)

```
Push / PR
   │
   ├── ci.yml ─────────── tests unitaires (PHPUnit, Pytest, Jest)
   │                      analyse SonarQube
   │
   ├── integration.yml ── tests d'intégration (services via Docker Compose)
   │
   └── docker.yml ──────── build & push images Docker Hub (push main uniquement)
```

Badges de statut disponibles dans le `README.md` racine.

## Monitoring

- **Prometheus** collecte les métriques HTTP exposées par chaque service sur `/metrics`.
  - Auth API : endpoint PHP manuel (gauge `auth_api_up`).
  - Product API : instrumentation automatique via `prometheus-fastapi-instrumentator`.
- **Grafana** (port 3001) visualise ces métriques via des dashboards provisionnés automatiquement depuis `infra/monitoring/grafana/provisioning/`.

## Sécurité

| Mesure | Détail |
|---|---|
| Mots de passe | Hachés avec **bcrypt** (coût 12) |
| JWT | Signé **HS256**, expiration 1h, secret partagé via variable d'environnement |
| CORS | Origines autorisées explicitement (variable `CORS_ORIGIN` / `CORS_ORIGINS`) |
| RBAC | Rôles `user` (lecture) / `admin` (CRUD complet sur les produits) |
| Secrets | Jamais en dur — variables d'environnement ou secrets Render en production |
| SQL | Requêtes paramétrées (placeholders `?`) — pas de concaténation de chaînes |

## Déploiement production (Render)

Chaque service est décrit dans `render.yaml` et déployé sur [Render](https://render.com) :
- Build Docker depuis le `Dockerfile` de chaque service.
- Variables d'environnement injectées (JWT_SECRET généré par Render).
- CORS configuré avec l'URL exacte du frontend Render (`https://devopscorp-frontend.onrender.com`).
