/**
 * main.tf — Infrastructure DevOpsCorp
 * =====================================
 * Ce fichier utilise le provider Docker (pour le développement/test local).
 * Pour un déploiement cloud, remplacez le provider par DigitalOcean, AWS, etc.
 *
 * Usage :
 *   terraform init
 *   terraform plan
 *   terraform apply
 */

terraform {
  required_version = ">= 1.5.0"

  required_providers {
    # Provider Docker — orchestre des conteneurs localement
    # Utile pour les tests et la validation de l'infrastructure avant déploiement cloud.
    docker = {
      source  = "kreuzwerker/docker"
      version = "~> 3.0"
    }
  }
}

# ── Provider Docker ───────────────────────────────────────────────────────────
provider "docker" {
  # Par défaut : socket Unix local.
  # Pour un démon Docker distant : host = "tcp://IP:2376"
}

# ── Réseau interne ────────────────────────────────────────────────────────────
resource "docker_network" "devopscorp" {
  name   = "devopscorp-network"
  driver = "bridge"
}

# ── Volume PostgreSQL ─────────────────────────────────────────────────────────
resource "docker_volume" "postgres_data" {
  name = "devopscorp-postgres-data"
}

# ── PostgreSQL ────────────────────────────────────────────────────────────────
resource "docker_container" "postgres" {
  name  = "devopscorp-postgres"
  image = "postgres:15-alpine"

  env = [
    "POSTGRES_DB=${var.postgres_db}",
    "POSTGRES_USER=${var.postgres_user}",
    "POSTGRES_PASSWORD=${var.postgres_password}",
  ]

  ports {
    internal = 5432
    external = 5432
  }

  volumes {
    volume_name    = docker_volume.postgres_data.name
    container_path = "/var/lib/postgresql/data"
  }

  networks_advanced {
    name = docker_network.devopscorp.name
  }

  healthcheck {
    test         = ["CMD-SHELL", "pg_isready -U ${var.postgres_user}"]
    interval     = "10s"
    timeout      = "5s"
    retries      = 5
    start_period = "10s"
  }

  restart = "unless-stopped"
}

# ── Product API ───────────────────────────────────────────────────────────────
resource "docker_container" "product_api" {
  name  = "devopscorp-product-api"
  image = "devopscorp/product-api:latest"

  env = [
    "DB_HOST=devopscorp-postgres",
    "DB_PORT=5432",
    "DB_NAME=${var.postgres_db}",
    "DB_USER=${var.postgres_user}",
    "DB_PASSWORD=${var.postgres_password}",
    "JWT_SECRET=${var.jwt_secret}",
  ]

  ports {
    internal = 5000
    external = var.product_api_port
  }

  networks_advanced {
    name = docker_network.devopscorp.name
  }

  depends_on = [docker_container.postgres]
  restart    = "unless-stopped"
}

# ── Auth API ──────────────────────────────────────────────────────────────────
resource "docker_container" "auth_api" {
  name  = "devopscorp-auth-api"
  image = "devopscorp/auth-api:latest"

  env = [
    "JWT_SECRET=${var.jwt_secret}",
    "DB_PATH=database/auth.db",
    "CORS_ORIGIN=http://localhost:${var.frontend_port}",
  ]

  ports {
    internal = 80
    external = var.auth_api_port
  }

  networks_advanced {
    name = docker_network.devopscorp.name
  }

  restart = "unless-stopped"
}

# ── Frontend ──────────────────────────────────────────────────────────────────
resource "docker_container" "frontend" {
  name  = "devopscorp-frontend"
  image = "devopscorp/frontend:latest"

  env = [
    "VITE_AUTH_API_URL=http://localhost:${var.auth_api_port}",
    "VITE_PRODUCT_API_URL=http://localhost:${var.product_api_port}",
  ]

  ports {
    internal = 80
    external = var.frontend_port
  }

  networks_advanced {
    name = docker_network.devopscorp.name
  }

  depends_on = [docker_container.auth_api, docker_container.product_api]
  restart    = "unless-stopped"
}
