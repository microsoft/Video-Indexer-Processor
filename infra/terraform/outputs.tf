output "core_resource_group_name" {
  description = "The resource group name"
  value       = module.core.resource_group_name
}

output "core_key_vault_name" {
  description = "The key vault name."
  value       = module.core.key_vault_name
}

output "core_key_vault_url" {
  description = "The key vault url."
  value       = module.core.key_vault_url
}

output "core_function_trigger_url" {
  description = "The url associated with trigger function app."
  value       = module.core.function_trigger_url
}

output "core_function_extract_url" {
  description = "The url associated with extract function app."
  value       = module.core.function_extract_url
}

output "core_function_dataproc_url" {
  description = "The url associated with dataproc function app."
  value       = module.core.function_dataproc_url
}

output "core_function_trigger_name" {
  description = "The name associated with trigger function app."
  value       = module.core.function_trigger_name
}

output "core_function_extract_name" {
  description = "The name associated with extract function app."
  value       = module.core.function_extract_name
}

output "core_function_dataproc_name" {
  description = "The name associated with dataproc function app."
  value       = module.core.function_dataproc_name
}

output "core_webapi_url" {
  description = "The url associated with webapi app."
  value       = module.core.webapi_url
}

output "core_webapi_name" {
  description = "The name associated with webapi app."
  value       = module.core.webapi_name
}

output "core_webui_url" {
  description = "The url associated with webui app."
  value       = module.core.webui_url
}

output "core_webui_name" {
  description = "The name associated with webui app."
  value       = module.core.webui_name
}

output "core_azuread_tenant_id" {
  description = "Tenant id."
  value       = module.core.azuread_tenant_id
}

output "core_azuread_app_api_client_id" {
  description = "Application client id (api)."
  value       = module.core.azuread_app_api_client_id
}

output "core_azuread_app_ui_client_id" {
  description = "Application client id (ui)."
  value       = module.core.azuread_app_ui_client_id
}

output "core_azuread_app_scopes" {
  description = "Scopes used for user authentication (ui)."
  value       = module.core.azuread_app_scopes
}

output "core_azuread_app_graph_scopes" {
  description = "Scopes used for graph authentication (ui)."
  value       = module.core.azuread_app_graph_scopes
}

output "core_appinsights_instrumentation_key" {
  description = "App Insights instumentation key."
  value       = module.core.appinsights_instrumentation_key
  sensitive   = true
}

output "core_data_storage_endpoint" {
  description = "Data Storage Endpoint"
  value       = module.core.data_storage_endpoint
}

output "core_service_bus_namespace" {
  description = "Service Bus Namespace"
  value       = module.core.service_bus_namespace
}

output "core_silver_container" {
  description = "Silver Container Name"
  value       = module.core.silver_container
}

output "core_bronze_container" {
  description = "Bronze Container Name"
  value       = module.core.bronze_container
}

output "core_upload_container" {
  description = "Upload Container Name"
  value       = module.core.upload_container
}

output "core_service_bus_extract_queue" {
  description = "Service Bus Extract Queue"
  value       = module.core.service_bus_extract_queue
}

output "core_service_bus_dataproc_queue" {
  description = "Service Bus DataProc Queue"
  value       = module.core.service_bus_dataproc_queue
}

output "core_cosmosdb_endpoint" {
  description = "Cosmos DB Endpoint"
  value       = module.core.cosmosdb_endpoint
}

output "core_cosmosdb_database" {
  description = "Cosmos DB Database"
  value       = module.core.cosmosdb_database_name
}

output "core_cosmosdb_container_insights" {
  description = "Cosmos DB Container for Insights"
  value       = module.core.cosmosdb_container_insights_name
}

output "core_search_service_url" {
  description = "The cognitive search url."
  value       = module.core.search_service_url
}

output "core_search_index_alias_videos" {
  description = "The cognitive search index alias (videos)."
  value       = module.core.search_index_alias_videos
}

output "core_search_index_alias_scenes" {
  description = "The cognitive search index alias (scenes)."
  value       = module.core.search_index_alias_scenes
}

output "core_search_index_alias_shots" {
  description = "The cognitive search index alias (shots)."
  value       = module.core.search_index_alias_shots
}
