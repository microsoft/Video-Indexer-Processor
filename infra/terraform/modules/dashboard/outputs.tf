output "dashboard_url" {
  description = "The dashboard url."
  value       = "https://portal.azure.com/#@${var.azuread_app_domain}/dashboard/arm${azurerm_portal_dashboard.dashboard.id}"
}

