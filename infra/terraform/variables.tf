# ===================================
# variables.tf — Paramètres de l'infra
# ===================================
# Modifiez terraform.tfvars (jamais committé) pour surcharger ces valeurs.

# ── Serveur ───────────────────────────────────────────────────────────────────

variable "server_host" {
  description = "Adresse IP ou hostname du serveur de déploiement"
  type        = string
  default     = "localhost"
}

variable "ssh_user" {
  description = "Utilisateur SSH pour se connecter au serveur"
  type        = string
  default     = "ubuntu"
}

variable "ssh_private_key_path" {
  description = "Chemin vers la clé SSH privée"
  type        = string
  default     = "~/.ssh/id_rsa"
}

# ── Application ───────────────────────────────────────────────────────────────

variable "app_dir" {
  description = "Répertoire de déploiement sur le serveur"
  type        = string
  default     = "/opt/devopscorp"
}

variable "jwt_secret" {
  description = "Clé secrète JWT — NE JAMAIS COMMITTER la vraie valeur"
  type        = string
  sensitive   = true
  default     = "change-me-in-production"
}

variable "postgres_db" {
  description = "Nom de la base de données PostgreSQL"
  type        = string
  default     = "devopscorp"
}

variable "postgres_user" {
  description = "Utilisateur PostgreSQL"
  type        = string
  default     = "devopscorp"
}

variable "postgres_password" {
  description = "Mot de passe PostgreSQL — NE JAMAIS COMMITTER la vraie valeur"
  type        = string
  sensitive   = true
  default     = "change-me-in-production"
}

# ── Réseau ────────────────────────────────────────────────────────────────────

variable "frontend_port" {
  description = "Port exposé pour le frontend"
  type        = number
  default     = 3000
}

variable "auth_api_port" {
  description = "Port exposé pour l'API Auth"
  type        = number
  default     = 8080
}

variable "product_api_port" {
  description = "Port exposé pour l'API Produits"
  type        = number
  default     = 5000
}
