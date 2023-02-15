variable "name" {
  description = "The application name, used to name all resources."
  type        = string
}

variable "environment" {
  description = "The environment name, used to name all resources."
  type        = string

  validation {
    condition     = contains(["dev", "stg", "int"], var.environment)
    error_message = "Invalid input for \"environment\", options: \"dev\", \"stg\", \"int\"."
  }
}

variable "location" {
  description = "The location of all resources."
  type        = string
}

variable "core_azuread_app_instance" {
  description = "The authorization base endpoint."
  type        = string
}

variable "core_azuread_app_domain" {
  description = "The domain name."
  type        = string
}

variable "core_azuread_app_api_client_id" {
  description = "Application client id (api)."
  type        = string
}

variable "core_azuread_app_ui_client_id" {
  description = "Application client id (ui)"
  type        = string
}

variable "core_key_vault_sku" {
  description = "The sku which should be used for azure key vault."
  type        = string

  validation {
    condition     = contains(["standard", "premium"], var.core_key_vault_sku)
    error_message = "Invalid input for \"core_key_vault_sku\", options: \"standard\", \"premium\"."
  }
}

variable "core_data_storage_account_tier" {
  description = "The tier to use for this storage account."
  type        = string

  validation {
    condition     = contains(["Standard", "Premium"], var.core_data_storage_account_tier)
    error_message = "Invalid input for \"core_data_storage_account_tier\", options: \"Standard\", \"Premium\"."
  }
}

variable "core_data_storage_account_replication_type" {
  description = "The type of replication to use for this storage account."
  type        = string

  validation {
    condition     = contains(["LRS", "GRS", "RAGRS", "ZRS", "GZRS", "RAGZRS"], var.core_data_storage_account_replication_type)
    error_message = "Invalid input for \"core_data_storage_account_replication_type\", options: \"LRS\", \"GRS\", \"RAGRS\", \"ZRS\", \"GZRS\", \"RAGZRS\"."
  }
}

variable "core_function_storage_account_tier" {
  description = "The tier to use for this storage account."
  type        = string

  validation {
    condition     = contains(["Standard", "Premium"], var.core_function_storage_account_tier)
    error_message = "Invalid input for \"core_function_storage_account_tier\", options: \"Standard\", \"Premium\"."
  }
}

variable "core_function_storage_account_replication_type" {
  description = "The type of replication to use for this storage account."
  type        = string

  validation {
    condition     = contains(["LRS", "GRS", "RAGRS", "ZRS", "GZRS", "RAGZRS"], var.core_function_storage_account_replication_type)
    error_message = "Invalid input for \"core_function_storage_account_replication_type\", options: \"LRS\", \"GRS\", \"RAGRS\", \"ZRS\", \"GZRS\", \"RAGZRS\"."
  }
}

variable "core_function_plan_sku" {
  description = "The sku for the service plan (azure functions)."
  type        = string

  validation {
    condition     = contains(["B1", "B2", "B3", "S1", "S2", "S3", "P1v2", "P2v2", "P3v2", "P1v3", "P2v3", "P3v3"], var.core_function_plan_sku)
    error_message = "Invalid input for \"core_function_plan_sku\", options: \"B1\", \"B2\", \"B3\", \"S1\", \"S2\", \"S3\", \"P1v2\", \"P2v2\", \"P3v2\", \"P1v3\", \"P2v3\", \"P3v3\"."
  }
}

variable "core_function_plan_worker_count" {
  description = "The number of workers (instances) to be allocated."
  type        = number
}

variable "core_cosmosdb_offer_type" {
  description = "The offer type to use for this cosmos db account."
  type        = string

  validation {
    condition     = contains(["Standard"], var.core_cosmosdb_offer_type)
    error_message = "Invalid input for \"core_cosmosdb_offer_type\", options: \"Standard\"."
  }
}

variable "core_cosmosdb_consistency_level" {
  description = "The consistency level to use for this cosmos db account."
  type        = string

  validation {
    condition     = contains(["Strong", "BoundedStaleness", "Session", "ConsistentPrefix", "Eventual"], var.core_cosmosdb_consistency_level)
    error_message = "Invalid input for \"core_cosmosdb_consistency_level\", options: \"Standard\", \"BoundedStaleness\", \"Session\", \"ConsistentPrefix\", \"Eventual\"."
  }
}

variable "core_cosmosdb_database_name" {
  description = "The name of the cosmos db database."
  type        = string
}

variable "core_cosmosdb_insights_container_name" {
  description = "The name of the cosmos db container."
  type        = string
}

variable "core_cosmosdb_insights_partition_key" {
  description = "The cosmos db partition key."
  type        = string
}

variable "core_search_sku" {
  description = "The sku which should be used for azure cognitive search."
  type        = string

  validation {
    condition     = contains(["free", "basic", "standard", "standard2", "standard3", "storage_optimized_l1", "storage_optimized_l2"], var.core_search_sku)
    error_message = "Invalid input for \"core_search_sku\", options: \"free\", \"basic\", \"standard\", \"standard2\", \"standard3\", \"storage_optimized_l1\", \"storage_optimized_l2\"."
  }
}

variable "core_search_partition_count" {
  description = "The number of partitions created by azure cognitive search."
  type        = number
}

variable "core_search_replica_count" {
  description = "The number of replicas created by azure cognitive search."
  type        = number
}

variable "core_search_index_alias_videos" {
  description = "The cognitive search index alias (videos)."
  type        = string
}

variable "core_search_index_alias_scenes" {
  description = "The cognitive search index alias (scenes)."
  type        = string
}

variable "core_search_index_alias_shots" {
  description = "The cognitive search index alias (shots)."
  type        = string
}

variable "core_webapp_plan_sku" {
  description = "The sku for the web application plan."
  type        = string

  validation {
    condition     = contains(["B1", "B2", "B3", "S1", "S2", "S3", "P1v2", "P2v2", "P3v2", "P1v3", "P2v3", "P3v3"], var.core_webapp_plan_sku)
    error_message = "Invalid input for \"core_webapp_plan_sku\", options: \"B1\", \"B2\", \"B3\", \"S1\", \"S2\", \"S3\", \"P1v2\", \"P2v2\", \"P3v2\", \"P1v3\", \"P2v3\", \"P3v3\"."
  }
}

variable "core_webapp_plan_worker_count" {
  description = "The number of workers (instances) to be allocated."
  type        = number
}

variable "core_media_storage_account_tier" {
  description = "The tier to use for this storage account."
  type        = string

  validation {
    condition     = contains(["Standard", "Premium"], var.core_media_storage_account_tier)
    error_message = "Invalid input for \"data_storage_media_account_tier\", options: \"Standard\", \"Premium\"."
  }
}

variable "core_media_storage_account_replication_type" {
  description = "The type of replication to use for this storage account."
  type        = string

  validation {
    condition     = contains(["LRS", "GRS", "RAGRS", "ZRS", "GZRS", "RAGZRS"], var.core_media_storage_account_replication_type)
    error_message = "Invalid input for \"data_storage_media_account_replication_type\", options: \"LRS\", \"GRS\", \"RAGRS\", \"ZRS\", \"GZRS\", \"RAGZRS\"."
  }
}

variable "core_servicebus_sku" {
  description = "The sku for the service bus namespace."
  type        = string

  validation {
    condition     = contains(["Basic", "Standard", "Premium"], var.core_servicebus_sku)
    error_message = "Invalid input for \"core_servicebus_sku\", options: \"Basic\", \"Standard\", \"Premium\"."
  }
}

variable "ml_container_registry_sku" {
  description = "The sku name of the container registry."
  type        = string

  validation {
    condition     = contains(["Basic", "Standard", "Premium"], var.ml_container_registry_sku)
    error_message = "Invalid input for \"ml_container_registry_sku\", options: \"Basic\", \"Standard\", \"Premium\"."
  }
}

variable "ml_mlapi_plan_sku" {
  description = "The sku for the web application plan."
  type        = string

  validation {
    condition     = contains(["B1", "B2", "B3", "S1", "S2", "S3", "P1v2", "P2v2", "P3v2", "P1v3", "P2v3", "P3v3"], var.ml_mlapi_plan_sku)
    error_message = "Invalid input for \"ml_mlapi_plan_sku\", options: \"B1\", \"B2\", \"B3\", \"S1\", \"S2\", \"S3\", \"P1v2\", \"P2v2\", \"P3v2\", \"P1v3\", \"P2v3\", \"P3v3\"."
  }
}

variable "ml_mlapi_plan_worker_count" {
  description = "The number of workers (instances) to be allocated."
  type        = number
}

variable "ml_mlstorage_account_tier" {
  description = "The tier to use for this storage account."
  type        = string

  validation {
    condition     = contains(["Standard", "Premium"], var.ml_mlstorage_account_tier)
    error_message = "Invalid input for \"ml_mlstorage_account_tier\", options: \"Standard\", \"Premium\"."
  }
}

variable "ml_mlstorage_account_replication_type" {
  description = "The type of replication to use for this storage account."
  type        = string

  validation {
    condition     = contains(["LRS", "GRS", "RAGRS", "ZRS", "GZRS", "RAGZRS"], var.ml_mlstorage_account_replication_type)
    error_message = "Invalid input for \"ml_mlstorage_account_replication_type\", options: \"LRS\", \"GRS\", \"RAGRS\", \"ZRS\", \"GZRS\", \"RAGZRS\"."
  }
}

variable "ml_cognitive_text_analytics_sku" {
  description = "The sku name for text analytics service account."
  type        = string

  validation {
    condition     = contains(["F0", "S"], var.ml_cognitive_text_analytics_sku)
    error_message = "Invalid input for \"ml_cognitive_text_analytics_sku\", options: \"F0\", \"S\"."
  }
}

variable "dashboard_enabled" {
  description = "If true, install the dashboard module (used to get search kpis)."
  type        = bool
}