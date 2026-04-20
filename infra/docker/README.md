# Docker — Conteneurisation

Ce dossier contient les **fichiers d'initialisation des bases** consommés par les conteneurs Docker (montés comme volumes via `docker-compose.yml`).

```
infra/docker/
├── mysql/
│   └── init.sql          # Schéma MySQL (Auth API alternative)
└── postgres/
    └── init.sql          # Schéma PostgreSQL (Product API)
```

> Les **Dockerfiles applicatifs** ne sont **pas** ici : ils vivent à la racine de chaque service (`frontend/Dockerfile`, `auth-api/Dockerfile`, `product-api/Dockerfile`) pour que les contextes Docker restent minimaux et que chaque service puisse être buildé indépendamment.

## Vue d'ensemble Docker du projet

| Composant | Localisation du Dockerfile | Image GHCR (CI) |
|---|---|---|
| Frontend (React + Vite + nginx) | `frontend/Dockerfile` (multi-stage `dev` / `build` / nginx) | `ghcr.io/hugodemont62/docorps-frontend` |
| Auth API (PHP 8.1 + Apache) | `auth-api/Dockerfile` | `ghcr.io/hugodemont62/docorps-auth-api` |
| Product API (Python 3.11 + FastAPI) | `product-api/Dockerfile` | `ghcr.io/hugodemont62/docorps-product-api` |
| Prometheus (config embarquée) | `infra/monitoring/Dockerfile.prometheus` | `ghcr.io/hugodemont62/docorps-prometheus` |
| Grafana (provisioning embarqué) | `infra/monitoring/Dockerfile.grafana` | `ghcr.io/hugodemont62/docorps-grafana` |

L'orchestration locale est décrite dans [`docker-compose.yml`](../../docker-compose.yml) à la racine, qui démarre **8 conteneurs** : 3 services applicatifs + 2 BDD (MySQL, PostgreSQL) + Prometheus + Grafana + SonarQube.

## Réseau et volumes

- **Réseau** : `devopscorp-network` (bridge interne, défini dans `docker-compose.yml`).
- **Volumes nommés** persistants : `devopscorp-postgres-data`, `devopscorp-mysql-data`, `devopscorp-prometheus-data`, `devopscorp-grafana-data`, `devopscorp-sonarqube-{data,logs,extensions}`.

## Variables d'environnement

Tous les secrets (`JWT_SECRET`, mots de passe BDD, `GRAFANA_ADMIN_PASSWORD`) sont chargés depuis un fichier **`.env`** à la racine — **non versionné**. Voir [`.env.example`](../../.env.example) pour les valeurs attendues.

## Commandes utiles

```bash
docker compose up -d                          # Démarrer toute la stack
docker compose up -d auth-api product-api     # Sous-ensemble (sans monitoring)
docker compose logs -f product-api            # Suivre les logs d'un service
docker compose ps                             # État des conteneurs
docker compose down                           # Stop sans supprimer les volumes
docker compose down -v                        # Stop + suppression des volumes
docker compose build --no-cache frontend      # Forcer le rebuild d'une image
```

## Build et push GHCR

Le workflow [`.github/workflows/docker.yml`](../../.github/workflows/docker.yml) build et pousse automatiquement les 5 images sur **GitHub Container Registry** à chaque push sur `main`. Tags : `latest`, `sha-<commit>`, `main`.
