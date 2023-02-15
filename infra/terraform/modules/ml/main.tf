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

#--------------------------------------------------------------
# Machine Learning Workspace
#--------------------------------------------------------------

# create storage account
resource "azurerm_storage_account" "ml_storage" {
  name                             = "mlstorage${local.resource_version_compact}"
  location                         = azurerm_resource_group.rg.location
  resource_group_name              = azurerm_resource_group.rg.name
  account_tier                     = var.mlstorage_account_tier
  account_replication_type         = var.mlstorage_account_replication_type
  enable_https_traffic_only        = true
  cross_tenant_replication_enabled = false
  tags                             = local.required_tags
}

# create azure ml workspace
resource "azurerm_machine_learning_workspace" "ml_workspace" {
  name                    = "mlworkspace-${local.resource_version}"
  location                = azurerm_resource_group.rg.location
  resource_group_name     = azurerm_resource_group.rg.name
  application_insights_id = var.application_insights_id
  key_vault_id            = var.key_vault_id
  storage_account_id      = azurerm_storage_account.ml_storage.id
  tags                    = local.required_tags

  identity {
    type = "SystemAssigned"
  }
}

#--------------------------------------------------------------
# Model Hosting (Web Application)
#--------------------------------------------------------------

# create azure container registry
resource "azurerm_container_registry" "registry" {
  name                = "registry${local.resource_version_compact}"
  resource_group_name = azurerm_resource_group.rg.name
  location            = azurerm_resource_group.rg.location
  sku                 = var.container_registry_sku
  admin_enabled       = true
  tags                = local.required_tags
}

# create web app for containers
resource "azurerm_service_plan" "mlapi_plan" {
  name                = "mlplan-${local.resource_version}"
  resource_group_name = azurerm_resource_group.rg.name
  location            = azurerm_resource_group.rg.location
  os_type             = var.mlapi_plan_os_type
  sku_name            = var.mlapi_plan_sku
  worker_count        = var.mlapi_plan_worker_count
  tags                = local.required_tags
}

resource "azurerm_linux_web_app" "mlapi" {
  name                    = "mlapi-${local.resource_version}"
  resource_group_name     = azurerm_resource_group.rg.name
  location                = azurerm_resource_group.rg.location
  service_plan_id         = azurerm_service_plan.mlapi_plan.id
  https_only              = true
  client_affinity_enabled = true
  tags                    = local.required_tags

  site_config {
    always_on                               = true
    container_registry_use_managed_identity = true

    application_stack {
      docker_image     = "registry.hub.docker.com/tutum/hello-world"
      docker_image_tag = "latest"
    }
  }

  identity {
    type = "SystemAssigned"
  }
}

#--------------------------------------------------------------
# Cognitive Services - Text Analytics
#--------------------------------------------------------------

resource "azurerm_cognitive_account" "cognitive_text_analytics" {
  name                = "textanalytics-${local.resource_version}"
  resource_group_name = azurerm_resource_group.rg.name
  location            = azurerm_resource_group.rg.location
  kind                = "TextAnalytics"
  sku_name            = var.cognitive_text_analytics_sku
  tags                = local.required_tags

  identity {
    type = "SystemAssigned"
  }
}

