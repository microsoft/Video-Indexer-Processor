data "azuread_client_config" "current" {}

data "template_file" "vi" {
  template = file(local.arm_vi_file_path)
}
