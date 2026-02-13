# Guide de Déploiement

## Description
Documentation complète pour le déploiement de l'application DevOpsCorp.

## Vue d'ensemble

L'application peut être déployée de plusieurs manières :
1. **Développement local** - Docker Compose
2. **Environnement de test** - Serveur gratuit en ligne
3. **Production** - Infrastructure cloud avec Terraform/Ansible

---

## 1. Déploiement local (Développement)

### Prérequis
- Docker et Docker Compose installés
- Ports 3000, 5000, 8080 disponibles

### Étapes

```bash
# Cloner le repository
git clone <url-du-repo>
cd DOCorps

# Créer le fichier .env
cp .env.example .env

# Éditer les variables d'environnement
nano .env

# Construire et démarrer les services
docker-compose up -d

# Vérifier que tout fonctionne
docker-compose ps
docker-compose logs -f
```

### Accès aux services
- Frontend : http://localhost:3000
- Auth API : http://localhost:8080
- Product API : http://localhost:5000

---

## 2. Déploiement sur serveur gratuit (Test)

### Options de plateformes gratuites

#### Option 1 : Render.com
- Frontend : Static Site
- APIs : Web Services
- Bases de données : PostgreSQL gratuit

#### Option 2 : Railway.app
- Déploiement via GitHub
- Support Docker
- PostgreSQL/MySQL inclus

#### Option 3 : Vercel + Backend séparé
- Vercel pour le frontend React
- Render/Railway pour les APIs

#### Option 4 : Fly.io
- Support Docker natif
- Déploiement multi-régions

### Étapes générales

1. **Préparer les Dockerfiles optimisés pour la production**
2. **Configurer les variables d'environnement** sur la plateforme
3. **Connecter le repository GitHub**
4. **Configurer les build settings**
5. **Déployer**

### Exemple avec Render.com

```yaml
# render.yaml
services:
  - type: web
    name: devopscorp-frontend
    env: static
    buildCommand: cd frontend && npm install && npm run build
    staticPublishPath: frontend/build

  - type: web
    name: devopscorp-auth-api
    env: docker
    dockerfilePath: ./auth-api/Dockerfile
    envVars:
      - key: DB_HOST
        value: <database-url>

  - type: web
    name: devopscorp-product-api
    env: docker
    dockerfilePath: ./product-api/Dockerfile

databases:
  - name: auth-db
    plan: free
  - name: product-db
    plan: free
```

---

## 3. Déploiement en Production (Cloud)

### Architecture cible
- Cloud provider : AWS / Azure / GCP
- Provisionné avec Terraform
- Configuré avec Ansible
- Monitoring : Prometheus + Grafana

### Étapes de déploiement

#### Phase 1 : Provisioning (Terraform)

```bash
cd infra/terraform

# Initialiser Terraform
terraform init

# Vérifier le plan
terraform plan

# Appliquer la configuration
terraform apply

# Noter les outputs (IPs, URLs...)
terraform output
```

#### Phase 2 : Configuration (Ansible)

```bash
cd infra/ansible

# Tester la connectivité
ansible all -i inventory/prod -m ping

# Setup des serveurs
ansible-playbook -i inventory/prod playbooks/setup-servers.yml

# Configuration des bases de données
ansible-playbook -i inventory/prod playbooks/configure-db.yml

# Déploiement de l'application
ansible-playbook -i inventory/prod playbooks/deploy-app.yml

# Installation du monitoring
ansible-playbook -i inventory/prod playbooks/monitoring.yml
```

#### Phase 3 : Vérification

```bash
# Vérifier les services
ssh user@<server-ip>
docker ps
curl http://localhost:8080/health
curl http://localhost:5000/health

# Vérifier les logs
docker-compose logs -f

# Vérifier Nginx
sudo systemctl status nginx
```

---

## 4. CI/CD - Déploiement automatique

Le pipeline GitHub Actions automatise le déploiement :

### Workflow de déploiement

1. **Push sur `main`** → Déploiement automatique en test
2. **Tag de version** → Déploiement en production après validation
3. **Pull Request** → Déploiement preview (optionnel)

### Commandes manuelles

```bash
# Déclencher un déploiement via GitHub CLI
gh workflow run deploy.yml

# Voir les déploiements en cours
gh run list --workflow=deploy.yml
```

---

## 5. Rollback et récupération

### Rollback Docker Compose

```bash
# Revenir à la version précédente
docker-compose down
git checkout <previous-commit>
docker-compose up -d
```

### Rollback Kubernetes

```bash
# Historique des déploiements
kubectl rollout history deployment/frontend

# Rollback au déploiement précédent
kubectl rollout undo deployment/frontend

# Rollback à une révision spécifique
kubectl rollout undo deployment/frontend --to-revision=2
```

---

## 6. Sauvegarde et restauration

### Bases de données

```bash
# Backup MySQL (Auth API)
docker-compose exec mysql mysqldump -u root -p devopscorp_auth > backup_auth.sql

# Restauration
docker-compose exec -T mysql mysql -u root -p devopscorp_auth < backup_auth.sql

# Backup PostgreSQL (Product API)
docker-compose exec postgres pg_dump -U postgres devopscorp_products > backup_products.sql

# Restauration
docker-compose exec -T postgres psql -U postgres devopscorp_products < backup_products.sql
```

---

## 7. Monitoring du déploiement

### Health Checks

Chaque service doit exposer un endpoint `/health` :

```bash
curl http://localhost:8080/health
curl http://localhost:5000/health
curl http://localhost:3000/health
```

### Métriques à surveiller
- Uptime des services
- Temps de réponse des APIs
- Utilisation CPU/RAM
- Espace disque
- Taux d'erreur

---

## Checklist de déploiement

### Avant le déploiement
- [ ] Tests passent en local
- [ ] Variables d'environnement configurées
- [ ] Secrets sécurisés (pas de hardcoding)
- [ ] Base de données sauvegardée
- [ ] Documentation à jour

### Après le déploiement
- [ ] Services démarrés correctement
- [ ] Health checks OK
- [ ] Tests de fumée (smoke tests)
- [ ] Monitoring actif
- [ ] Logs accessibles
- [ ] Backup configuré

---

## Troubleshooting

### Problèmes courants

**Les conteneurs ne démarrent pas**
```bash
docker-compose logs <service-name>
docker-compose ps
```

**Erreur de connexion à la base de données**
- Vérifier les variables d'environnement
- Vérifier que la DB est démarrée
- Vérifier les credentials

**Port déjà utilisé**
```bash
# Windows
netstat -ano | findstr :3000

# Tuer le processus
taskkill /PID <pid> /F
```

---

## Contacts et support

Pour toute question sur le déploiement, contactez l'équipe DevOps.

## À compléter
- [ ] Configuration spécifique du cloud provider choisi
- [ ] Scripts de déploiement automatisés
- [ ] Documentation des secrets et variables d'env
- [ ] Procédures de rollback détaillées
- [ ] Plan de disaster recovery
