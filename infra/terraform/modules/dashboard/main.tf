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
  workbook_template_path   = "${path.module}/templates/workbook.template.json"
  dashboard_template_path  = "${path.module}/templates/dashboard.template.json"
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
# Workbook (Tile Queries)
#--------------------------------------------------------------

# create uuid
resource "random_uuid" "workbook_uuid" {
}

# create workbook
resource "azurerm_application_insights_workbook" "workbook" {
  name                = random_uuid.workbook_uuid.result
  resource_group_name = azurerm_resource_group.rg.name
  location            = azurerm_resource_group.rg.location
  display_name        = "Tile Queries"
  source_id           = lower(var.application_insights_id)
  tags                = local.required_tags

  data_json = templatefile(local.workbook_template_path, {})
}

#--------------------------------------------------------------
# Dashboard
#--------------------------------------------------------------

# create dashboard
resource "azurerm_portal_dashboard" "dashboard" {
  name                = "dashboard-kpi-${local.resource_version}"
  resource_group_name = azurerm_resource_group.rg.name
  location            = azurerm_resource_group.rg.location
  tags                = local.required_tags

  dashboard_properties = templatefile(
    local.dashboard_template_path,
    {
      appinsights_resource_id = var.application_insights_id
      workbook_resource_id    = azurerm_application_insights_workbook.workbook.id
    }
  )
}
