// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
using System;
using Azure;
using Azure.Core;
using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using Common.Services;
using Microsoft.Extensions.Logging;
using Moq;
using Waldo.Insights.Extraction;
using Xunit;

namespace Waldo.Functions.Extract.Tests
{
    public class InsightsExtractionHelpersTest
    {
        [Fact]
        public void GetVideoWithSasUri_Returns_Uri()
        {
            // Define constants / objects
            string storageUrl = "https://fake.com/";
            var storageUri = new Uri(storageUrl);

            string videoUrl = "https://fake.com/container/blob.mp4";
            var videoUri = new Uri(videoUrl);

            var videoIndexerClientMock = new Mock<IVideoIndexerClient>();
            var insightsExtractionOptionsMock = new Mock<Microsoft.Extensions.Options.IOptions<InsightsExtractionOptions>>();
            var blobServiceClientMock = new Mock<IBlobServiceClient>();
            var loggerMock = new Mock<ILogger>();
            var insightsExtraction = new InsightsExtraction(videoIndexerClientMock.Object, insightsExtractionOptionsMock.Object, blobServiceClientMock.Object);

            var mockBlobClient = new Mock<BlobClient>();
            mockBlobClient.Setup(x => x.Uri).Returns(videoUri);
            mockBlobClient.Setup(x => x.AccountName).Returns("fake");
            blobServiceClientMock.Setup(x => x.GetBlobClient(videoUri)).Returns(mockBlobClient.Object);

            var mockBlobServiceClient = new Mock<BlobServiceClient>();
            var key = BlobsModelFactory.UserDelegationKey("a", "b", DateTimeOffset.Now, DateTimeOffset.Now, "c", "d", "Zm9vCg==");
            var response = new Mock<Response<UserDelegationKey>>();
            response.Setup(x => x.Value).Returns(key);
            mockBlobServiceClient.Setup(x => x.GetUserDelegationKey(It.IsAny<DateTimeOffset>(), It.IsAny<DateTimeOffset>(), It.IsAny<System.Threading.CancellationToken>())).Returns(response.Object);
            blobServiceClientMock.Setup(x => x.GetBlobServiceClient(storageUri, It.IsAny<TokenCredential>())).Returns(mockBlobServiceClient.Object);

            var result = insightsExtraction.GetVideoWithSasUri(videoUri, loggerMock.Object);

            // Assert
            Assert.Contains("https://fake.com/container/blob.mp4", result.OriginalString);
        }
    }
}