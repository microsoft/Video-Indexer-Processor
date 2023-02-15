#!/bin/bash

keyvault_adress=$1
search_service_url=$2
datasource_endpoint=$3
datasource_key=$4
search_api_version='2021-04-30-Preview'
odata_context=$search_service_url'/$metadata#datasources/$entity'
cosmosdb_database='waldo'
connectionstring='AccountEndpoint='$datasource_endpoint';AccountKey='$datasource_key';Database='$cosmosdb_database';'

# Retrieve the search API key from the keyvault
search_api_key=$(
    az keyvault secret show \
    --vault-name $keyvault_adress \
    --name SEARCH-SERVICE-PRIMARY-KEY \
    --query value \
    --output tsv
)

# We do need to update the data source schema
cat <<< "$(jq -r --arg ODATACONTEXT "$odata_context" --arg CONNECTIONSTRING "$connectionstring" \
              '.["@odata.context"] = $ODATACONTEXT | .credentials.connectionString = $CONNECTIONSTRING' \
              media_enrichment_cosmos_datasource.json)" > media_enrichment_cosmos_datasource.json

# Create the index
http_response=$(curl -s -w "HTTPSTATUS:%{http_code}" \
              -X POST \
              -H "Content-Type: application/json" \
              -H "api-key: $search_api_key" \
              -d @media_enrichment_index_schema.json \
              "$search_service_url/indexes?api-version=$search_api_version")
       
# 201 is created
http_status=$(echo "$http_response" | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')
http_body=$(echo "$http_response" | sed -e 's/HTTPSTATUS:.*//g')

if [ $http_status -ne 201 ] ; then    
    echo "Error while creating the index: $http_status : $http_body"
    exit 1
fi

echo "The index has been created, next is the data source"

http_response=$(curl -s -w "HTTPSTATUS:%{http_code}" \
              -X POST \
              -H "Content-Type: application/json" \
              -H "api-key: $search_api_key" \
              -d @media_enrichment_cosmos_datasource.json \
              "$search_service_url/datasources?api-version=2020-06-30")

# 201 is created
http_status=$(echo "$http_response" | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')
http_body=$(echo "$http_response" | sed -e 's/HTTPSTATUS:.*//g')

if [ $http_status -ne 201 ] ; then    
    echo "Error while creating the data source: $http_status : $http_body"
    exit 1
fi

echo "The data source has been created, next is the indexer"

# Create the indexer - It runs automatically after its creation, no need to start it
http_response=$(curl -s -w "HTTPSTATUS:%{http_code}" \
              -X POST \
              -H "Content-Type: application/json" \
              -H "api-key: $search_api_key" \
              -d @media_enrichment_indexer_schema.json \
              "$search_service_url/indexers?api-version=$search_api_version")

# 201 is created
http_status=$(echo "$http_response" | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')
http_body=$(echo "$http_response" | sed -e 's/HTTPSTATUS:.*//g')

if [ $http_status -ne 201 ] ; then    
    echo "Error while creating the indexer: $http_status : $http_body"
    exit 1
fi

echo "indexer has been created. All resources have been created."