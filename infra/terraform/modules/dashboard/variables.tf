variable "name" {
  description = "(Inherited) The application name, used to name all resources."
  type        = string
}

variable "workload" {
  description = "The workload name, used to name resource group."
  type        = string
  default     = "dashboard"
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

variable "azuread_app_domain" {
  description = "(Inherited) The domain name."
  type        = string
}

variable "application_insights_id" {
  description = "(Inherited) The application insights resource id."
  type        = string
}