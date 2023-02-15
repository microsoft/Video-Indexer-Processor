// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
namespace Functions.Tests;

using Azure.Identity;
using Azure.Messaging.ServiceBus;
using Azure.Storage.Blobs;
using Microsoft.Extensions.Configuration;
using Newtonsoft.Json.Linq;

public class FuncExtractIntegrationTests
{
    public readonly IConfiguration config;

    public FuncExtractIntegrationTests(IConfiguration config)
    {
        this.config = config;
    }

    [Fact]
    public async void RunFuncExtractIntegrationTest()
    {
        // Arrange
        var testMessageFile = "extract_message.json";
        var testJsonSilverFile = "parsed_1.json";
        var testMp4File = "test-video.mp4";
        var uid = "0123456789";
        var silverFolderName = testMp4File.Split('.')[0] + "_" + uid;
        var datasource = "TEST-INT";

        var dataStorageEndpoint = config.GetValue<string>("core_data_storage_endpoint");
        var uploadContainer = config.GetValue<string>("core_upload_container");
        var silverContainer = config.GetValue<string>("core_silver_container");
        var serviceBusNamespace = config.GetValue<string>("core_service_bus_namespace");
        var serviceBusExtractQueueName = config.GetValue<string>("core_service_bus_extract_queue");
        var serviceBusDataprocQueueName = config.GetValue<string>("core_service_bus_dataproc_queue");

        // Blob URIs
        var mp4Uri = new Uri($"{dataStorageEndpoint}{uploadContainer}/{datasource}/{uid}/{testMp4File}");
        var jsonSilverUri = new Uri($"{dataStorageEndpoint}{silverContainer}/{silverFolderName}/{testJsonSilverFile}");

        // Service Bus client
        var serviceBusClient = new ServiceBusClient(serviceBusNamespace, new DefaultAzureCredential());
        var receiverExtract = serviceBusClient.CreateReceiver(serviceBusExtractQueueName);
        var receiverDataproc = serviceBusClient.CreateReceiver(serviceBusDataprocQueueName);
        var sender = serviceBusClient.CreateSender(serviceBusExtractQueueName);

        // Check the queue is empty before the test starts
        while (await receiverExtract.PeekMessageAsync() != null)
        {
            // Empty the queue
            var message = await receiverExtract.ReceiveMessageAsync(TimeSpan.FromSeconds(1));
            await receiverExtract.CompleteMessageAsync(message);
        }
        Assert.Null(await receiverExtract.PeekMessageAsync());

        while (await receiverDataproc.PeekMessageAsync() != null)
        {
            // Empty the queue
            var message = await receiverDataproc.ReceiveMessageAsync(TimeSpan.FromSeconds(1));
            await receiverDataproc.CompleteMessageAsync(message);
        }
        Assert.Null(await receiverDataproc.PeekMessageAsync());

        // Act

        // Upload MP4 file to bronze storage
        var mp4BlobClient = new BlobClient(mp4Uri, new DefaultAzureCredential());
        mp4BlobClient.Upload($"assets/{testMp4File}", overwrite: true);

        // Upload JSON files to silver storage
        var jsonSilverBlobClient = new BlobClient(jsonSilverUri, new DefaultAzureCredential());
        jsonSilverBlobClient.Upload($"assets/{testJsonSilverFile}", overwrite: true);

        // Send message in queue
        var jsonText = File.ReadAllText($"assets/{testMessageFile}");
        var jobject = JObject.Parse(jsonText);
        jobject["matching_video_url"] = mp4Uri;
        var messageExtract = new ServiceBusMessage(jobject.ToString());

        await sender.SendMessageAsync(messageExtract);

        // Wait for message to be sent to dataproc queue
        // Wait for 20 minutes max
        var messageDataproc = await receiverDataproc.ReceiveMessageAsync(TimeSpan.FromMinutes(20));

        // Assert

        // Check a message was received
        Assert.NotNull(messageDataproc);

        await receiverDataproc.CompleteMessageAsync(messageDataproc);

        // Check the message corresponds to the input file
        var messageBody = messageDataproc.Body.ToString();
        var messageObject = JObject.Parse(messageBody);
        Assert.Equal("test-video_0123456789.mp4", messageObject.GetValue("matching_video_name").Value<string>());
        Assert.Equal(mp4Uri.ToString(), messageObject.GetValue("matching_video_url").Value<string>());

        // Check that video id was added
        Assert.NotNull(messageObject.GetValue("video_id"));
        Assert.NotEmpty(messageObject.GetValue("video_id").Value<string>());

        // Check the insights files have been uploaded to silver storage
        var expectJsonUri = new Uri($"{dataStorageEndpoint}{silverContainer}/{silverFolderName}/vi_insights.json");
        var expectJsonBlobClient = new BlobClient(expectJsonUri, new DefaultAzureCredential());
        Assert.True(expectJsonBlobClient.Exists());
    }
}
