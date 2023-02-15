output "resource_group_name" {
  description = "The resource group name"
  value       = azurerm_resource_group.rg.name
}

output "application_insights_id" {
  description = "The application insights resource id."
  value       = azurerm_application_insights.appinsights.id
}

output "key_vault_id" {
  description = "The key vault resource id."
  value       = azurerm_key_vault.kv.id
}

output "key_vault_name" {
  description = "The key vault name."
  value       = azurerm_key_vault.kv.name
}

output "key_vault_url" {
  description = "The key vault url."
  value       = azurerm_key_vault.kv.vault_uri
}

output "function_trigger_url" {
  description = "The url associated with trigger function app."
  value       = "https://${azurerm_linux_function_app.function_trigger.name}.azurewebsites.net"
}

output "function_trigger_name" {
  description = "The name associated with trigger function app."
  value       = azurerm_linux_function_app.function_trigger.name
}

output "function_extract_url" {
  description = "The url associated with extract function app."
  value       = "https://${azurerm_linux_function_app.function_extract.name}.azurewebsites.net"
}

output "function_extract_name" {
  description = "The name associated with extract function app."
  value       = azurerm_linux_function_app.function_extract.name
}

output "function_dataproc_url" {
  description = "The url associated with dataproc function app."
  value       = "https://${azurerm_linux_function_app.function_dataproc.name}.azurewebsites.net"
}

output "function_dataproc_name" {
  description = "The name associated with dataproc function app."
  value       = azurerm_linux_function_app.function_dataproc.name
}

output "webapi_url" {
  description = "The url associated with webapi app."
  value       = "https://${azurerm_linux_web_app.webapi.default_hostname}"
}

output "webapi_name" {
  description = "The name associated with webapi app."
  value       = azurerm_linux_web_app.webapi.name
}

output "webui_url" {
  description = "The url associated with webui app."
  value       = "https://${azurerm_linux_web_app.webui.default_hostname}"
}

output "webui_name" {
  description = "The name associated with webui app."
  value       = azurerm_linux_web_app.webui.name
}

output "azuread_tenant_id" {
  description = "Tenant id."
  value       = data.azuread_client_config.current.tenant_id
}

output "azuread_app_api_client_id" {
  description = "Application client id (api)."
  value       = var.azuread_app_api_client_id
}

output "azuread_app_ui_client_id" {
  description = "Application client id (ui)."
  value       = var.azuread_app_ui_client_id
}

output "azuread_app_scopes" {
  description = "Scopes used for user authentication (ui)."
  value       = "api://${var.azuread_app_api_client_id}/User.Impersonation"
}

output "azuread_app_graph_scopes" {
  description = "Scopes used for graph authentication (ui)."
  value       = "user.read,openid,profile,people.read,user.readbasic.all"
}

output "appinsights_instrumentation_key" {
  description = "App Insights instumentation key."
  value       = azurerm_application_insights.appinsights.instrumentation_key
  sensitive   = true
}

output "data_storage_endpoint" {
  description = "Data Storage Endpoint"
  value       = azurerm_storage_account.data_storage.primary_blob_endpoint
}

output "service_bus_namespace" {
  description = "Service Bus Namespace"
  value       = "${azurerm_servicebus_namespace.servicebus.name}.servicebus.windows.net"
}

output "silver_container" {
  description = "Silver Container Name"
  value       = azurerm_storage_container.silver_container.name
}

output "bronze_container" {
  description = "Bronze Container Name"
  value       = azurerm_storage_container.bronze_container.name
}

output "upload_container" {
  description = "Upload Container Name"
  value       = azurerm_storage_container.upload_container.name
}

output "service_bus_extract_queue" {
  description = "Service Bus Extract Queue"
  value       = azurerm_servicebus_queue.extract_queue.name
}

output "service_bus_dataproc_queue" {
  description = "Service Bus DataProc Queue"
  value       = azurerm_servicebus_queue.dataproc_queue.name
}

output "cosmosdb_endpoint" {
  description = "Cosmos DB Endpoint"
  value       = "https://${azurerm_cosmosdb_account.cosmosdb.name}.documents.azure.com"
}

output "cosmosdb_database_name" {
  description = "Cosmos DB Database"
  value       = var.cosmosdb_database_name
}

output "cosmosdb_container_insights_name" {
  description = "Cosmos DB Container for Insights"
  value       = var.cosmosdb_insights_container_name
}

output "search_service_url" {
  description = "The cognitive search url."
  value       = "https://${azurerm_search_service.search.name}.search.windows.net"
}

output "search_index_alias_videos" {
  description = "The cognitive search index alias (videos)."
  value       = var.search_index_alias_videos
}

output "search_index_alias_scenes" {
  description = "The cognitive search index alias (scenes)."
  value       = var.search_index_alias_scenes
}

output "search_index_alias_shots" {
  description = "The cognitive search index alias (shots)."
  value       = var.search_index_alias_shots
}
