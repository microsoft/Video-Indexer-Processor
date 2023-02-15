#--------------------------------------------------------------
# Roles | Azure Functions (functrigger)
#--------------------------------------------------------------

resource "azurerm_role_assignment" "function_trigger_function_storage_account_access" {
  scope                = azurerm_storage_account.function_storage.id
  role_definition_name = "Storage Account Contributor"
  principal_id         = azurerm_linux_function_app.function_trigger.identity[0].principal_id
}

resource "azurerm_role_assignment" "function_trigger_function_storage_blob_access" {
  scope                = azurerm_storage_account.function_storage.id
  role_definition_name = "Storage Blob Data Owner"
  principal_id         = azurerm_linux_function_app.function_trigger.identity[0].principal_id
}

resource "azurerm_role_assignment" "function_trigger_function_storage_queue_access" {
  scope                = azurerm_storage_account.function_storage.id
  role_definition_name = "Storage Queue Data Contributor"
  principal_id         = azurerm_linux_function_app.function_trigger.identity[0].principal_id
}

resource "azurerm_role_assignment" "function_trigger_function_storage_table_access" {
  scope                = azurerm_storage_account.function_storage.id
  role_definition_name = "Storage Table Data Contributor"
  principal_id         = azurerm_linux_function_app.function_trigger.identity[0].principal_id
}

resource "azurerm_role_assignment" "function_trigger_data_storage_blob_access" {
  scope                = azurerm_storage_account.data_storage.id
  role_definition_name = "Storage Blob Data Owner"
  principal_id         = azurerm_linux_function_app.function_trigger.identity[0].principal_id
}

resource "azurerm_role_assignment" "function_trigger_data_storage_queue_access" {
  scope                = azurerm_storage_account.data_storage.id
  role_definition_name = "Storage Queue Data Contributor"
  principal_id         = azurerm_linux_function_app.function_trigger.identity[0].principal_id
}

resource "azurerm_role_assignment" "function_trigger_extract_queue_access" {
  scope                = azurerm_servicebus_queue.extract_queue.id
  role_definition_name = "Azure Service Bus Data Sender"
  principal_id         = azurerm_linux_function_app.function_trigger.identity[0].principal_id
}

#--------------------------------------------------------------
# Roles | Azure Functions (funcextract)
#--------------------------------------------------------------

resource "azurerm_role_assignment" "function_extract_function_storage_account_access" {
  scope                = azurerm_storage_account.function_storage.id
  role_definition_name = "Storage Account Contributor"
  principal_id         = azurerm_linux_function_app.function_extract.identity[0].principal_id
}

resource "azurerm_role_assignment" "function_extract_function_storage_blob_access" {
  scope                = azurerm_storage_account.function_storage.id
  role_definition_name = "Storage Blob Data Owner"
  principal_id         = azurerm_linux_function_app.function_extract.identity[0].principal_id
}

resource "azurerm_role_assignment" "function_extract_function_storage_queue_access" {
  scope                = azurerm_storage_account.function_storage.id
  role_definition_name = "Storage Queue Data Contributor"
  principal_id         = azurerm_linux_function_app.function_extract.identity[0].principal_id
}

resource "azurerm_role_assignment" "function_extract_function_storage_table_access" {
  scope                = azurerm_storage_account.function_storage.id
  role_definition_name = "Storage Table Data Contributor"
  principal_id         = azurerm_linux_function_app.function_extract.identity[0].principal_id
}

resource "azurerm_role_assignment" "function_extract_data_storage_access" {
  scope                = azurerm_storage_account.data_storage.id
  role_definition_name = "Storage Blob Data Contributor"
  principal_id         = azurerm_linux_function_app.function_extract.identity[0].principal_id
}

resource "azurerm_role_assignment" "function_extract_extract_queue_access" {
  scope                = azurerm_servicebus_queue.extract_queue.id
  role_definition_name = "Azure Service Bus Data Receiver"
  principal_id         = azurerm_linux_function_app.function_extract.identity[0].principal_id
}

resource "azurerm_role_assignment" "function_extract_dataproc_queue_access" {
  scope                = azurerm_servicebus_queue.dataproc_queue.id
  role_definition_name = "Azure Service Bus Data Sender"
  principal_id         = azurerm_linux_function_app.function_extract.identity[0].principal_id
}

resource "azurerm_role_assignment" "function_extract_video_indexer_access" {
  scope                = jsondecode(azurerm_resource_group_template_deployment.video_indexer.output_content).resourceId.value
  role_definition_name = "Contributor"
  principal_id         = azurerm_linux_function_app.function_extract.identity[0].principal_id
}

#--------------------------------------------------------------
# Roles | Azure Functions (dataproc)
#--------------------------------------------------------------

resource "azurerm_role_assignment" "function_dataproc_function_storage_account_access" {
  scope                = azurerm_storage_account.function_storage.id
  role_definition_name = "Storage Account Contributor"
  principal_id         = azurerm_linux_function_app.function_dataproc.identity[0].principal_id
}

resource "azurerm_role_assignment" "function_dataproc_function_storage_blob_access" {
  scope                = azurerm_storage_account.function_storage.id
  role_definition_name = "Storage Blob Data Owner"
  principal_id         = azurerm_linux_function_app.function_dataproc.identity[0].principal_id
}

resource "azurerm_role_assignment" "function_dataproc_function_storage_queue_access" {
  scope                = azurerm_storage_account.function_storage.id
  role_definition_name = "Storage Queue Data Contributor"
  principal_id         = azurerm_linux_function_app.function_dataproc.identity[0].principal_id
}

resource "azurerm_role_assignment" "function_dataproc_function_storage_table_access" {
  scope                = azurerm_storage_account.function_storage.id
  role_definition_name = "Storage Table Data Contributor"
  principal_id         = azurerm_linux_function_app.function_dataproc.identity[0].principal_id
}

resource "azurerm_role_assignment" "function_dataproc_data_storage_access" {
  scope                = azurerm_storage_account.data_storage.id
  role_definition_name = "Storage Blob Data Contributor"
  principal_id         = azurerm_linux_function_app.function_dataproc.identity[0].principal_id
}

resource "azurerm_role_assignment" "function_dataproc_dataproc_queue_access" {
  scope                = azurerm_servicebus_queue.dataproc_queue.id
  role_definition_name = "Azure Service Bus Data Receiver"
  principal_id         = azurerm_linux_function_app.function_dataproc.identity[0].principal_id
}

resource "azurerm_role_assignment" "function_dataproc_cosmosdb_access" {
  scope                = azurerm_cosmosdb_account.cosmosdb.id
  role_definition_name = "Cosmos DB Operator"
  principal_id         = azurerm_linux_function_app.function_dataproc.identity[0].principal_id
}

resource "azurerm_cosmosdb_sql_role_assignment" "function_dataproc_cosmosdb_data_contributor" {
  scope               = azurerm_cosmosdb_account.cosmosdb.id
  resource_group_name = azurerm_resource_group.rg.name
  account_name        = azurerm_cosmosdb_account.cosmosdb.name
  role_definition_id  = "${azurerm_cosmosdb_account.cosmosdb.id}/sqlRoleDefinitions/00000000-0000-0000-0000-000000000002"
  principal_id        = azurerm_linux_function_app.function_dataproc.identity[0].principal_id
}

#--------------------------------------------------------------
# Roles | Cognitive Search
#--------------------------------------------------------------

resource "azurerm_role_assignment" "search_cosmosdb_access" {
  scope                = azurerm_cosmosdb_account.cosmosdb.id
  role_definition_name = "Cosmos DB Account Reader Role"
  principal_id         = azurerm_search_service.search.identity[0].principal_id
}

#--------------------------------------------------------------
# Roles | Web Application (webapi)
#--------------------------------------------------------------

resource "azurerm_role_assignment" "webapi_cosmosdb_access" {
  scope                = azurerm_cosmosdb_account.cosmosdb.id
  role_definition_name = "Cosmos DB Account Reader Role"
  principal_id         = azurerm_linux_web_app.webapi.identity[0].principal_id
}

resource "azurerm_role_assignment" "webapi_video_indexer_access" {
  scope                = jsondecode(azurerm_resource_group_template_deployment.video_indexer.output_content).resourceId.value
  role_definition_name = "Contributor"
  principal_id         = azurerm_linux_web_app.webapi.identity[0].principal_id
}

#--------------------------------------------------------------
# Roles | Media Services
#--------------------------------------------------------------

resource "azurerm_role_assignment" "media_services_media_storage_access" {
  scope                = azurerm_storage_account.media_storage.id
  role_definition_name = "Storage Blob Data Contributor"
  principal_id         = azurerm_media_services_account.media_services.identity[0].principal_id
}

#--------------------------------------------------------------
# Roles | Video Indexer
#--------------------------------------------------------------

resource "azurerm_role_assignment" "video_indexer_media_services_access" {
  scope                = azurerm_media_services_account.media_services.id
  role_definition_name = "Contributor"
  principal_id         = azurerm_user_assigned_identity.video_indexer_uami.principal_id
}

#--------------------------------------------------------------
# Roles | DevOps (Used for Integration Tests)
#--------------------------------------------------------------

resource "azurerm_role_assignment" "devops_data_storage_blob_access" {
  count                = var.environment == "int" ? 1 : 0
  scope                = azurerm_storage_account.data_storage.id
  role_definition_name = "Storage Blob Data Owner"
  principal_id         = data.azuread_client_config.current.object_id
}

resource "azurerm_role_assignment" "devops_extract_queue_access_receive" {
  count                = var.environment == "int" ? 1 : 0
  scope                = azurerm_servicebus_queue.extract_queue.id
  role_definition_name = "Azure Service Bus Data Receiver"
  principal_id         = data.azuread_client_config.current.object_id
}

resource "azurerm_role_assignment" "devops_extract_queue_access_send" {
  count                = var.environment == "int" ? 1 : 0
  scope                = azurerm_servicebus_queue.extract_queue.id
  role_definition_name = "Azure Service Bus Data Sender"
  principal_id         = data.azuread_client_config.current.object_id
}

resource "azurerm_role_assignment" "devops_dataproc_queue_access_send" {
  count                = var.environment == "int" ? 1 : 0
  scope                = azurerm_servicebus_queue.dataproc_queue.id
  role_definition_name = "Azure Service Bus Data Sender"
  principal_id         = data.azuread_client_config.current.object_id
}

resource "azurerm_role_assignment" "devops_dataproc_queue_access_receive" {
  count                = var.environment == "int" ? 1 : 0
  scope                = azurerm_servicebus_queue.dataproc_queue.id
  role_definition_name = "Azure Service Bus Data Receiver"
  principal_id         = data.azuread_client_config.current.object_id
}

resource "azurerm_cosmosdb_sql_role_assignment" "devops_cosmosdb_data_contributor" {
  count               = var.environment == "int" ? 1 : 0
  scope               = azurerm_cosmosdb_account.cosmosdb.id
  resource_group_name = azurerm_resource_group.rg.name
  account_name        = azurerm_cosmosdb_account.cosmosdb.name
  role_definition_id  = "${azurerm_cosmosdb_account.cosmosdb.id}/sqlRoleDefinitions/00000000-0000-0000-0000-000000000002"
  principal_id        = data.azuread_client_config.current.object_id
}
