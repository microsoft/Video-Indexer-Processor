terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "=3.15.1"
    }
  }
}

locals {
  resource_version         = "${var.environment}-${var.uid}"
  resource_version_compact = "${var.environment}${var.uid}"
  arm_vi_file_path         = "../arm/vi.template.json"
  required_tags = {
    name        = var.name
    environment = var.environment
    uid         = var.uid
    workload    = var.workload
  }
}

#--------------------------------------------------------------
# Fundamentals
#--------------------------------------------------------------

# create resource group
resource "azurerm_resource_group" "rg" {
  name     = "rg-${var.name}-${local.resource_version}-${var.workload}"
  location = var.location
  tags     = local.required_tags
}

# create azure key vault
resource "azurerm_key_vault" "kv" {
  name                = "keyvault-${local.resource_version}"
  resource_group_name = azurerm_resource_group.rg.name
  location            = azurerm_resource_group.rg.location
  tenant_id           = data.azuread_client_config.current.tenant_id
  sku_name            = var.key_vault_sku
  tags                = local.required_tags

  access_policy {
    tenant_id = data.azuread_client_config.current.tenant_id
    object_id = data.azuread_client_config.current.object_id

    secret_permissions = [
      "Get",
      "Set",
      "List",
      "Delete",
      "Purge"
    ]
  }

  lifecycle {
    ignore_changes = [access_policy]
  }
}

resource "azurerm_key_vault_access_policy" "webapi_policy" {
  key_vault_id = azurerm_key_vault.kv.id
  tenant_id    = data.azuread_client_config.current.tenant_id
  object_id    = azurerm_linux_web_app.webapi.identity[0].principal_id

  secret_permissions = [
    "Get",
    "List",
  ]
}

# create application insights
resource "azurerm_application_insights" "appinsights" {
  name                = "appinsights-${local.resource_version}"
  resource_group_name = azurerm_resource_group.rg.name
  location            = azurerm_resource_group.rg.location
  application_type    = var.application_insights_type
  tags                = local.required_tags
}

#--------------------------------------------------------------
# Main Storage (Data)
#--------------------------------------------------------------

# create storage account
resource "azurerm_storage_account" "data_storage" {
  name                             = "datastorage${local.resource_version_compact}"
  resource_group_name              = azurerm_resource_group.rg.name
  location                         = azurerm_resource_group.rg.location
  account_tier                     = var.data_storage_account_tier
  account_replication_type         = var.data_storage_account_replication_type
  enable_https_traffic_only        = true
  cross_tenant_replication_enabled = false
  tags                             = local.required_tags
}

resource "azurerm_storage_container" "bronze_container" {
  name                  = "bronze"
  storage_account_name  = azurerm_storage_account.data_storage.name
  container_access_type = "private"
}

resource "azurerm_storage_container" "silver_container" {
  name                  = "silver"
  storage_account_name  = azurerm_storage_account.data_storage.name
  container_access_type = "private"
}

resource "azurerm_storage_container" "upload_container" {
  name                  = "upload"
  storage_account_name  = azurerm_storage_account.data_storage.name
  container_access_type = "private"
}

#--------------------------------------------------------------
# Azure Functions
#--------------------------------------------------------------

# create storage account
resource "azurerm_storage_account" "function_storage" {
  name                             = "functionstorage${local.resource_version_compact}"
  resource_group_name              = azurerm_resource_group.rg.name
  location                         = azurerm_resource_group.rg.location
  account_tier                     = var.function_storage_account_tier
  account_replication_type         = var.function_storage_account_replication_type
  enable_https_traffic_only        = true
  cross_tenant_replication_enabled = false
  tags                             = local.required_tags
}

# create service plan
resource "azurerm_service_plan" "function_plan" {
  name                = "functionplan-${local.resource_version}"
  resource_group_name = azurerm_resource_group.rg.name
  location            = azurerm_resource_group.rg.location
  os_type             = var.function_plan_os_type
  sku_name            = var.function_plan_sku
  worker_count        = var.function_plan_worker_count
  tags                = local.required_tags
}

# create function app
resource "azurerm_linux_function_app" "function_trigger" {
  name                          = "functrigger-${local.resource_version}"
  resource_group_name           = azurerm_resource_group.rg.name
  location                      = azurerm_resource_group.rg.location
  service_plan_id               = azurerm_service_plan.function_plan.id
  storage_account_name          = azurerm_storage_account.function_storage.name
  storage_uses_managed_identity = true
  https_only                    = true
  tags                          = local.required_tags

  app_settings = {
    "DataStorage__blobServiceUri"         = azurerm_storage_account.data_storage.primary_blob_endpoint
    "DataStorage__queueServiceUri"        = azurerm_storage_account.data_storage.primary_queue_endpoint
    "ServiceBus__fullyQualifiedNamespace" = "${azurerm_servicebus_namespace.servicebus.name}.servicebus.windows.net"
    "SERVICEBUS_QUEUE_EXTRACT_NAME"       = azurerm_servicebus_queue.extract_queue.name
    "UploadStorage__blobServiceUri"       = azurerm_storage_account.data_storage.primary_blob_endpoint
    "UploadStorage__queueServiceUri"      = azurerm_storage_account.data_storage.primary_queue_endpoint
    "SILVER_CONTAINER"                    = azurerm_storage_container.silver_container.name
    "BRONZE_CONTAINER"                    = azurerm_storage_container.bronze_container.name
    "UPLOAD_CONTAINER"                    = azurerm_storage_container.upload_container.name
    "LOG_PREFIX"                          = "[${var.name}]"
    "PYTHON_ISOLATE_WORKER_DEPENDENCIES"  = 1
  }

  site_config {
    always_on                              = true
    application_insights_connection_string = azurerm_application_insights.appinsights.connection_string

    application_stack {
      python_version = "3.9"
    }
  }

  identity {
    type = "SystemAssigned"
  }

  lifecycle {
    ignore_changes = [
      # prevent TF reporting configuration drift after app code is deployed
      app_settings["WEBSITE_RUN_FROM_PACKAGE"],
      app_settings["WEBSITE_ENABLE_SYNC_UPDATE_SITE"],
      app_settings["WEBSITES_ENABLE_APP_SERVICE_STORAGE"],
    ]
  }
}

# create function app
resource "azurerm_linux_function_app" "function_extract" {
  name                          = "funcextract-${local.resource_version}"
  resource_group_name           = azurerm_resource_group.rg.name
  location                      = azurerm_resource_group.rg.location
  service_plan_id               = azurerm_service_plan.function_plan.id
  storage_account_name          = azurerm_storage_account.function_storage.name
  storage_uses_managed_identity = true
  https_only                    = true
  tags                          = local.required_tags

  app_settings = {
    "DataStorage__blobServiceUri"         = azurerm_storage_account.data_storage.primary_blob_endpoint
    "DataStorage__queueServiceUri"        = azurerm_storage_account.data_storage.primary_queue_endpoint
    "ServiceBus__fullyQualifiedNamespace" = "${azurerm_servicebus_namespace.servicebus.name}.servicebus.windows.net"
    "SERVICEBUS_QUEUE_EXTRACT_NAME"       = azurerm_servicebus_queue.extract_queue.name
    "SERVICEBUS_QUEUE_DATAPROC_NAME"      = azurerm_servicebus_queue.dataproc_queue.name
    "LOG_PREFIX"                          = "[${var.name}]"

    "VideoIndexerOptions__AccountName"     = jsondecode(azurerm_resource_group_template_deployment.video_indexer.output_content).accountName.value
    "VideoIndexerOptions__AccountId"       = jsondecode(azurerm_resource_group_template_deployment.video_indexer.output_content).accountId.value
    "VideoIndexerOptions__AccountLocation" = jsondecode(azurerm_resource_group_template_deployment.video_indexer.output_content).location.value
    "VideoIndexerOptions__ResourceGroup"   = jsondecode(azurerm_resource_group_template_deployment.video_indexer.output_content).resourceGroup.value
    "VideoIndexerOptions__SubscriptionId"  = jsondecode(azurerm_resource_group_template_deployment.video_indexer.output_content).subscriptionId.value

    "InsightsExtractionOptions__DataStorageUri"      = "https://${azurerm_storage_account.data_storage.name}.blob.core.windows.net/"
    "InsightsExtractionOptions__BronzeContainerName" = azurerm_storage_container.bronze_container.name
    "InsightsExtractionOptions__SilverContainerName" = azurerm_storage_container.silver_container.name
  }

  site_config {
    always_on                              = true
    application_insights_connection_string = azurerm_application_insights.appinsights.connection_string

    application_stack {
      dotnet_version              = "6.0"
      use_dotnet_isolated_runtime = false
    }
  }

  identity {
    type = "SystemAssigned"
  }
}

# create function app
resource "azurerm_linux_function_app" "function_dataproc" {
  name                          = "funcdataproc-${local.resource_version}"
  resource_group_name           = azurerm_resource_group.rg.name
  location                      = azurerm_resource_group.rg.location
  service_plan_id               = azurerm_service_plan.function_plan.id
  storage_account_name          = azurerm_storage_account.function_storage.name
  storage_uses_managed_identity = true
  https_only                    = true
  tags                          = local.required_tags

  app_settings = {
    "DataStorage__blobServiceUri"         = azurerm_storage_account.data_storage.primary_blob_endpoint
    "DataStorage__queueServiceUri"        = azurerm_storage_account.data_storage.primary_queue_endpoint
    "ServiceBus__fullyQualifiedNamespace" = "${azurerm_servicebus_namespace.servicebus.name}.servicebus.windows.net"
    "SERVICEBUS_QUEUE_DATAPROC_NAME"      = azurerm_servicebus_queue.dataproc_queue.name
    "AzureCosmosDB__accountEndpoint"      = "https://${azurerm_cosmosdb_account.cosmosdb.name}.documents.azure.com"
    "COSMOSDB_DATABASE"                   = var.cosmosdb_database_name
    "COSMOSDB_CONTAINER_INSIGHTS"         = var.cosmosdb_insights_container_name
    "TEXTANALYTICS_ENDPOINT"              = var.text_analytics_endpoint
    "TEXTANALYTICS_KEY"                   = var.text_analytics_key
    "LOG_PREFIX"                          = "[${var.name}]"
    "PYTHON_ISOLATE_WORKER_DEPENDENCIES"  = 1
  }

  site_config {
    always_on                              = true
    application_insights_connection_string = azurerm_application_insights.appinsights.connection_string

    application_stack {
      python_version = "3.9"
    }
  }

  identity {
    type = "SystemAssigned"
  }

  lifecycle {
    ignore_changes = [
      # prevent TF reporting configuration drift after app code is deployed
      app_settings["WEBSITE_RUN_FROM_PACKAGE"],
      app_settings["WEBSITE_ENABLE_SYNC_UPDATE_SITE"],
      app_settings["WEBSITES_ENABLE_APP_SERVICE_STORAGE"],
    ]
  }
}

#--------------------------------------------------------------
# Cosmos DB
#--------------------------------------------------------------

# create cosmos db
resource "azurerm_cosmosdb_account" "cosmosdb" {
  name                = "cosmosdb-${local.resource_version}"
  resource_group_name = azurerm_resource_group.rg.name
  location            = azurerm_resource_group.rg.location
  offer_type          = var.cosmosdb_offer_type
  tags                = local.required_tags

  consistency_policy {
    consistency_level = var.cosmosdb_consistency_level
  }

  geo_location {
    location          = azurerm_resource_group.rg.location
    failover_priority = 0
  }
}

resource "azurerm_cosmosdb_sql_database" "cosmosdb_database" {
  name                = var.cosmosdb_database_name
  resource_group_name = azurerm_resource_group.rg.name
  account_name        = azurerm_cosmosdb_account.cosmosdb.name

  autoscale_settings {
    max_throughput = 4000
  }
}

resource "azurerm_cosmosdb_sql_container" "cosmosdb_container_insights" {
  name                = var.cosmosdb_insights_container_name
  resource_group_name = azurerm_resource_group.rg.name
  account_name        = azurerm_cosmosdb_account.cosmosdb.name
  database_name       = azurerm_cosmosdb_sql_database.cosmosdb_database.name
  partition_key_path  = var.cosmosdb_insights_partition_key
}

#--------------------------------------------------------------
# Cognitive Search
#--------------------------------------------------------------

# create azure cognitive search
resource "azurerm_search_service" "search" {
  name                = "search-${local.resource_version}"
  resource_group_name = azurerm_resource_group.rg.name
  location            = azurerm_resource_group.rg.location
  sku                 = var.search_sku
  partition_count     = var.search_partition_count
  replica_count       = var.search_replica_count
  tags                = local.required_tags

  identity {
    type = "SystemAssigned"
  }
}

resource "azurerm_key_vault_secret" "search_primary_key_secret" {
  name         = "SEARCH-SERVICE-PRIMARY-KEY"
  value        = azurerm_search_service.search.primary_key
  key_vault_id = azurerm_key_vault.kv.id
}

resource "azurerm_key_vault_secret" "search_query_key_secret" {
  name         = "SEARCH-SERVICE-QUERY-KEY"
  value        = azurerm_search_service.search.query_keys[0].key
  key_vault_id = azurerm_key_vault.kv.id
}

#--------------------------------------------------------------
# Web Application
#--------------------------------------------------------------

# create web application
resource "azurerm_service_plan" "webapp_plan" {
  name                = "webplan-${local.resource_version}"
  resource_group_name = azurerm_resource_group.rg.name
  location            = azurerm_resource_group.rg.location
  os_type             = var.webapp_plan_os_type
  sku_name            = var.webapp_plan_sku
  worker_count        = var.webapp_plan_worker_count
  tags                = local.required_tags
}

resource "azurerm_linux_web_app" "webapi" {
  name                = "webapi-${local.resource_version}"
  resource_group_name = azurerm_resource_group.rg.name
  location            = azurerm_resource_group.rg.location
  service_plan_id     = azurerm_service_plan.webapp_plan.id
  https_only          = true
  tags                = local.required_tags

  app_settings = {
    "APPLICATIONINSIGHTS_CONNECTION_STRING" = azurerm_application_insights.appinsights.connection_string
    "AzureAd__Instance"                     = var.azuread_app_instance
    "AzureAd__Domain"                       = var.azuread_app_domain
    "AzureAd__TenantId"                     = data.azuread_client_config.current.tenant_id
    "AzureAd__ClientId"                     = var.azuread_app_api_client_id
    "Swagger__ClientId"                     = var.azuread_app_ui_client_id
    "Swagger__Scopes"                       = "api://${var.azuread_app_api_client_id}/User.Impersonation"
    "KeyVaultName"                          = azurerm_key_vault.kv.name
    "DashboardUrl"                          = var.dashboard_url
    "Search__ServiceName"                   = azurerm_search_service.search.name
    "Search__IndexVideos"                   = var.search_index_alias_videos
    "Search__IndexScenes"                   = var.search_index_alias_scenes
    "Search__IndexShots"                    = var.search_index_alias_shots
    "VideoIndexer__AccountName"             = jsondecode(azurerm_resource_group_template_deployment.video_indexer.output_content).accountName.value
    "VideoIndexer__AccountId"               = jsondecode(azurerm_resource_group_template_deployment.video_indexer.output_content).accountId.value
    "VideoIndexer__AccountLocation"         = jsondecode(azurerm_resource_group_template_deployment.video_indexer.output_content).location.value
    "VideoIndexer__ResourceGroup"           = jsondecode(azurerm_resource_group_template_deployment.video_indexer.output_content).resourceGroup.value
    "VideoIndexer__SubscriptionId"          = jsondecode(azurerm_resource_group_template_deployment.video_indexer.output_content).subscriptionId.value
  }

  site_config {
    always_on = true

    application_stack {
      dotnet_version = "6.0"
    }

    cors {
      support_credentials = true
      allowed_origins     = ["https://${azurerm_linux_web_app.webui.default_hostname}"]
    }
  }

  identity {
    type = "SystemAssigned"
  }
}

resource "azurerm_linux_web_app" "webui" {
  name                = "webui-${local.resource_version}"
  resource_group_name = azurerm_resource_group.rg.name
  location            = azurerm_resource_group.rg.location
  service_plan_id     = azurerm_service_plan.webapp_plan.id
  https_only          = true
  tags                = local.required_tags

  site_config {
    always_on        = true
    app_command_line = "pm2 serve /home/site/wwwroot/ --no-daemon --spa"

    application_stack {
      node_version = "16-lts"
    }
  }

  identity {
    type = "SystemAssigned"
  }
}

#--------------------------------------------------------------
# Media Services
#--------------------------------------------------------------

# create storage for media services
resource "azurerm_storage_account" "media_storage" {
  name                             = "mediastorage${local.resource_version_compact}"
  resource_group_name              = azurerm_resource_group.rg.name
  location                         = azurerm_resource_group.rg.location
  account_tier                     = var.media_storage_account_tier
  account_replication_type         = var.media_storage_account_replication_type
  enable_https_traffic_only        = true
  cross_tenant_replication_enabled = false
  tags                             = local.required_tags
}

# create media services
resource "azurerm_media_services_account" "media_services" {
  name                        = "mediaservices${local.resource_version_compact}"
  resource_group_name         = azurerm_resource_group.rg.name
  location                    = azurerm_resource_group.rg.location
  storage_authentication_type = "System"
  tags                        = local.required_tags

  storage_account {
    id         = azurerm_storage_account.media_storage.id
    is_primary = true
  }

  identity {
    type = "SystemAssigned"

  }
}

#--------------------------------------------------------------
# Video Indexer
#--------------------------------------------------------------

# create user assigned managed identity
resource "azurerm_user_assigned_identity" "video_indexer_uami" {
  name                = "vi-uami-${local.resource_version}"
  resource_group_name = azurerm_resource_group.rg.name
  location            = azurerm_resource_group.rg.location
}

# deploy video indexer (arm template)
resource "azurerm_resource_group_template_deployment" "video_indexer" {
  resource_group_name = azurerm_resource_group.rg.name
  parameters_content = jsonencode({
    "name"                          = { value = "vi-${local.resource_version}" },
    "managedIdentityResourceId"     = { value = azurerm_user_assigned_identity.video_indexer_uami.id },
    "mediaServiceAccountResourceId" = { value = azurerm_media_services_account.media_services.id }
    "tags"                          = { value = local.required_tags }
  })

  template_content = data.template_file.vi.template

  # The filemd5 forces this to run when the file is changed
  # this ensures the keys are up-to-date
  name            = "vi-${filemd5(local.arm_vi_file_path)}"
  deployment_mode = "Incremental"
  depends_on = [
    azurerm_media_services_account.media_services,
    azurerm_role_assignment.video_indexer_media_services_access
  ]
}

#--------------------------------------------------------------
# Service Bus
#--------------------------------------------------------------

# create service bus namespace
resource "azurerm_servicebus_namespace" "servicebus" {
  name                = "servicebus-${local.resource_version}"
  resource_group_name = azurerm_resource_group.rg.name
  location            = azurerm_resource_group.rg.location
  sku                 = var.servicebus_sku
  tags                = local.required_tags
}

# create service bus queues
resource "azurerm_servicebus_queue" "extract_queue" {
  name         = "1-extract-queue"
  namespace_id = azurerm_servicebus_namespace.servicebus.id
}

resource "azurerm_servicebus_queue" "dataproc_queue" {
  name         = "2-dataproc-queue"
  namespace_id = azurerm_servicebus_namespace.servicebus.id
}



