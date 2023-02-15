output "resource_group_name" {
  description = "The resource group name"
  value       = azurerm_resource_group.rg.name
}

output "text_analytics_endpoint" {
  description = "The text analytics (cognitive services) endpoint."
  value       = azurerm_cognitive_account.cognitive_text_analytics.endpoint
}

output "text_analytics_key" {
  description = "The text analytics (cognitive services) key."
  value       = azurerm_cognitive_account.cognitive_text_analytics.primary_access_key
}
