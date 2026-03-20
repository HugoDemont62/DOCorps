# ===================================
# outputs.tf — Sorties Terraform
# ===================================
# Ces valeurs sont affichées après terraform apply.
# Utile pour récupérer les URLs sans chercher dans la config.

output "frontend_url" {
  description = "URL du frontend React"
  value       = "http://${var.server_host}:${var.frontend_port}"
}

output "auth_api_url" {
  description = "URL de l'API d'authentification"
  value       = "http://${var.server_host}:${var.auth_api_port}"
}

output "product_api_url" {
  description = "URL de l'API Produits"
  value       = "http://${var.server_host}:${var.product_api_port}"
}

output "network_name" {
  description = "Nom du réseau Docker interne"
  value       = docker_network.devopscorp.name
}
