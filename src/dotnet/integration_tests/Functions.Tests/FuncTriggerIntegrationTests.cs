// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
namespace Functions.Tests;

using Azure.Identity;
using Azure.Messaging.ServiceBus;
using Azure.Storage.Blobs;
using Microsoft.Extensions.Configuration;
using Newtonsoft.Json.Linq;

public class FuncTriggerIntegrationTests
{
    public readonly IConfiguration config;

    public FuncTriggerIntegrationTests(IConfiguration config)
    {
        this.config = config;
    }

    [Fact]
    public async void FuncTriggerIntegrationTest()
    {
        // Arrange

        var testJsonFile = "upload.json";
        var testMp4File = "test-video.mp4";
        var datasource = "TEST-INT";
        var uid = "0123456789";

        var dataStorageEndpoint = config.GetValue<string>("core_data_storage_endpoint");
        var uploadContainer = config.GetValue<string>("core_upload_container");
        var silverContainer = config.GetValue<string>("core_silver_container");
        var serviceBusNamespace = config.GetValue<string>("core_service_bus_namespace");
        var serviceBusQueueName = config.GetValue<string>("core_service_bus_extract_queue");

        // Blob URIs
        var jsonUri = new Uri($"{dataStorageEndpoint}{uploadContainer}/{datasource}/{uid}/{testJsonFile}");
        var mp4Uri = new Uri($"{dataStorageEndpoint}{uploadContainer}/{datasource}/{uid}/{testMp4File}");

        // Service Bus client
        var serviceBusClient = new ServiceBusClient(serviceBusNamespace, new DefaultAzureCredential());
        var receiver = serviceBusClient.CreateReceiver(serviceBusQueueName);

        // Check the queue is empty before the test starts
        while (await receiver.PeekMessageAsync() != null)
        {
            // Empty the queue
            var messageToDelete = await receiver.ReceiveMessageAsync(TimeSpan.FromSeconds(1));
            await receiver.CompleteMessageAsync(messageToDelete);
        }
        Assert.Null(await receiver.PeekMessageAsync());

        // Act

        // Upload MP4 and JSON files to bronze storage
        var mp4BlobClient = new BlobClient(mp4Uri, new DefaultAzureCredential());
        mp4BlobClient.Upload($"assets/{testMp4File}", overwrite: true);

        var jsonBlobClient = new BlobClient(jsonUri, new DefaultAzureCredential());
        jsonBlobClient.Upload($"assets/{testJsonFile}", overwrite: true);

        // Wait for the message in the queue

        // Wait for 5 minutes max
        var message = await receiver.ReceiveMessageAsync(TimeSpan.FromSeconds(300));

        // Assert

        // Check a message was received
        Assert.NotNull(message);

        await receiver.CompleteMessageAsync(message);

        // Check the message corresponds to the input file
        var messageBody = message.Body.ToString();
        var messageObject = JObject.Parse(messageBody);
        var matchingVideoName = messageObject.GetValue("matching_video_name").Value<string>();
        Assert.Equal($"test-video_{uid}.mp4", matchingVideoName);
        Assert.Equal(mp4Uri.ToString(), messageObject.GetValue("matching_video_url").Value<string>());
        Assert.Equal(datasource, messageObject.GetValue("data_source").Value<string>());

        // Check the JSON file has been uploaded to silver storage
        var silverFolderName = matchingVideoName.Split('.')[0];

        var expectJsonlUri = new Uri($"{dataStorageEndpoint}{silverContainer}/{silverFolderName}/parsed_1.json");
        var expectJsonBlobClient = new BlobClient(expectJsonlUri, new DefaultAzureCredential());
        Assert.True(expectJsonBlobClient.Exists());
    }
}
