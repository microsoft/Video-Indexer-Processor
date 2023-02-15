#--------------------------------------------------------------
# General
#--------------------------------------------------------------

name        = "waldo"
environment = "dev"
location    = "eastus"

#--------------------------------------------------------------
# Core
#--------------------------------------------------------------
core_azuread_app_instance      = "https://login.microsoftonline.com/"
core_azuread_app_domain        = "waldosearch.onmicrosoft.com"
core_azuread_app_api_client_id = "c7d4d541-3f00-4441-a714-2030676d5013"
core_azuread_app_ui_client_id  = "3f1cc1bb-ff4c-481c-adb3-c9208ae6ca76"

core_key_vault_sku                             = "standard"
core_data_storage_account_tier                 = "Standard"
core_data_storage_account_replication_type     = "LRS"
core_function_storage_account_tier             = "Standard"
core_function_storage_account_replication_type = "LRS"
core_function_plan_sku                         = "S1"
core_function_plan_worker_count                = 1
core_cosmosdb_offer_type                       = "Standard"
core_cosmosdb_consistency_level                = "Strong"
core_cosmosdb_database_name                    = "waldo"
core_cosmosdb_insights_container_name          = "insights"
core_cosmosdb_insights_partition_key           = "/videoId"
core_search_sku                                = "basic"
core_search_partition_count                    = 1
core_search_replica_count                      = 1
core_search_index_alias_videos                 = "alias-waldo-videos"
core_search_index_alias_scenes                 = "alias-waldo-scenes"
core_search_index_alias_shots                  = "alias-waldo-shots"
core_webapp_plan_sku                           = "S1"
core_webapp_plan_worker_count                  = 1
core_media_storage_account_tier                = "Standard"
core_media_storage_account_replication_type    = "LRS"
core_servicebus_sku                            = "Basic"

#--------------------------------------------------------------
# Machine Learning
#--------------------------------------------------------------

ml_container_registry_sku             = "Basic"
ml_mlapi_plan_sku                     = "S1"
ml_mlapi_plan_worker_count            = 1
ml_mlstorage_account_tier             = "Standard"
ml_mlstorage_account_replication_type = "LRS"
ml_cognitive_text_analytics_sku       = "S"

#--------------------------------------------------------------
# Dashboard
#--------------------------------------------------------------

dashboard_enabled = true
