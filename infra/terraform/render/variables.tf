# ===================================
# variables.tf — Paramètres Render
# ===================================
# Copiez terraform.tfvars.example → terraform.tfvars et renseignez vos valeurs.
# Ne commitez JAMAIS terraform.tfvars.

variable "render_api_key" {
  description = "Clé API Render (Account Settings → API Keys)"
  type        = string
  sensitive   = true
}

variable "render_owner_id" {
  description = "ID du owner Render — usr-xxxx (Account Settings → Profile)"
  type        = string
}

# ── Secrets applicatifs ───────────────────────────────────────────────────────

variable "jwt_secret" {
  description = "Clé secrète JWT partagée entre auth-api et product-api"
  type        = string
  sensitive   = true
}

variable "grafana_admin_password" {
  description = "Mot de passe admin Grafana"
  type        = string
  sensitive   = true
  default     = "change-me-in-production"
}

# ── Noms des services Render (slugs dans les URLs .onrender.com) ──────────────

variable "service_prefix" {
  description = "Préfixe commun pour tous les services Render"
  type        = string
  default     = "docorps"
}

# ── Région Render ─────────────────────────────────────────────────────────────

variable "render_region" {
  description = "Région Render : oregon | frankfurt | singapore | ohio | virginia"
  type        = string
  default     = "frankfurt"
}
