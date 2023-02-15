// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
using System.Threading.Tasks;
using Microsoft.Azure.WebJobs.Extensions.DurableTask;
using Microsoft.Extensions.Logging;
using Moq;
using Newtonsoft.Json.Linq;
using Waldo.Insights.Extraction;
using Xunit;
using Common.Services;
using System;
using static Waldo.Functions.Extract.Constants;

namespace Waldo.Functions.Extract.Tests
{
    public class InsightsExtractionTriggerTest
    {

        private Mock<IVideoIndexerClient> videoIndexerClientMock;
        private InsightsExtractionOptions insightsExtractionOptions;
        private Microsoft.Extensions.Options.IOptions<InsightsExtractionOptions> insightsExtractionOptionsInterface;
        private Mock<IBlobServiceClient> blobServiceClientMock;
        private InsightsExtraction insightsExtraction;
        private string testToken = "test-token";

        public InsightsExtractionTriggerTest()
        {
            videoIndexerClientMock = new Mock<IVideoIndexerClient>();
            videoIndexerClientMock.Setup(
                    x => x.GetAccessTokenAsync(
                        Common.Security.ArmAccessTokenPermission.Contributor, Common.Security.ArmAccessTokenScope.Account, null, null))
                .Returns(Task.FromResult(testToken)).Verifiable();

            insightsExtractionOptions = new InsightsExtractionOptions()
            {
                DataStorageUri = new Uri("http://foo.com/"),
                BronzeContainerName = "bronze",
                SilverContainerName = "silver"
            };
            insightsExtractionOptionsInterface = Microsoft.Extensions.Options.Options.Create<InsightsExtractionOptions>(insightsExtractionOptions);

            blobServiceClientMock = new Mock<IBlobServiceClient>();

            insightsExtraction = new InsightsExtraction(videoIndexerClientMock.Object, insightsExtractionOptionsInterface, blobServiceClientMock.Object);
        }
        [Fact]
        public async Task ServiceBusQueueTrigger_Calls_MainOrchestrator()
        {
            // Define constants / objects
            const string instanceId = "7E467BDB-213F-407A-B86A-1954053D3C24";
            object jsonObject = new JObject() { { "Date", "2022" }, { "VideoName", "Some Video" } };

            // Setup Mocks
            var durableClientMock = new Mock<IDurableClient>();
            var loggerMock = new Mock<ILogger>();

            // Setup Method Mocks
            durableClientMock.
                Setup(x => x.StartNewAsync(InsightsExtractionOrchestrator, It.IsAny<object>())).
                ReturnsAsync(instanceId);

            // Act
            await InsightsExtraction.Run(jsonObject, durableClientMock.Object, loggerMock.Object);

            // Assert
            durableClientMock.Verify(x => x.StartNewAsync(InsightsExtractionOrchestrator, jsonObject));
        }
    }
}