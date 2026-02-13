# GitHub Actions - Pipelines CI/CD

## Description
Configuration des workflows GitHub Actions pour l'automatisation du cycle de vie de l'application.

## Workflows prévus

### 1. CI - Intégration Continue (`ci.yml`)

Déclenché à chaque push et PR vers `main` ou `develop`.

**Étapes :**
1. Checkout du code
2. Setup des environnements (Node, PHP, Python)
3. Installation des dépendances
4. Lint et formatage du code
5. Tests unitaires
6. Tests d'intégration
7. Build des applications
8. Upload des artefacts

**Technologies :**
- Node.js (frontend, product-api)
- PHP (auth-api)
- Docker pour l'isolation

---

### 2. Code Quality (`code-quality.yml`)

Analyse de la qualité du code avec SonarQube.

**Étapes :**
1. Checkout du code
2. Exécution des tests avec couverture
3. Analyse SonarQube
4. Vérification des quality gates
5. Commentaire sur la PR avec les résultats

**Métriques surveillées :**
- Couverture de code (> 80%)
- Bugs et vulnérabilités
- Code smells
- Duplication de code
- Complexité cyclomatique

---

### 3. Docker Build & Push (`docker.yml`)

Construction et publication des images Docker.

**Étapes :**
1. Checkout du code
2. Setup Docker Buildx
3. Login vers Docker Hub / GitHub Container Registry
4. Build des images multi-platform
5. Tag des images (latest, version, commit SHA)
6. Push vers le registry
7. Scan de sécurité des images (Trivy)

**Images :**
- `devopscorp/frontend:latest`
- `devopscorp/auth-api:latest`
- `devopscorp/product-api:latest`

---

### 4. Deploy Test (`deploy-test.yml`)

Déploiement automatique sur l'environnement de test.

**Déclenché par :**
- Push sur `main`
- Workflow manuel

**Étapes :**
1. Checkout du code
2. Pull des images Docker
3. Déploiement sur Render/Railway/Fly.io
4. Smoke tests
5. Notification (Slack, Discord)

---

### 5. Deploy Production (`deploy-prod.yml`)

Déploiement en production (nécessite validation manuelle).

**Déclenché par :**
- Tag de version (`v*.*.*`)
- Workflow manuel avec approbation

**Étapes :**
1. Checkout du code
2. Validation de la version
3. Backup des bases de données
4. Déploiement via Terraform/Ansible
5. Health checks
6. Tests de fumée
7. Rollback automatique si échec
8. Notification

---

### 6. Security Scan (`security.yml`)

Analyse de sécurité quotidienne.

**Étapes :**
1. Scan des dépendances (npm audit, composer audit)
2. Scan des vulnérabilités (Snyk, Dependabot)
3. Scan des images Docker (Trivy)
4. Scan du code (CodeQL)
5. Rapport de sécurité
6. Création d'issues pour les vulnérabilités critiques

---

### 7. Performance Tests (`performance.yml`)

Tests de performance hebdomadaires.

**Étapes :**
1. Déploiement sur environnement de test
2. Exécution des tests k6 / JMeter
3. Génération des rapports
4. Comparaison avec le baseline
5. Notification si dégradation

---

## Structure des workflows

```
.github/
└── workflows/
    ├── ci.yml                    # Intégration continue
    ├── code-quality.yml          # Analyse SonarQube
    ├── docker.yml                # Build & push images
    ├── deploy-test.yml           # Déploiement test
    ├── deploy-prod.yml           # Déploiement production
    ├── security.yml              # Scans de sécurité
    ├── performance.yml           # Tests de performance
    └── cleanup.yml               # Nettoyage des anciennes images
```

## Exemple de workflow CI

```yaml
name: CI - Continuous Integration

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: cd frontend && npm ci
      - name: Lint
        run: cd frontend && npm run lint
      - name: Test
        run: cd frontend && npm test -- --coverage
      - name: Build
        run: cd frontend && npm run build

  test-auth-api:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: shivammathur/setup-php@v2
        with:
          php-version: '8.1'
      - name: Install dependencies
        run: cd auth-api && composer install
      - name: Run tests
        run: cd auth-api && composer test

  test-product-api:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: cd product-api && npm ci
      - name: Test
        run: cd product-api && npm test
```

## Secrets GitHub Actions

Variables secrètes à configurer dans GitHub :

```
# Docker Registry
DOCKER_USERNAME
DOCKER_PASSWORD
GHCR_TOKEN

# SonarQube
SONAR_TOKEN
SONAR_HOST_URL

# Cloud Provider
AWS_ACCESS_KEY_ID        # ou équivalent Azure/GCP
AWS_SECRET_ACCESS_KEY

# Déploiement
DEPLOY_SSH_KEY
DEPLOY_SERVER_HOST

# Notifications
SLACK_WEBHOOK
DISCORD_WEBHOOK

# Base de données
DB_PASSWORD_PROD
JWT_SECRET
```

## Badges de statut

À ajouter dans le README principal :

```markdown
![CI](https://github.com/username/DOCorps/workflows/CI/badge.svg)
![Code Quality](https://github.com/username/DOCorps/workflows/Code%20Quality/badge.svg)
![Security](https://github.com/username/DOCorps/workflows/Security/badge.svg)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=DOCorps&metric=coverage)](https://sonarcloud.io/dashboard?id=DOCorps)
```

## Optimisations

### Cache des dépendances

```yaml
- uses: actions/cache@v3
  with:
    path: ~/.npm
    key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
```

### Matrix strategy pour tests parallèles

```yaml
strategy:
  matrix:
    node-version: [16, 18, 20]
    os: [ubuntu-latest, windows-latest]
```

### Conditional steps

```yaml
- name: Deploy
  if: github.ref == 'refs/heads/main'
  run: npm run deploy
```

## Notifications

Configuration des notifications Slack/Discord après chaque workflow :

```yaml
- name: Notify success
  if: success()
  uses: 8398a7/action-slack@v3
  with:
    status: ${{ job.status }}
    text: 'Deployment successful! :rocket:'
    webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

## Bonnes pratiques

1. **Fail fast** - Arrêter rapidement en cas d'échec
2. **Cache** - Utiliser le cache pour les dépendances
3. **Parallélisation** - Exécuter les jobs en parallèle quand possible
4. **Secrets** - Ne jamais hardcoder les secrets
5. **Artifacts** - Sauvegarder les résultats importants
6. **Timeout** - Définir des timeouts pour éviter les workflows bloqués
7. **Documentation** - Commenter les étapes complexes

## Monitoring des workflows

- Tableau de bord GitHub Actions
- Temps d'exécution moyen
- Taux de succès
- Consommation de minutes CI/CD

## À développer
- [ ] Workflow CI complet
- [ ] Intégration SonarQube
- [ ] Build et push des images Docker
- [ ] Déploiement automatique test
- [ ] Déploiement production avec approbation
- [ ] Scans de sécurité
- [ ] Tests de performance
- [ ] Notifications
- [ ] Documentation des workflows
