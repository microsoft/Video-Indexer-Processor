#!/bin/bash

set -e

export LOCATION=$1
export RESOURCE_GROUP_NAME=$2
export TF_STATE_STORAGE_ACCOUNT_NAME=$3
export TF_STATE_CONTAINER_NAME=$4
export KEYVAULT_NAME=$5

if [ $(az group exists --name $RESOURCE_GROUP_NAME) = false ]; then
  # Create resource group
  echo "Creating $RESOURCE_GROUP_NAME resource group..."
  az group create -n $RESOURCE_GROUP_NAME -l $LOCATION

  echo "Resource group $RESOURCE_GROUP_NAME created."

  # Create the storage account
  echo "Creating $TF_STATE_STORAGE_ACCOUNT_NAME storage account..."
  az storage account create -g $RESOURCE_GROUP_NAME -l $LOCATION \
    --name $TF_STATE_STORAGE_ACCOUNT_NAME \
    --sku Standard_LRS \
    --encryption-services blob

  echo "Storage account $TF_STATE_STORAGE_ACCOUNT_NAME created."

  # Retrieve the storage account key
  echo "Retrieving storage account key..."
  ACCOUNT_KEY=$(az storage account keys list --resource-group $RESOURCE_GROUP_NAME --account-name $TF_STATE_STORAGE_ACCOUNT_NAME --query [0].value -o tsv)

  echo "Storage account key retrieved."

  # Create a storage container (for the terraform state)
  echo "Creating $TF_STATE_CONTAINER_NAME storage container..."
  az storage container create --name $TF_STATE_CONTAINER_NAME --account-name $TF_STATE_STORAGE_ACCOUNT_NAME --account-key $ACCOUNT_KEY

  echo "Storage container $TF_STATE_CONTAINER_NAME created."

  # Create an Azure KeyVault
  echo "Creating $KEYVAULT_NAME key vault..."
  az keyvault create -g $RESOURCE_GROUP_NAME -l $LOCATION --name $KEYVAULT_NAME

  echo "Key vault $KEYVAULT_NAME created."

  # Store the Terraform State Storage Key into KeyVault
  echo "Store storage access key into key vault secret..."
  az keyvault secret set --name tfstate-storage-key --value $ACCOUNT_KEY --vault-name $KEYVAULT_NAME

  echo "Key vault secret created."
else
  echo "Resource group $RESOURCE_GROUP_NAME already created."
fi
