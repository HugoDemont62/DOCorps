# ===================================
# outputs.tf — URLs des services Render
# ===================================

output "frontend_url" {
  description = "URL publique du frontend React"
  value       = "https://${var.service_prefix}-frontend.onrender.com"
}

output "auth_api_url" {
  description = "URL publique de l'API Auth (PHP)"
  value       = "https://${var.service_prefix}-auth-api.onrender.com"
}

output "product_api_url" {
  description = "URL publique de l'API Produits (Python)"
  value       = "https://${var.service_prefix}-product-api.onrender.com"
}

output "prometheus_url" {
  description = "URL publique de Prometheus"
  value       = "https://${var.service_prefix}-prometheus.onrender.com"
}

output "grafana_url" {
  description = "URL publique de Grafana (login : admin / grafana_admin_password)"
  value       = "https://${var.service_prefix}-grafana.onrender.com"
}
