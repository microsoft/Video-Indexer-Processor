
# Roles

## General

Most resources are using managed identities (when this is supported). For instance, all function applications are using system-assigned managed identity. You can quickly detect this point in terraform configuration files with the use of the following block.

```tf
  identity {
    type = "SystemAssigned"
  }
```

The following documentation list all role assignments (RBAC) attributed to each resource identity.

### Azure Functions (functrigger identity)

| Scope | Role Definition |
|-------|-----------------|
| **functionstorage**[env][id] | Storage Account Contributor |
| **functionstorage**[env][id] | Storage Blob Data Owner |
| **functionstorage**[env][id] | Storage Queue Data Contributor |
| **functionstorage**[env][id] | Storage Table Data Contributor |
| **datastorage**[env][id] | Storage Blob Data Owner |
| **datastorage**[env][id] | Storage Queue Data Contributor |
| **servicebus**-[env]-[id]**/1-extract-queue** | Azure Service Bus Data Sender |

For additional information on Azure Functions: [Grant permission to the identity](https://docs.microsoft.com/en-us/azure/azure-functions/functions-reference?tabs=blob#grant-permission-to-the-identity)

### Azure Functions (funcextract identity)

| Scope | Role Definition |
|-------|-----------------|
| **functionstorage**[env][id] | Storage Account Contributor |
| **functionstorage**[env][id] | Storage Blob Data Owner |
| **functionstorage**[env][id] | Storage Queue Data Contributor |
| **functionstorage**[env][id] | Storage Table Data Contributor |
| **datastorage**[env][id] | Storage Blob Data Contributor |
| **servicebus**-[env]-[id]**/1-extract-queue** | Azure Service Bus Data Receiver |
| **servicebus**-[env]-[id]**/2-dataproc-queue** | Azure Service Bus Data Sender |
| **vi**-[env]-[id] | Contributor |

For additional information on Azure Functions: [Grant permission to the identity](https://docs.microsoft.com/en-us/azure/azure-functions/functions-reference?tabs=blob#grant-permission-to-the-identity)

### Azure Functions (funcdataproc identity)

| Scope | Role Definition |
|-------|-----------------|
| **functionstorage**[env][id] | Storage Account Contributor |
| **functionstorage**[env][id] | Storage Blob Data Owner |
| **functionstorage**[env][id] | Storage Queue Data Contributor |
| **functionstorage**[env][id] | Storage Table Data Contributor |
| **datastorage**[env][id] | Storage Blob Data Contributor |
| **servicebus**-[env]-[id]**/2-dataproc-queue** | Azure Service Bus Data Receiver |
| **cosmosdb**-[env]-[id] | Cosmos DB Operator |
| **cosmosdb**-[env]-[id] | /sqlRoleDefinitions/00000000-0000-0000-0000-000000000002 |

For additional information on Azure Functions: [Grant permission to the identity](https://docs.microsoft.com/en-us/azure/azure-functions/functions-reference?tabs=blob#grant-permission-to-the-identity)

For addition information on Cosmos DB [Azure AD authentication and Cosmos DB connector](https://docs.microsoft.com/en-us/connectors/documentdb/#azure-ad-authentication-and-cosmos-db-connector)

### Cognitive Search

| Scope | Role Definition |
|-------|-----------------|
| **cosmosdb**-[env]-[id] | Cosmos DB Account Reader Role |

### Web Application (webapi identity)

| Scope | Role Definition |
|-------|-----------------|
| **cosmosdb**-[env]-[id] | Cosmos DB Account Reader Role |
| **vi**-[env]-[id] | Contributor |

### Media Services

| Scope | Role Definition |
|-------|-----------------|
| **mediastorage**[env][id] | Storage Blob Data Contributor |

### Video Indexer

| Scope | Role Definition |
|-------|-----------------|
| **mediaservices**[env][id] | Contributor |

### DevOps (Used for Integration Tests)

| Scope | Role Definition |
|-------|-----------------|
| **datastorage**[env][id] | Storage Blob Data Owner |
| **servicebus**-[env]-[id]**/1-extract-queue** | Azure Service Bus Data Receiver |
