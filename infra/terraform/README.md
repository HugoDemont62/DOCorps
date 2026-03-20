# Terraform — Infrastructure as Code

## Ce qui est en place

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
