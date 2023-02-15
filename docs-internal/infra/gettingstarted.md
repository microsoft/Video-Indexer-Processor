# Getting started with Terraform

## How to deploy a new environment for dev/test

### Login on Azure using Azure CLI

```bash
vscode ➜ /workspaces/metadata-enrichment/infra (main) $ az login
```

### Ensure you target the correct subscription

```bash
vscode ➜ /workspaces/metadata-enrichment/infra (main) $ az account show
```

If the current active subscription displayed is not correct, you can use the following command to switch context.

```bash
vscode ➜ /workspaces/metadata-enrichment/infra (main) $ az account set --subscription <subscription_id>
```

### Prepare terraform working directory

Important: When you work locally, please ensure `backend` section is commented in [main.tf](../../infra/terraform/main.tf). Warning: DO NOT commit this change when you push code to repository.

#### Details about terraform

Terraform must store state about your managed infrastructure and configuration. This state is used by Terraform to map real world resources to your configuration, keep track of metadata, and to improve performance for large infrastructures. Reference: [State](https://www.terraform.io/language/state)

Backend section is used by Azure DevOps pipeline to store terraform state in a blob storage. It's the case only for staging and prod environment. For dev/test usage, terraform state will be saved locally. Reference: [Backends](https://www.terraform.io/language/settings/backends)

```json
terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "=3.2.0"
    }
  }
}

# START - NEED TO BE COMMENTED IF YOU WORK WITH A LOCAL STATE
# terraform {
#   backend "azurerm" {}
# }
# END

provider "azurerm" {
  features {}
}
```

Change directory to target terraform folder.

```bash
vscode ➜ /workspaces/metadata-enrichment/infra (main) $ cd terraform
```

Initialize this working directory.

```bash
vscode ➜ /workspaces/metadata-enrichment/infra/terraform (main) $ terraform init
Initializing modules...

Initializing the backend...

Initializing provider plugins...
- Reusing previous version of hashicorp/azurerm from the dependency lock file
- Reusing previous version of hashicorp/random from the dependency lock file
- Reusing previous version of hashicorp/template from the dependency lock file
- Using previously-installed hashicorp/azurerm v3.2.0
- Using previously-installed hashicorp/random v3.1.3
- Using previously-installed hashicorp/template v2.2.0

Terraform has been successfully initialized!

You may now begin working with Terraform. Try running "terraform plan" to see
any changes that are required for your infrastructure. All Terraform commands
should now work.

If you ever set or change modules or backend configuration for Terraform,
rerun this command to reinitialize your working directory. If you forget, other
commands will detect it and remind you to do so if necessary.
```

### Apply changes

You can then execute the changes defined by terraform configuration files to create, update, or destroy resources.

```bash
vscode ➜ /workspaces/metadata-enrichment/infra/terraform (main) $ terraform apply
<list of resources>

Plan: 59 to add, 0 to change, 0 to destroy.

Changes to Outputs:
  + core_function_dataproc_name = (known after apply)
  + core_function_dataproc_url  = (known after apply)
  + core_function_extract_name  = (known after apply)
  + core_function_extract_url   = (known after apply)
  + core_function_trigger_name  = (known after apply)
  + core_function_trigger_url   = (known after apply)
  + core_resource_group_name    = (known after apply)
  + core_webapi_name            = (known after apply)
  + core_webapi_url             = (known after apply)
  + core_webui_name             = (known after apply)
  + core_webui_url              = (known after apply)

Do you want to perform these actions?
  Terraform will perform the actions described above.
  Only 'yes' will be accepted to approve.

  Enter a value: yes
```

Just enter `yes` to accept the actions.

### Understand variables

If you don't specify any option, a new dev environment will be created using default values located in [variables.tf](../../infra/terraform/variables.tf).

For instance, default `name` is *ajme*, default `environment` is *dev*, default `location` is *westeurope*.

```json
variable "name" {
  description = "The application name, used to name all resources."
  type        = string
  default     = "ajme"
}

variable "environment" {
  description = "The environment name, used to name all resources."
  type        = string
  default     = "dev"
}

variable "location" {
  description = "The location of all resources."
  type        = string
  default     = "westeurope"
}
```

Configuration files will use these informations to name resources. For instance, resource groups are created with following name conventions. uid is autogenerated.

- rg-`name`-`environment`-`uid`-core
  - example: rg-ajme-dev-aa0a-core
- rg-`name`-`environment`-`uid`-ml
  - example: rg-ajme-dev-aa0a-ml

However, if you need to update a setting, for instance `location`, please avoid to change it directly in [variables.tf](../../infra/terraform/variables.tf).

Instead, please check **.tfvars** available in ./terraform/environments folder. You have variations of settings for [dev](../../infra/terraform/environments/dev.tfvars) and [staging](../../infra/terraform/environments/staging.tfvars) environments.

```bash
#--------------------------------------------------------------
# General
#--------------------------------------------------------------

name        = "ajme"
environment = "dev"
location    = "westeurope"

#--------------------------------------------------------------
# Core
#--------------------------------------------------------------

core_key_vault_sku                             = "standard"
core_data_storage_account_tier                 = "Standard"
core_data_storage_account_replication_type     = "LRS"
core_function_storage_account_tier             = "Standard"
core_function_storage_account_replication_type = "LRS"
core_function_plan_sku                         = "S1"
core_function_plan_worker_count                = 1
core_cosmosdb_offer_type                       = "Standard"
core_cosmosdb_consistency_level                = "Strong"
core_search_sku                                = "basic"
core_search_partition_count                    = 1
core_search_replica_count                      = 1
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
```

You can create your own **.tfvars** file and use it as a parameter when you apply configuration files.

```bash
vscode ➜ /workspaces/metadata-enrichment/infra/terraform (main) $ terraform apply -var-file="./environments/custom.tfvars"
```