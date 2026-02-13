## Projet fil rouge DevOps – Énoncé détaillé


### Contexte
Vous intégrez l’équipe DevOps d’une entreprise fictive, "DevOpsCorp", qui souhaite moderniser une application web interne. L’objectif est de mettre en place une architecture microservices, d’automatiser les déploiements, d’assurer la qualité logicielle et la supervision, en appliquant les pratiques et outils vus en cours.

Vous allez, par itérations, construire et outiller un projet complet, en suivant des consignes proches d’un vrai contexte d’entreprise. Chaque étape doit être documentée (README, captures, scripts, etc.) et versionnée dans Git. L’énoncé est distribué tel quel aux élèves.

---


### Objectifs généraux
- Concevoir une application web découpée en microservices
- Mettre en place un dépôt Git structuré et collaboratif
- Développer une interface front-end en React (affichage, navigation, appels API)
- Développer une API d’authentification en PHP (JWT, endpoints login/register, gestion des droits)
- Développer une API "produits" (ou autre ressource métier) en Node.js ou Python (CRUD, sécurisée par JWT)
- Écrire des tests unitaires et d’intégration pour chaque service (ex : Jest, PHPUnit, Pytest…)
- Conteneuriser chaque service avec Docker
- Orchestrer l’ensemble avec Docker Compose ou Kubernetes
- Mettre en place un pipeline CI/CD (GitHub Actions, GitLab CI, Jenkins…)
- Intégrer une analyse de qualité de code (SonarQube ou équivalent)
- Déployer sur un environnement de test (VM, cloud, ou cluster local)
- Gérer l’infrastructure avec Terraform et/ou Ansible
- Mettre en place la supervision (Prometheus, Grafana, ELK, Datadog…)
- Documenter chaque étape et les choix techniques

---


### Exigences détaillées

#### 1. **Architecture et versionnement**
- Créez un dépôt Git (local puis distant sur GitHub ou GitLab)
- Structurez le repo en dossiers clairs : /frontend, /auth-api, /product-api, /infra, /docs…
- Rédigez un README clair (présentation, objectifs, organisation du repo)
- Travail collaboratif : chaque membre crée une branche, fait une PR/MR, effectue une revue de code

#### 2. **Développement applicatif**
- **Frontend React** :
  - Page de login, page d’inscription, page d’accueil, page "produits" (CRUD)
  - Authentification via JWT (stockage sécurisé du token)
  - Appels API vers les microservices
- **API Auth (PHP)** :
  - Endpoints : /register, /login, /me, /logout
  - Génération et validation de JWT
  - Gestion des droits (ex : admin/user)
  - Base de données (MySQL ou SQLite)
- **API Produits (Node.js ou Python)** :
  - Endpoints CRUD sécurisés (JWT obligatoire)
  - Exemple : /products, /products/:id
  - Base de données (MongoDB, PostgreSQL ou SQLite)

#### 3. **Tests**
- Écrire des tests unitaires et d’intégration pour chaque service (ex : Jest pour Node, PHPUnit pour PHP, Pytest pour Python, Testing Library pour React)
- Intégrer les tests dans le pipeline CI/CD

#### 4. **Qualité de code**
- Mettre en place SonarQube (ou équivalent) pour chaque microservice et le frontend
- Corriger les problèmes bloquants détectés

+- Dockerfile pour chaque service
- docker-compose.yml pour l’ensemble (services, réseaux, volumes, dépendances)
- Déploiement du projet sur un serveur gratuit en ligne (ex : Render, Railway, Vercel, Heroku, etc.) pour valider l’accessibilité du projet

+- Pipeline automatisé (GitHub Actions, GitLab CI, Jenkins…)
- Étapes : build, tests, analyse Sonar, build/push images Docker, déploiement sur environnement de test ou serveur gratuit en ligne
- Ajout de badges de statut dans le README

#### 7. **Infrastructure as Code**
- Utilisez Docker pour l’orchestration locale (développement, tests)
- Utilisez Terraform (et/ou Ansible) pour provisionner l’infrastructure en production : machines virtuelles, réseau, base de données, stockage…
- Les scripts IaC doivent être reproductibles et versionnés

#### 8. **Supervision et logs**
- Installer et configurer un outil de monitoring (Prometheus + Grafana, ELK, ou Datadog)
- Créer un dashboard simple pour visualiser des métriques ou logs de l’application

#### 9. **Documentation et bilan**
- Documenter chaque étape (README, schémas d’architecture, scripts, captures d’écran)
- Rédiger un bilan : difficultés rencontrées, choix techniques, axes d’amélioration

---


### Contraintes et conseils
- **Aucune réponse n’est fournie** : vous devez chercher, tester, itérer, comme en entreprise
- Travaillez en équipe, partagez les tâches, faites des revues de code
- Respectez les bonnes pratiques de sécurité (stockage des secrets, gestion des droits, validation des entrées…)
- Utilisez Docker pour le développement et les tests en local, Terraform pour la production (cloud ou VM)
- Utilisez les outils vus en cours (Git, Docker, CI/CD, Ansible, Terraform, Prometheus, Grafana, ELK, Datadog…)
- Versionnez tout (code, scripts, docs, configs)
- Commentez vos scripts et fichiers de configuration
- Faites valider chaque étape par un "lead technique" (formateur ou pair)

---
## Livrables attendus

- Dépôt Git complet et structuré
- Frontend React fonctionnel, APIs séparées (auth en PHP, produits en Node/Python)
- Dockerfile(s), docker-compose.yml, scripts IaC (Terraform/Ansible)
- Fichiers de pipeline CI/CD, configuration SonarQube
- Tests automatisés pour chaque service
- Déploiement accessible sur un serveur gratuit en ligne (lien à fournir)
- Dashboards ou captures de supervision
- Documentation claire et synthétique

