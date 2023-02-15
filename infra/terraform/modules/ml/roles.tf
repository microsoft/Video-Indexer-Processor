#--------------------------------------------------------------
# Roles | Model Hosting (Web Application)
#--------------------------------------------------------------

# assign app container identity with acrpull role to pull images from registry
resource "azurerm_role_assignment" "mlapi_registry_access" {
  scope                = azurerm_container_registry.registry.id
  role_definition_name = "acrpull"
  principal_id         = azurerm_linux_web_app.mlapi.identity[0].principal_id
}