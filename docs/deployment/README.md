# Guide de Déploiement

## Description
Documentation complète pour le déploiement de l'application DevOpsCorp.

## Vue d'ensemble

L'application peut être déployée de plusieurs manières :
1. **Développement local** - Docker Compose
2. **Production** - Render via Terraform (provider `render-oss/render`)
3. **Production cloud alternative** - Provisioning Terraform/Ansible (cible non livrée)

## Déploiement actuel — Render

| Service | URL | Source | Image |
|---|---|---|---|
| Frontend | <https://docorps-frontend.onrender.com/> | `frontend/Dockerfile` (stage `build` + nginx) | `ghcr.io/hugodemont62/docorps-frontend:latest` |
| Auth API | <https://docorps-auth-api.onrender.com/> | `auth-api/Dockerfile` | `ghcr.io/hugodemont62/docorps-auth-api:latest` |
| Product API | <https://docorps-product-api.onrender.com/> | `product-api/Dockerfile` | `ghcr.io/hugodemont62/docorps-product-api:latest` |
| Prometheus | <https://docorps-prometheus.onrender.com/> | `infra/monitoring/Dockerfile.prometheus` (config embarquée) | `ghcr.io/hugodemont62/docorps-prometheus:latest` |
| Grafana | <https://docorps-grafana.onrender.com/> | `infra/monitoring/Dockerfile.grafana` (provisioning embarqué) | `ghcr.io/hugodemont62/docorps-grafana:latest` |

Le déploiement réel est piloté par **Terraform** (`infra/terraform/render/`) :

```bash
cd infra/terraform/render
cp terraform.tfvars.example terraform.tfvars
# renseigner render_api_key, render_owner_id, jwt_secret, grafana_admin_password
terraform init
terraform apply
terraform output     # affiche les 5 URLs publiques
```

Les images Docker doivent avoir été poussées sur GHCR par le workflow `docker.yml` **avant** `terraform apply`.

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

## 2. Alternatives de déploiement gratuites

| Plateforme | Atouts | Limite plan Free |
|---|---|---|
| **Render** *(retenu — voir ci-dessus)* | Blueprint Terraform, PostgreSQL managé, secrets injectables entre services | Sleep après 15 min d'inactivité |
| Railway.app | Déploiement Git, Docker natif | Crédit limité |
| Fly.io | Multi-régions, Docker natif | Quota CPU |
| Vercel + backend séparé | Frontend statique ultra-rapide | Pas adapté aux APIs Docker |

L'historique du projet contient également un fichier [`render.yaml`](../../render.yaml) (Blueprint Render *à la main* sans Terraform) — conservé comme alternative mais non utilisé en production.

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
