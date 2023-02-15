// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
namespace Functions.Tests;

using Azure.Identity;
using Azure.Messaging.ServiceBus;
using Azure.Storage.Blobs;
using Microsoft.Azure.Cosmos;
using Microsoft.Extensions.Configuration;
using Newtonsoft.Json.Linq;

public class FuncDataprocIntegrationTests
{
    public readonly IConfiguration config;

    public FuncDataprocIntegrationTests(IConfiguration config)
    {
        this.config = config;
    }

    [Fact]
    public async void FuncDataprocIntegrationTest()
    {
        // Arrange

        var testJson = "parsed_1.json";
        var testViInsights = "vi_insights.json";
        var silverFolderName = "test-video";
        var videoId = "634d74e630";

        var dataStorageEndpoint = config.GetValue<string>("core_data_storage_endpoint");
        var silverContainer = config.GetValue<string>("core_silver_container");
        var serviceBusNamespace = config.GetValue<string>("core_service_bus_namespace");
        var serviceBusQueueName = config.GetValue<string>("core_service_bus_dataproc_queue");
        var cosmosDbEndpoint = config.GetValue<string>("core_cosmosdb_endpoint");
        var cosmosDbContainer = config.GetValue<string>("core_cosmosdb_container_insights");
        var cosmosDbDatabase = config.GetValue<string>("core_cosmosdb_database");

        // Blob URIs
        var newsMlUri = new Uri($"{dataStorageEndpoint}{silverContainer}/{silverFolderName}/{testJson}");
        var viInsightsUri = new Uri($"{dataStorageEndpoint}{silverContainer}/{silverFolderName}/{testViInsights}");

        // Service Bus client
        var serviceBusClient = new ServiceBusClient(serviceBusNamespace, new DefaultAzureCredential());
        var sender = serviceBusClient.CreateSender(serviceBusQueueName);

        // Cosmos DB client
        var cosmosClient = new CosmosClient(cosmosDbEndpoint, new DefaultAzureCredential());
        var cosmosDatabase = cosmosClient.GetDatabase(cosmosDbDatabase);
        var cosmosContainer = cosmosDatabase.GetContainer(cosmosDbContainer);

        // Ensure the expected document does not exist in Cosmos DB
        using (ResponseMessage response = await cosmosContainer.ReadItemStreamAsync(videoId, new PartitionKey(videoId)))
        {
            if (response.IsSuccessStatusCode)
            {
                await cosmosContainer.DeleteItemStreamAsync(videoId, new PartitionKey(videoId));
            }
        }

        // Upload files to Silver storage (NewsML JSON and VI Insights)
        var newsMlBlobClient = new BlobClient(newsMlUri, new DefaultAzureCredential());
        newsMlBlobClient.Upload($"assets/{testJson}", overwrite: true);

        var viInsightsBlobClient = new BlobClient(viInsightsUri, new DefaultAzureCredential());
        viInsightsBlobClient.Upload($"assets/{testViInsights}", overwrite: true);

        // Act

        // Send message to dataproc queue
        var messageBody = File.ReadAllText("assets/dataproc_message.json");
        var message = new ServiceBusMessage(messageBody);
        await sender.SendMessageAsync(message);

        // Assert

        // Wait for the document to be written to Cosmos DB
        string? doc = null;
        for (int tries = 0; tries < 10; tries++)
        {
            System.Console.WriteLine("waiting...");
            Thread.Sleep(30000);

            using var response = await cosmosContainer.ReadItemStreamAsync(videoId, new PartitionKey(videoId));
            if (!response.IsSuccessStatusCode)
            {
                continue;
            }

            using var streamReader = new StreamReader(response.Content);
            doc = await streamReader.ReadToEndAsync();
            break;
        }

        Assert.NotNull(doc);

        // Check the coherence of the Cosmos DB document
        var docObject = JObject.Parse(doc);
        Assert.Equal(videoId, docObject.GetValue("id").Value<string>());
        Assert.Equal("upload.json", docObject.GetValue("metadata_file_name").Value<string>());
        Assert.Equal("test-video.mp4", docObject.GetValue("description").Value<string>());
    }
}
