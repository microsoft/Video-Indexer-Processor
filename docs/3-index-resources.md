# Index resources creation instructions

## How to deploy the index, the cosmos data source and the indexer

Before creating the index & the associated resources, make sure that the infrastructure has been deployed and is ready to host the index, indexer, and the cosmosDB datasource. If you have not deployed the infrastructure yet, please refer to the terraform documentation for instructions on how to deploy the resources required.

### Prerequisites

- Azure CLI, i.e. the `az` command. See [How to install the Azure CLI](https://learn.microsoft.com/en-us/cli/azure/install-azure-cli).
- The command must be executed from a Unix-like shell terminal session, using a variant of `sh` or `bash`
- Get the Key Vault name. It is displayed from the Key Vault home page
- Get the Azure Search URL from the portal. It is displayed from the Search service "overview" page
- Get the Cosmos DB account URI. It is displayed from the ACosmos DB Account "overview" page
- Get the Cosmos DB account access primary key. It is displayed in the Cosmos DB account "Keys" page

### Login on Azure using Azure CLI

```bash
vscode ➜ /workspaces/metadata-enrichment/src/python/common/enrichment/search_index_creation/ (main) $ az login
```

### Ensure you target the correct subscription

```bash
vscode ➜ /workspaces/metadata-enrichment/src/python/common/enrichment/search_index_creation/ (main) $ az account show
```

If the current active subscription displayed is not correct, you can use the following command to switch context.

```bash
vscode ➜ /workspaces/metadata-enrichment/src/python/common/enrichment/search_index_creation/ $ az account set --subscription <subscription_id>
```

### Running the resources creation script

In your command line tool, run the following command:

```bash
vscode ➜ /workspaces/metadata-enrichment/src/python/common/enrichment/search_index_creation/ $ chmod u+x resources_creation.sh
vscode ➜ /workspaces/metadata-enrichment/src/python/common/enrichment/search_index_creation/ $ ./resources_creation.sh "keyvault-name" "azure-search-url" "cosmos-db-uri" "cosmos-db-primary-key"
```

### Potential improvements

The resources creation script requires the connection string to contain the credentials for the indexer to connect to the Cosmos DB database. An improvement to the current implementation is to use a managed identity, the documentation can be found [here](https://learn.microsoft.com/en-us/azure/search/search-howto-managed-identities-cosmos-db)
