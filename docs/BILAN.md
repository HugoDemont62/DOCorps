# Bilan du projet — DevOpsCorp

> Livrable de la **section 9** de l'énoncé (`exercice-global.md`) : retour d'expérience structuré sur la conception, la mise en œuvre et l'outillage de l'application *DevOpsCorp*.

---

## 1. Synthèse du projet livré

L'objectif du fil rouge a été tenu : une application web découpée en microservices, conteneurisée, testée, scannée pour la qualité, déployée et supervisée. Le périmètre couvert est résumé ci-dessous.

| Domaine | Mise en œuvre concrète | Localisation |
|---|---|---|
| **Versionnement** | Repo Git structuré (`frontend/`, `auth-api/`, `product-api/`, `infra/`, `docs/`, `tests/`), README avec badges CI | racine, `README.md` |
| **Frontend** | React + Vite, pages login/register/home/products, JWT en `localStorage`, appels REST vers les deux APIs | `frontend/` |
| **Auth API** | PHP 8.1 + Apache + SQLite, endpoints `/api/register`, `/api/login`, `/api/me`, `/api/logout`, JWT HS256, bcrypt cost 12, RBAC user/admin | `auth-api/` |
| **Product API** | Python 3.11 + FastAPI + PostgreSQL, CRUD `/products` sécurisé JWT (secret partagé avec l'Auth API), Swagger automatique sur `/docs` | `product-api/` |
| **Tests unitaires** | Vitest (28), PHPUnit (8), Pytest (10) — exécutés par la CI | `*/tests`, `frontend/src/__tests__` |
| **Tests d'intégration** | 12 scénarios Pytest qui parlent à la stack Compose réelle | `tests/test_integration.py` |
| **Conteneurisation** | `Dockerfile` multi-stage par service, `docker-compose.yml` orchestre 8 conteneurs (3 services + 2 BDD + Prometheus + Grafana + SonarQube) | `*/Dockerfile`, `docker-compose.yml` |
| **CI/CD** | 3 workflows GitHub Actions : `ci.yml` (tests + Sonar), `docker.yml` (build/push GHCR), `integration.yml` (Compose + Pytest) | `.github/workflows/` |
| **Qualité de code** | SonarQube en service Compose, `sonar-project.properties` couvrant les 3 sources + couverture LCOV/coverage.xml | `sonar-project.properties`, `docker-compose.yml` |
| **Infrastructure as Code** | Terraform (provider Docker) qui reproduit la stack à l'identique, variables et outputs séparés | `infra/terraform/` |
| **Déploiement en ligne** | `render.yaml` Blueprint Render : 2 web services Docker + 1 site statique + 1 PostgreSQL managé, CORS et JWT secret injectés automatiquement | `render.yaml` |
| **Supervision** | Prometheus scrape `/metrics` des 3 services, Grafana avec datasource et dashboard *DevOpsCorp — Santé des services* provisionnés, captures incluses | `infra/monitoring/`, `docs/monitoring/` |
| **Documentation** | README racine, README par sous-projet, schémas d'architecture, doc API exhaustive (curl, codes HTTP, payload JWT), guide de déploiement, guide monitoring | `README.md`, `docs/`, `infra/monitoring/README.md` |

---

## 2. Choix techniques structurants

### 2.1 Architecture microservices stricte

Trois services autonomes communiquent uniquement via HTTP/REST, avec leurs propres bases de données. Ce choix a été fait pour pouvoir **déployer, tester et scaler chaque brique indépendamment** (un push sur `auth-api` ne reconstruit pas le frontend, et la matrice Docker du workflow `docker.yml` le matérialise concrètement).

### 2.2 Polyglottisme volontaire

Le sujet imposait PHP pour l'auth et Node/Python pour les produits. Nous avons retenu **PHP 8.1 + Apache + SQLite** pour l'Auth (déploiement Render simple, fichier de BDD versionnable) et **Python 3.11 + FastAPI + PostgreSQL** pour les produits (typage Pydantic, OpenAPI gratuit, instrumentation Prometheus native via `prometheus-fastapi-instrumentator`). Cette hétérogénéité a confirmé l'intérêt de la conteneurisation : aucun environnement local commun n'est requis pour développer ou tester.

### 2.3 JWT HS256 avec **secret partagé**

L'Auth API émet le token, la Product API le vérifie avec **le même `JWT_SECRET`** injecté par variable d'environnement. C'est le contrat le plus simple à mettre en œuvre dans un contexte trust-by-secret (deux services contrôlés par la même équipe). Nous avons rejeté RS256 pour éviter la gestion d'une paire de clés et d'un endpoint JWKS — ce serait un chantier d'amélioration à part entière (cf. § 5).

### 2.4 RBAC à deux rôles

Deux rôles seulement (`user` lecture, `admin` écriture sur les produits). La granularité reste pédagogique mais suffit à démontrer la chaîne complète : claim `role` dans le payload JWT → décorateur de dépendance FastAPI → réponses 403 propres.

### 2.5 Docker Compose comme socle commun

Le même `docker-compose.yml` sert au développement local **et** à la CI d'intégration (`integration.yml` démarre `auth-api`, `product-api`, `postgres` puis lance Pytest). Cela élimine la classe de bugs « ça marche en local mais pas en CI ».

### 2.6 Terraform avec provider Docker

Terraform est utilisé non pas pour provisionner du cloud (Render gère cette partie via son Blueprint) mais pour **reproduire à l'identique** la topologie locale via du déclaratif versionné. C'est un compromis assumé : on démontre la maîtrise de l'IaC sans dépendre d'un compte cloud payant.

### 2.7 Render plutôt que Railway/Fly/Vercel

Render a été retenu pour quatre raisons : (1) un seul fichier `render.yaml` décrit toute la stack (Blueprint), (2) la PostgreSQL managée est gratuite et injectable via `fromDatabase`, (3) la génération automatique du `JWT_SECRET` (`generateValue: true`) et son partage entre services (`fromService`) est native, (4) les Pull Request Previews du frontend permettent de valider visuellement chaque PR.

### 2.8 Provisioning Grafana **as code**

Aucun clic dans l'UI Grafana : la datasource Prometheus et le dashboard *Santé des services* sont versionnés dans `infra/monitoring/grafana/provisioning/`. Conséquence directe : un `docker compose up -d grafana` suffit à reconstruire un environnement de supervision identique sur n'importe quelle machine. La capture présente dans `docs/monitoring/screenshots/` documente l'état de référence.

---

## 3. Difficultés rencontrées et résolutions

### 3.1 Frontend non scrapé par Prometheus

**Problème.** Au premier `docker compose up`, le job `frontend` apparaissait en *DOWN* dans Prometheus (`connection refused` sur `:3000`). L'image construite par défaut prenait le **dernier stage** du `Dockerfile` (Nginx sur port 80), alors que Compose mappait `3000:3000` et que Prometheus scrapait `frontend:3000`.

**Résolution.** Forcer le stage de build dans Compose :

```22:23:docker-compose.yml
      # Sans target, Docker prend le dernier stage (nginx:80) alors que ce service
      # mappe 3000:3000 et monte le code pour Vite — Prometheus doit scraper le port 3000.
```

avec `target: dev`. Le piège est documenté dans `infra/monitoring/README.md` § *Dépannage* pour les futurs membres.

### 3.2 CORS en production ≠ CORS en développement

En local, le frontend sert sur `http://localhost:3000` ; sur Render, sur `https://docorps-frontend.onrender.com`. Les valeurs CORS doivent suivre. La solution adoptée : **deux variables distinctes** (`CORS_ORIGIN` côté PHP, `CORS_ORIGINS` côté FastAPI) injectées séparément par Compose et par `render.yaml`. Aucun fallback `*` en production — c'était tentant mais cassait la sécurité du JWT.

### 3.3 Partage du `JWT_SECRET` entre services

Le secret doit être strictement identique entre l'Auth API et la Product API, sinon toute requête authentifiée renvoie 401 sur la Product API. Trois solutions ont été comparées :

1. Hardcoder en dur — exclu (sécurité, et pré-commit Sonar le détecte).
2. Variable Compose unique avec `${JWT_SECRET:-...}` — retenue en local.
3. `fromService` côté Render — retenue en production (le secret est généré une fois sur l'Auth API et réinjecté sur la Product API).

```61:65:render.yaml
      - key: JWT_SECRET
        fromService:
          name: devopscorp-auth-api
          type: web
          envVarKey: JWT_SECRET
```

### 3.4 SonarQube sur job `main` uniquement

Faire tourner SonarQube sur **chaque** PR pesait trop lourd (ressources runner + temps de build) et générait du bruit sur les branches expérimentales. Compromis : `if: github.ref == 'refs/heads/main'` dans `ci.yml`, plus `continue-on-error: true` pour ne pas bloquer un déploiement sur une régression de qualité non bloquante.

### 3.5 Healthcheck PostgreSQL et ordre de démarrage

Le démarrage initial échouait par intermittence : la Product API tentait de se connecter avant que PostgreSQL n'accepte les connexions. Résolution : `depends_on` **avec condition `service_healthy`**, en s'appuyant sur le healthcheck `pg_isready` du conteneur `postgres`.

### 3.6 Conteneur SonarQube — `vm.max_map_count`

L'image SonarQube embarque Elasticsearch et exigeait initialement `vm.max_map_count=262144` sur l'hôte. Pour rester portable (Windows/Mac/Linux sans privilèges sysctl), on a activé `SONAR_ES_BOOTSTRAP_CHECKS_DISABLE=true`. Acceptable pour un usage pédagogique — à durcir pour une prod réelle.

### 3.7 SQLite en production sur Render

SQLite côté Auth API fonctionne mais **se réinitialise à chaque redéploiement** car le filesystem Render n'est pas persistant sur le plan Free. Documenté comme limite connue ; la migration vers PostgreSQL (cf. § 5) est listée dans les axes d'amélioration.

### 3.8 Tests d'intégration — démarrage de la stack en CI

Le sleep de 30 s avant les tests dans `integration.yml` est volontairement large : un retry actif sur `/health` aurait été plus propre, mais aurait demandé un script bash dédié. Accepté comme dette technique court terme.

---

## 4. Ce qui a particulièrement bien fonctionné

- **Le triptyque Compose / CI / IaC reposant sur le même `docker-compose.yml`** : un changement dans un Dockerfile est testé en local, en CI d'intégration et en production de la même façon.
- **Le découpage des workflows** (`ci.yml` / `integration.yml` / `docker.yml`) : feedback rapide en PR (juste les tests unitaires), validation lourde réservée à `main`, build d'images uniquement quand `main` est vert.
- **Le provisioning Grafana** : zéro clic, zéro export manuel, zéro fichier oublié dans un volume Docker. Le dashboard est un artefact Git comme un autre.
- **La documentation par couche** : un README *racine* pour la vue d'ensemble, un README *par sous-projet* pour les détails, et `docs/` pour les transversaux (architecture, API, déploiement, monitoring). Aucun document de plus de 2 écrans, ce qui les rend lisibles.

---

## 5. Axes d'amélioration

### 5.1 Sécurité

- **Refresh tokens.** Le token JWT actuel expire à 1 h sans mécanisme de refresh : l'utilisateur est déconnecté sans avertissement. Implémenter un endpoint `/api/refresh` avec un refresh token long-vécu stocké en cookie `HttpOnly`.
- **Migration HS256 → RS256.** Pour permettre à des services tiers de vérifier les JWT sans connaître le secret de signature, exposer un endpoint JWKS sur l'Auth API.
- **Rate limiting** sur `/api/login` et `/api/register` (actuellement absent — vulnérable au brute force).
- **Stockage JWT.** Aujourd'hui en `localStorage` : à terme, basculer sur un cookie `HttpOnly + Secure + SameSite=Strict` pour neutraliser le risque XSS.

### 5.2 Données & persistance

- **PostgreSQL pour l'Auth API** également : éliminer SQLite, harmoniser le SGBD entre les deux APIs, gagner en persistance sur Render.
- **Migrations versionnées** (Alembic côté Python, Phinx côté PHP) en remplacement des `init.sql` actuels.

### 5.3 Observabilité

- **Logs centralisés** : ajouter une stack ELK ou Loki/Promtail pour corréler les logs des trois services.
- **Tracing distribué** (OpenTelemetry) : suivre une requête frontend qui traverse Auth puis Product.
- **Alerting Prometheus** : `alertmanager` est déjà commenté dans `prometheus.yml`, prêt à être activé pour notifier Slack ou e-mail sur la métrique `up == 0`.

### 5.4 CI/CD

- **Couverture de code uploadée** vers SonarQube (les rapports `coverage.xml` et `lcov.info` sont configurés mais pas générés en CI).
- **Tests E2E Playwright** sur le frontend dans un job CI dédié.
- **Déploiement Render piloté depuis GitHub Actions** plutôt que par push automatique (gain de contrôle, possibilité de gates manuels).
- **Cache npm/pip/composer plus agressif** entre runs.

### 5.5 Infrastructure

- **Kubernetes** : un dossier `infra/kubernetes/` (manifests Deployment/Service/Ingress) est mentionné dans le README mais reste à produire. Indispensable pour un vrai passage à l'échelle.
- **Provider Terraform cloud** (DigitalOcean ou Scaleway) pour démontrer un provisioning hors Docker local.
- **Ansible** pour l'étape post-provisioning (hardening SSH, installation Docker, déploiement) : un dossier `infra/ansible/` est référencé mais à produire.

### 5.6 Frontend

- **Gestion d'état** plus robuste (Zustand ou React Query) : actuellement, le token et l'utilisateur courant sont gérés en `useState` local et duplique la logique de persistance.
- **Internationalisation** (i18next) pour ne plus avoir de chaînes en dur.
- **Storybook** pour documenter les composants UI réutilisables.

---

## 6. Bilan personnel et compétences acquises

Au-delà de la livraison, le projet a permis de mettre en pratique un cycle DevOps complet :

1. **Pensée microservices** — séparer ne suffit pas, il faut définir les contrats (JWT partagé, CORS, `/health`, `/metrics`).
2. **Conteneurisation reproductible** — un Dockerfile multi-stage par service, un Compose qui ne dépend que de `.env.example`.
3. **Pipeline CI/CD discipliné** — feedback rapide en PR, jobs lourds réservés à `main`, build d'images en bout de chaîne.
4. **IaC déclaratif** — tout ce qui est cliqué une fois est perdu ; tout ce qui est versionné est rejouable.
5. **Observabilité intégrée dès le code** — exposer `/metrics` n'est pas un add-on, c'est une responsabilité du service.
6. **Documentation comme livrable** — un README à jour vaut une réunion d'onboarding.

Le projet est **prêt à être étendu** : ajouter un nouveau microservice consiste à dupliquer un dossier, ajouter une entrée dans Compose, un job dans la matrice du workflow Docker, un scrape job dans Prometheus et une rangée dans `render.yaml`. La friction est minimale — c'est précisément ce qu'une chaîne DevOps doit garantir.

---

*Rédigé en clôture de l'itération finale du fil rouge — Promotion 2025-2026.*
