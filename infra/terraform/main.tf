terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "=3.15.1"
    }
  }
}

# START - NEED TO BE COMMENTED IF YOU WORK WITH A LOCAL STATE
terraform {
  backend "azurerm" {}
}
# END

provider "azurerm" {
  features {}
}

resource "random_string" "random" {
  length      = 4
  numeric     = true
  lower       = true
  upper       = false
  special     = false
  min_numeric = 1
}

module "core" {
  source                                    = "./modules/core"
  name                                      = var.name
  environment                               = var.environment
  uid                                       = random_string.random.id
  location                                  = var.location
  azuread_app_instance                      = var.core_azuread_app_instance
  azuread_app_domain                        = var.core_azuread_app_domain
  azuread_app_api_client_id                 = var.core_azuread_app_api_client_id
  azuread_app_ui_client_id                  = var.core_azuread_app_ui_client_id
  key_vault_sku                             = var.core_key_vault_sku
  data_storage_account_tier                 = var.core_data_storage_account_tier
  data_storage_account_replication_type     = var.core_data_storage_account_replication_type
  function_storage_account_tier             = var.core_function_storage_account_tier
  function_storage_account_replication_type = var.core_function_storage_account_replication_type
  function_plan_sku                         = var.core_function_plan_sku
  function_plan_worker_count                = var.core_function_plan_worker_count
  cosmosdb_offer_type                       = var.core_cosmosdb_offer_type
  cosmosdb_consistency_level                = var.core_cosmosdb_consistency_level
  cosmosdb_database_name                    = var.core_cosmosdb_database_name
  cosmosdb_insights_container_name          = var.core_cosmosdb_insights_container_name
  cosmosdb_insights_partition_key           = var.core_cosmosdb_insights_partition_key
  search_sku                                = var.core_search_sku
  search_partition_count                    = var.core_search_partition_count
  search_replica_count                      = var.core_search_replica_count
  search_index_alias_videos                 = var.core_search_index_alias_videos
  search_index_alias_scenes                 = var.core_search_index_alias_scenes
  search_index_alias_shots                  = var.core_search_index_alias_shots
  webapp_plan_sku                           = var.core_webapp_plan_sku
  webapp_plan_worker_count                  = var.core_webapp_plan_worker_count
  media_storage_account_tier                = var.core_media_storage_account_tier
  media_storage_account_replication_type    = var.core_media_storage_account_replication_type
  servicebus_sku                            = var.core_servicebus_sku
  text_analytics_endpoint                   = module.ml.text_analytics_endpoint
  text_analytics_key                        = module.ml.text_analytics_key
  dashboard_url                             = var.dashboard_enabled ? module.dashboard[0].dashboard_url : ""
}

module "ml" {
  source                             = "./modules/ml"
  name                               = var.name
  environment                        = var.environment
  uid                                = random_string.random.id
  location                           = var.location
  application_insights_id            = module.core.application_insights_id
  key_vault_id                       = module.core.key_vault_id
  container_registry_sku             = var.ml_container_registry_sku
  mlapi_plan_sku                     = var.ml_mlapi_plan_sku
  mlapi_plan_worker_count            = var.ml_mlapi_plan_worker_count
  mlstorage_account_tier             = var.ml_mlstorage_account_tier
  mlstorage_account_replication_type = var.ml_mlstorage_account_replication_type
  cognitive_text_analytics_sku       = var.ml_cognitive_text_analytics_sku
}

module "dashboard" {
  count                   = var.dashboard_enabled == true ? 1 : 0
  source                  = "./modules/dashboard"
  name                    = var.name
  environment             = var.environment
  uid                     = random_string.random.id
  location                = var.location
  azuread_app_domain      = var.core_azuread_app_domain
  application_insights_id = module.core.application_insights_id
}
