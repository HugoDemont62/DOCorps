# GitHub Actions — Pipelines CI/CD

## Workflows en place

### `ci.yml` — Intégration continue
Déclenché sur chaque **push** et **PR** vers `main` ou `features/**`.

| Job | Outil | Résultat |
|-----|-------|---------|
| Tests Product API | Python 3.11 + Pytest | 10 tests |
| Tests Auth API | PHP 8.1 + PHPUnit | 8 tests |
| Tests Frontend | Node 20 + Vitest | 28 tests |
| Build frontend | Vite build | vérification |
| SonarQube (main seulement) | sonarqube-scan-action | analyse qualité |

---

### `docker.yml` — Build & Push images
Déclenché sur **push vers main** ou manuellement.

- Login vers **GitHub Container Registry** (`ghcr.io`)
- Build + push des 3 images : `frontend`, `auth-api`, `product-api`
- Cache GitHub Actions (layer caching)
- Tags : `latest`, `sha-<commit>`, `main`

---

### `integration.yml` — Tests d'intégration
Déclenché sur **push vers main** ou manuellement.

- Lance `auth-api`, `product-api`, `postgres` via Docker Compose
- Exécute `tests/test_integration.py` (Pytest + requests)
- 12 scénarios : Auth API, Product API, flux JWT croisé

---

## Secrets à configurer dans GitHub

| Secret | Usage |
|--------|-------|
| `SONAR_TOKEN` | Analyse SonarQube |
| `SONAR_HOST_URL` | URL de votre instance SonarQube |
| `GITHUB_TOKEN` | Automatiquement fourni (push GHCR) |

---

## Lancer manuellement

```bash
gh workflow run ci.yml
gh workflow run docker.yml
gh workflow run integration.yml
```
