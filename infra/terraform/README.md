# Terraform — Infrastructure as Code

Deux configurations Terraform indépendantes coexistent dans ce dossier :

| Sous-dossier | Provider | Cible | Usage |
|---|---|---|---|
| *(racine `infra/terraform/`)* | `kreuzwerker/docker` | Conteneurs Docker locaux | Démo IaC, validation locale |
| [`render/`](render/) | `render-oss/render` | Render.com (prod réelle) | **Déploiement de production** |

> Les deux peuvent être utilisées en parallèle : la première reproduit la stack en local, la seconde déploie les images GHCR sur Render.

---

## 1. Terraform Docker (local) — ce dossier

Provider **Docker** (`kreuzwerker/docker ~> 3.0`) — provisioning local des conteneurs.

### Ressources déclarées

| Ressource | Type | Description |
|-----------|------|-------------|
| `docker_network.devopscorp` | Réseau | Bridge interne entre services |
| `docker_volume.postgres_data` | Volume | Persistance PostgreSQL |
| `docker_container.postgres` | Conteneur | PostgreSQL 15 avec healthcheck |
| `docker_container.product_api` | Conteneur | API Produits (FastAPI) |
| `docker_container.auth_api` | Conteneur | API Auth (PHP) |
| `docker_container.frontend` | Conteneur | Frontend React (Nginx) |

### Fichiers

```
terraform/
├── main.tf                    # Ressources Docker
├── variables.tf               # Paramètres configurables
├── outputs.tf                 # URLs affichées après apply
└── terraform.tfvars.example   # Template de configuration
```

## Utilisation

```bash
# 1. Copier et remplir les variables
cp terraform.tfvars.example terraform.tfvars
# Éditer terraform.tfvars avec vos vraies valeurs

# 2. Initialiser le provider
terraform init

# 3. Vérifier le plan
terraform plan

# 4. Appliquer
terraform apply

# 5. Détruire
terraform destroy
```

Après `apply`, les URLs sont affichées automatiquement :
```
frontend_url    = "http://localhost:3000"
auth_api_url    = "http://localhost:8080"
product_api_url = "http://localhost:5000"
```

## Variables principales

| Variable | Défaut | Description |
|----------|--------|-------------|
| `server_host` | `localhost` | IP/hostname du serveur |
| `jwt_secret` | *(à changer)* | Clé secrète JWT |
| `postgres_password` | *(à changer)* | Mot de passe PostgreSQL |
| `frontend_port` | `3000` | Port du frontend |

> `terraform.tfvars` est dans `.gitignore` — ne jamais committer les secrets.

---

## 2. Terraform Render (production) — sous-dossier `render/`

Provider **`render-oss/render` (~> 1.3)** — déploie 5 services sur Render.com depuis les images GHCR poussées par le workflow `docker.yml`.

### Ressources déclarées

| Ressource | Image GHCR | URL publique |
|---|---|---|
| `render_web_service.frontend` | `ghcr.io/hugodemont62/docorps-frontend` | <https://docorps-frontend.onrender.com/> |
| `render_web_service.auth_api` | `ghcr.io/hugodemont62/docorps-auth-api` | <https://docorps-auth-api.onrender.com/> |
| `render_web_service.product_api` | `ghcr.io/hugodemont62/docorps-product-api` | <https://docorps-product-api.onrender.com/> |
| `render_web_service.prometheus` | `ghcr.io/hugodemont62/docorps-prometheus` | <https://docorps-prometheus.onrender.com/> |
| `render_web_service.grafana` | `ghcr.io/hugodemont62/docorps-grafana` | <https://docorps-grafana.onrender.com/> |

Le préfixe `docorps` est défini par la variable `service_prefix` (`render/variables.tf`).

### Utilisation

```bash
cd infra/terraform/render

# 1. Renseigner les secrets (ne jamais committer)
cp terraform.tfvars.example terraform.tfvars
# Éditer : render_api_key, render_owner_id, jwt_secret, grafana_admin_password

# 2. Déployer
terraform init
terraform plan
terraform apply

# 3. Récupérer les URLs publiques
terraform output
```

### Pré-requis

- Les **5 images Docker doivent exister sur GHCR** avant `terraform apply` — c'est le rôle du workflow `.github/workflows/docker.yml` (déclenché sur push `main`).
- Une **clé API Render** avec droits de création de services (Account Settings → API Keys).

### Limites du plan Free Render

- Sleep automatique après 15 min sans trafic — workflow [`keep-alive.yml`](../../.github/workflows/keep-alive.yml) ping les 5 endpoints toutes les 14 minutes.
- Pas de disque persistant : la base SQLite de l'Auth API et le TSDB de Prometheus sont **réinitialisés à chaque redéploiement**. Limite documentée dans le [BILAN](../../docs/BILAN.md) § 3.7.
