# ===================================
# main.tf — Infrastructure DOCorps sur Render
# ===================================
# Provider : render-oss/render (~> 1.3)
# Déploie tous les services depuis les images GHCR buildées par la CI.
#
# Prérequis :
#   - Renseigner terraform.tfvars (voir terraform.tfvars.example)
#   - Les images Docker doivent être poussées sur GHCR avant terraform apply
#
# Usage :
#   terraform init
#   terraform plan
#   terraform apply

terraform {
  required_version = ">= 1.5.0"

  required_providers {
    render = {
      source  = "render-oss/render"
      version = "~> 1.3"
    }
  }
}

provider "render" {
  api_key  = var.render_api_key
  owner_id = var.render_owner_id
}

# ── URLs locales (utilisées entre services) ───────────────────────────────────

locals {
  auth_api_url    = "https://${var.service_prefix}-auth-api.onrender.com"
  product_api_url = "https://${var.service_prefix}-product-api.onrender.com"
  prometheus_url  = "https://${var.service_prefix}-prometheus.onrender.com"
  grafana_url     = "https://${var.service_prefix}-grafana.onrender.com"
  frontend_url    = "https://${var.service_prefix}-frontend.onrender.com"

  # Organisation GitHub — à adapter si le repo change de namespace
  ghcr_prefix = "ghcr.io/hugodemont62/docorps"
}

# ── Auth API (PHP / SQLite) ───────────────────────────────────────────────────

resource "render_web_service" "auth_api" {
  name   = "${var.service_prefix}-auth-api"
  plan   = "free"
  region = var.render_region

  runtime_source = {
    image = {
      image_url = "${local.ghcr_prefix}-auth-api:latest"
    }
  }

  env_vars = {
    JWT_SECRET  = { value = var.jwt_secret }
    DB_PATH     = { value = "database/auth.db" }
    CORS_ORIGIN = { value = local.frontend_url }
  }
}

# ── Product API (Python / FastAPI) ────────────────────────────────────────────

resource "render_web_service" "product_api" {
  name   = "${var.service_prefix}-product-api"
  plan   = "free"
  region = var.render_region

  runtime_source = {
    image = {
      image_url = "${local.ghcr_prefix}-product-api:latest"
    }
  }

  env_vars = {
    JWT_SECRET    = { value = var.jwt_secret }
    DATABASE_PATH = { value = ":memory:" }
  }
}

# ── Frontend (React / nginx) ──────────────────────────────────────────────────

resource "render_web_service" "frontend" {
  name   = "${var.service_prefix}-frontend"
  plan   = "free"
  region = var.render_region

  runtime_source = {
    image = {
      image_url = "${local.ghcr_prefix}-frontend:latest"
    }
  }

  env_vars = {
    VITE_AUTH_API_URL    = { value = local.auth_api_url }
    VITE_PRODUCT_API_URL = { value = local.product_api_url }
  }
}

# ── Prometheus ────────────────────────────────────────────────────────────────
# Image custom (Dockerfile.prometheus) avec prometheus-render.yml embarqué.
# Port 10000 hardcodé dans le CMD du Dockerfile (requis par Render).
# ⚠ Free tier : pas de disque persistant → données perdues au redémarrage.

resource "render_web_service" "prometheus" {
  name   = "${var.service_prefix}-prometheus"
  plan   = "free"
  region = var.render_region

  runtime_source = {
    image = {
      image_url = "${local.ghcr_prefix}-prometheus:latest"
    }
  }

  env_vars = {}
}

# ── Grafana ───────────────────────────────────────────────────────────────────
# Image custom (Dockerfile.grafana) avec provisioning datasource embarqué.
# PROMETHEUS_URL injecté via env var pour pointer vers Prometheus sur Render.

resource "render_web_service" "grafana" {
  name   = "${var.service_prefix}-grafana"
  plan   = "free"
  region = var.render_region

  runtime_source = {
    image = {
      image_url = "${local.ghcr_prefix}-grafana:latest"
    }
  }

  env_vars = {
    GF_SERVER_HTTP_PORT          = { value = "10000" }
    GF_SECURITY_ADMIN_PASSWORD   = { value = var.grafana_admin_password }
    GF_USERS_ALLOW_SIGN_UP       = { value = "false" }
    GF_AUTH_ANONYMOUS_ENABLED    = { value = "false" }
    PROMETHEUS_URL               = { value = local.prometheus_url }
  }
}
