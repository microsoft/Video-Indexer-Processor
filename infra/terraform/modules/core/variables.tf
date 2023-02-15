variable "name" {
  description = "(Inherited) The application name, used to name all resources."
  type        = string
}

variable "workload" {
  description = "The workload name, used to name resource group."
  type        = string
  default     = "core"
}

variable "environment" {
  description = "(Inherited) The environment name, used to name all resources."
  type        = string
}

variable "uid" {
  description = "(Generated) The unique identifier, used to name all resources."
  type        = string
}

variable "location" {
  description = "(Inherited) The location of all resources."
  type        = string
}

variable "azuread_app_instance" {
  description = "(Inherited) The authorization base endpoint."
  type        = string
}

variable "azuread_app_domain" {
  description = "(Inherited) The domain name."
  type        = string
}

variable "azuread_app_api_client_id" {
  description = "(Inherited) Application client id (api)."
  type        = string
}

variable "azuread_app_ui_client_id" {
  description = "(Inherited) Application client id (ui)"
  type        = string
}

variable "key_vault_sku" {
  description = "(Inherited) The sku which should be used for azure key vault."
  type        = string
}

variable "application_insights_type" {
  description = "The type of application insights to create."
  type        = string
  default     = "other"
}

variable "application_insights_retention_in_days" {
  description = "The retention period in days."
  type        = number
  default     = 90
}

variable "data_storage_account_tier" {
  description = "(Inherited) The tier to use for this storage account."
  type        = string
}

variable "data_storage_account_replication_type" {
  description = "(Inherited) The type of replication to use for this storage account."
  type        = string
}

variable "function_storage_account_tier" {
  description = "(Inherited) The tier to use for this storage account."
  type        = string
}

variable "function_storage_account_replication_type" {
  description = "(Inherited) The type of replication to use for this storage account."
  type        = string
}

variable "function_plan_os_type" {
  description = "The os type for the service plan (azure functions)."
  type        = string
  default     = "Linux"
}

variable "function_plan_sku" {
  description = "(Inherited) The sku for the service plan (azure functions)."
  type        = string
}

variable "function_plan_worker_count" {
  description = "(Inherited) The number of workers (instances) to be allocated."
  type        = number
}

variable "cosmosdb_offer_type" {
  description = "(Inherited) The offer type to use for this cosmos db account."
  type        = string
}

variable "cosmosdb_consistency_level" {
  description = "(Inherited) The consistency level to use for this cosmos db account."
  type        = string
}

variable "cosmosdb_database_name" {
  description = "(Inherited) Name of the Cosmos DB database."
  type        = string
}

variable "cosmosdb_insights_container_name" {
  description = "(Inherited) Name of the Cosmos DB container."
  type        = string
}

variable "cosmosdb_insights_partition_key" {
  description = "(Inherited) Name of the Cosmos DB Partition Key."
  type        = string
}

variable "search_sku" {
  description = "(Inherited) The sku which should be used for azure cognitive search."
  type        = string
}

variable "search_partition_count" {
  description = "(Inherited) The number of partitions created by azure cognitive search."
  type        = number
}

variable "search_replica_count" {
  description = "(Inherited) The number of replicas created by azure cognitive search."
  type        = number
}

variable "search_index_alias_videos" {
  description = "(Inherited) The cognitive search index alias (videos)."
  type        = string
}

variable "search_index_alias_scenes" {
  description = "(Inherited) The cognitive search index alias (scenes)."
  type        = string
}

variable "search_index_alias_shots" {
  description = "(Inherited) The cognitive search index alias (shots)."
  type        = string
}

variable "webapp_plan_os_type" {
  description = "The os type for the web application plan."
  type        = string
  default     = "Linux"
}

variable "webapp_plan_sku" {
  description = "(Inherited) The sku for the web application plan."
  type        = string
}

variable "webapp_plan_worker_count" {
  description = "(Inherited) The number of workers (instances) to be allocated."
  type        = number
}

variable "media_storage_account_tier" {
  description = "(Inherited) The tier to use for this storage account."
  type        = string
}

variable "media_storage_account_replication_type" {
  description = "(Inherited) The type of replication to use for this storage account."
  type        = string
}

variable "servicebus_sku" {
  description = "(Inherited) The sku for the service bus namespace."
  type        = string
}

variable "text_analytics_endpoint" {
  description = "(Inherited) The text analytics (cognitive services) endpoint."
  type        = string
}

variable "text_analytics_key" {
  description = "(Inherited) The text analytics (cognitive services) key."
  type        = string
}

variable "dashboard_url" {
  description = "(Inherited) The dashboard url."
  type        = string
}
