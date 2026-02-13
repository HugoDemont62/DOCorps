# DevOpsCorp - Projet Fil Rouge DevOps

## 📋 Présentation

Bienvenue sur le projet DevOpsCorp ! Ce repository contient une application web moderne basée sur une architecture microservices, développée dans le cadre d'un projet DevOps complet.

L'objectif est de mettre en pratique les bonnes pratiques DevOps : conteneurisation, CI/CD, Infrastructure as Code, tests automatisés, supervision et déploiement continu.

## 🎯 Objectifs du projet

- Concevoir une application web découpée en **microservices**
- Développer un **frontend React** moderne et responsive
- Créer une **API d'authentification** en PHP avec gestion JWT
- Développer une **API produits** en Node.js/Python avec CRUD sécurisé
- Mettre en place **Docker** et **Docker Compose** pour l'orchestration
- Implémenter un **pipeline CI/CD** automatisé
- Intégrer l'**analyse de qualité de code** (SonarQube)
- Déployer sur un **environnement de production** accessible
- Gérer l'infrastructure avec **Terraform** et **Ansible**
- Mettre en place la **supervision** (Prometheus, Grafana)

## 📁 Structure du repository

```
DOCorps/
├── frontend/              # Application React (interface utilisateur)
├── auth-api/             # API d'authentification PHP (JWT, login/register)
├── product-api/          # API produits Node.js/Python (CRUD sécurisé)
├── infra/                # Infrastructure as Code
│   ├── docker/          # Dockerfiles et configurations
│   ├── terraform/       # Scripts de provisioning infrastructure
│   ├── ansible/         # Playbooks de configuration
│   └── kubernetes/      # Manifests K8s (optionnel)
├── docs/                 # Documentation technique
│   ├── architecture/    # Schémas et design
│   ├── api/            # Documentation des APIs
│   └── deployment/     # Guides de déploiement
├── tests/               # Tests d'intégration globaux
├── .github/workflows/   # Pipelines CI/CD GitHub Actions
└── README.md           # Ce fichier

```

## 🚀 Technologies utilisées

### Frontend
- **React** - Framework JavaScript pour l'interface utilisateur
- **JWT** - Gestion de l'authentification côté client

### Backend
- **PHP** - API d'authentification
- **Python** - API produits
- **MySQL** - Bases de données

### DevOps
- **Docker** - Conteneurisation des services
- **Docker Compose** - Orchestration locale
- **GitHub Actions** - CI/CD
- **Terraform** - Infrastructure as Code
- **Ansible** - Configuration management
- **SonarQube** - Analyse de qualité de code
- **Prometheus + Grafana** - Monitoring et supervision



## 📝 Licence

Projet pédagogique - ECV Digital - Formation DevOps

## 🤝 Auteurs

Équipe DevOpsCorp - Promotion 2025-2026

---

Pour toute question, consultez la documentation ou contactez l'équipe DevOps.