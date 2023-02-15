variable "name" {
  description = "(Inherited) The application name, used to name all resources."
  type        = string
}

variable "workload" {
  description = "The workload name, used to name resource group."
  type        = string
  default     = "ml"
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

variable "container_registry_sku" {
  description = "(Inherited) The sku name of the container registry. "
  type        = string
}

variable "mlapi_plan_os_type" {
  description = "The os type for the web application plan."
  type        = string
  default     = "Linux"
}

variable "mlapi_plan_sku" {
  description = "(Inherited) The sku for the web application plan."
  type        = string
}

variable "mlapi_plan_worker_count" {
  description = "(Inherited) The number of workers (instances) to be allocated."
  type        = number
}

variable "mlstorage_account_tier" {
  description = "(Inherited) The tier to use for this storage account."
  type        = string
}

variable "mlstorage_account_replication_type" {
  description = "(Inherited) The type of replication to use for this storage account."
  type        = string
}

variable "cognitive_text_analytics_sku" {
  description = "(Inherited) The sku name for text analytics service account."
  type        = string
}

variable "application_insights_id" {
  description = "(Inherited) The application insights resource id."
  type        = string
}

variable "key_vault_id" {
  description = "(Inherited) The key vault resource id."
  type        = string
}
