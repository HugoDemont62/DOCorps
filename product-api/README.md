# Product API — Service de gestion des produits

API CRUD de gestion des produits développée en **Python 3.11 + FastAPI**, sécurisée par **JWT** (secret partagé avec l'Auth API), persistée en **SQLite** local, instrumentée pour **Prometheus**.

## URLs

| Environnement | URL | Documentation Swagger |
|---|---|---|
| Local (Docker Compose) | <http://localhost:5000> | <http://localhost:5000/docs> |
| Production (Render) | <https://docorps-product-api.onrender.com/> | <https://docorps-product-api.onrender.com/docs> |

## Endpoints

| Méthode | Route | Rôle requis | Description |
|---|---|---|---|
| `GET` | `/products` | `user` | Liste tous les produits |
| `GET` | `/products/{id}` | `user` | Détail d'un produit |
| `POST` | `/products` | `admin` | Créer un produit |
| `PUT` | `/products/{id}` | `admin` | Modifier un produit |
| `DELETE` | `/products/{id}` | `admin` | Supprimer un produit |
| `GET` | `/health` | — | Health check |
| `GET` | `/metrics` | — | Métriques Prometheus |
| `GET` | `/docs` | — | Swagger UI auto-généré |

Documentation détaillée des payloads et codes HTTP : [`docs/api/README.md`](../docs/api/README.md).

## Technologies

| Composant | Version |
|---|---|
| Python | 3.11 |
| FastAPI | 0.115 |
| Uvicorn | 0.30 |
| PyJWT | 2.9 (HS256) |
| prometheus-fastapi-instrumentator | 7.0 |
| SQLite | embarqué (fichier `products.db`) |
| Pytest | 8.3 |

## Schéma de base de données

```sql
CREATE TABLE products (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name        TEXT NOT NULL,
    description TEXT,
    price       REAL NOT NULL,
    stock       INTEGER DEFAULT 0,
    category    TEXT,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

> En local, `docker-compose.yml` provisionne aussi un PostgreSQL en parallèle (port 5432) — non utilisé par défaut par l'API, prévu pour une migration future.

## Structure du projet

```
product-api/
├── app.py                # Routes FastAPI + modèles Pydantic
├── auth.py               # Dépendances JWT (get_current_user, require_admin)
├── database.py           # Couche d'accès SQLite (CRUD)
├── seed_products.py      # Données de démo
├── tests/
│   └── test_products.py  # 10 tests Pytest
├── requirements.txt
├── Dockerfile
└── README.md
```

## Installation et démarrage

### Avec Docker Compose (recommandé)

```bash
# Depuis la racine du dépôt
docker compose up -d product-api
curl http://localhost:5000/health
```

### En local sans Docker

```bash
cd product-api
python -m venv .venv && source .venv/bin/activate   # ou .venv\Scripts\activate sous Windows
pip install -r requirements.txt
uvicorn app:app --reload --port 5000
```

### Données de démonstration

```bash
python seed_products.py            # n'écrit rien si la table contient déjà des lignes
python seed_products.py --force    # ajoute les démos en plus de l'existant
```

Avec Docker :

```bash
docker compose exec product-api python /app/seed_products.py
```

## Tests

```bash
# En local
cd product-api
pip install -r requirements.txt
pytest tests/ -v

# Via Docker (sans installer Python en local)
docker run --rm -v "$(pwd)/product-api:/app" -w /app python:3.11-slim \
  sh -c "pip install -r requirements.txt -q && pytest tests/ -v"
```

10 tests couvrent : health check, CRUD complet, vérification du JWT, contrôle du rôle `admin` sur les routes d'écriture.

## Variables d'environnement

| Variable | Défaut | Description |
|---|---|---|
| `JWT_SECRET` | — *(requis)* | Clé HS256 — **identique** à celle de l'Auth API |
| `DATABASE_PATH` | `products.db` (à côté du module) | Chemin du fichier SQLite ; `:memory:` pour la CI |
| `CORS_ORIGINS` | `http://localhost:3000,http://127.0.0.1:3000` | Origines CORS séparées par virgule |

## Sécurité

- ✅ JWT obligatoire sur **toutes** les routes (sauf `/health`, `/metrics`, `/docs`)
- ✅ RBAC : rôle `admin` requis pour `POST` / `PUT` / `DELETE`
- ✅ Requêtes paramétrées (placeholders `?`) — aucune concaténation de chaînes
- ✅ Validation Pydantic automatique sur les payloads (réponses 422 propres)
- ✅ CORS restrictif via `CORS_ORIGINS`

## Métriques Prometheus

L'instrumentation est automatique grâce à `prometheus-fastapi-instrumentator`. Endpoint `/metrics` au format texte Prometheus, scrapé par le job `product-api` (voir [`infra/monitoring/prometheus.yml`](../infra/monitoring/prometheus.yml) en local et [`prometheus-render.yml`](../infra/monitoring/prometheus-render.yml) en production).

Métriques principales exposées : `http_requests_total`, `http_request_duration_seconds`, `http_requests_inprogress`.
