// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
using System;
using System.Threading.Tasks;
using Azure;
using Azure.Core;
using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using Common.Services;
using Microsoft.Extensions.Logging;
using Moq;
using Newtonsoft.Json.Linq;
using Waldo.Insights.Extraction;
using Xunit;

namespace Waldo.Functions.Extract.Tests
{
    public class InsightsExtractionActivitiesTest
    {
        private readonly Mock<IVideoIndexerClient> videoIndexerClientMock;
        private readonly InsightsExtractionOptions insightsExtractionOptions;
        private readonly Microsoft.Extensions.Options.IOptions<InsightsExtractionOptions> insightsExtractionOptionsInterface;
        private readonly Mock<IBlobServiceClient> blobServiceClientMock;
        private readonly InsightsExtraction insightsExtraction;
        private readonly string testToken = "test-token";

        public InsightsExtractionActivitiesTest()
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
        public void WriteToDataprocQueue_Returns_Message()
        {
            // Define constants / objects
            var jsonObject = new JObject() { { "Date", "2022" }, { "VideoName", "Some Video" } };

            var loggerMock = new Mock<ILogger>();

            // Act
            var result = InsightsExtraction.WriteToDataProcQueue(jsonObject, loggerMock.Object);

            // Assert
            Assert.Equal(jsonObject.ToString(), result);
        }

        [Fact]
        public async void CheckVideoIsAvailable_Returns_Result()
        {
            // Define constants / objects
            var videoUrl = "http://foo/bar/";
            var videoUri = new Uri(videoUrl);
            var jsonObject = new JObject() { { "matching_video_url", videoUrl } };

            // Mocks
            var loggerMock = new Mock<ILogger>();
            var mockBlobClient = new Mock<BlobClient>();
            mockBlobClient.Setup(x => x.Uri).Returns(videoUri);

            var response = new Mock<Response<bool>>();
            response.Setup(x => x.Value).Returns(true);

            mockBlobClient.Setup(x => x.ExistsAsync(It.IsAny<System.Threading.CancellationToken>())).Returns(Task.FromResult(response.Object)).Verifiable();

            blobServiceClientMock.Setup(x => x.GetBlobClient(videoUri, It.IsAny<TokenCredential>())).Returns(mockBlobClient.Object).Verifiable();

            // Act
            var result = await insightsExtraction.CheckVideoIsAvailable(jsonObject, loggerMock.Object);

            // Assert
            blobServiceClientMock.Verify();
            mockBlobClient.Verify();
            Assert.True(result);
        }

        [Fact]
        public async void CheckVideoIsAvailable_Rethrows_Exception()
        {
            // Define constants / objects
            var videoUrl = "http://foo/bar/";
            var videoUri = new Uri(videoUrl);
            var jsonObject = new JObject() { { "matching_video_url", videoUrl } };

            // Mocks
            var loggerMock = new Mock<ILogger>();
            blobServiceClientMock.Setup(
                x => x.GetBlobClient(videoUri, It.IsAny<TokenCredential>()))
                .Throws(new RequestFailedException("test"));

            // Assert
            await Assert.ThrowsAsync<RequestFailedException>(() => insightsExtraction.CheckVideoIsAvailable(jsonObject, loggerMock.Object));
        }

        [Fact]
        public async void CheckVideoIsAvailable_Invalid_Uri_Returns_False()
        {
            // Define constants / objects
            var jsonObject = new JObject() { { "matching_video_url", "invalid/url" } };

            // Mocks
            var loggerMock = new Mock<ILogger>();

            // Act
            var result = await insightsExtraction.CheckVideoIsAvailable(jsonObject, loggerMock.Object);

            // Assert
            Assert.False(result);
        }

        [Fact]
        public async void StoreInsights_Video_Processed_Returns_Valid_Blob_Uri()
        {
            // Define constants / objects
            var videoId = "abc123";
            var jsonObject = new JObject() { { "matching_video_name", "test.mp4" }, { "video_id", videoId } };
            var videoIndex = "{\"state\":\"Processed\"}";
            var videoIndexData = new BinaryData(videoIndex);
            var expectedBlobUrl = $"http://foo.com/silver/test/vi_insights.json";
            var expectedBlobUri = new Uri(expectedBlobUrl);

            // Mocks
            var loggerMock = new Mock<ILogger>();
            videoIndexerClientMock.Setup(
                x => x.GetVideoIndexAsync(testToken, videoId)).Returns(Task.FromResult(videoIndex)).Verifiable();

            var mockBlobClient = new Mock<BlobClient>();
            mockBlobClient.Setup(
                x => x.UploadAsync(It.Is<BinaryData>(b => b.ToString().Equals(videoIndex)), true, It.IsAny<System.Threading.CancellationToken>())).Verifiable();

            blobServiceClientMock.Setup(x => x.GetBlobClient(expectedBlobUri, It.IsAny<TokenCredential>())).Returns(mockBlobClient.Object).Verifiable();

            // Act
            var result = await insightsExtraction.StoreInsights(jsonObject, loggerMock.Object);

            // Assert
            videoIndexerClientMock.Verify();
            mockBlobClient.Verify();
            blobServiceClientMock.Verify();
            Assert.Equal(expectedBlobUrl, result);
        }

        [Theory]
        [InlineData("Uploaded")]
        [InlineData("Processing")]
        [InlineData("Failed")]
        public async void StoreInsights_Video_Not_Processed_Throws(string state)
        {
            // Define constants / objects
            var videoId = "abc123";
            var jsonObject = new JObject() { { "matching_video_name", "test.mp4" }, { "video_id", videoId } };
            var videoIndex = "{\"state\":\"" + state + "\"}";

            // Mocks
            var loggerMock = new Mock<ILogger>();
            videoIndexerClientMock.Setup(
                x => x.GetVideoIndexAsync(testToken, videoId)).Returns(Task.FromResult(videoIndex)).Verifiable();

            // Act
            await Assert.ThrowsAsync<InvalidOperationException>(() => insightsExtraction.StoreInsights(jsonObject, loggerMock.Object));

            // Assert
            videoIndexerClientMock.Verify();
        }

        [Theory]
        [InlineData("Uploaded", false)]
        [InlineData("Failed", false)]
        [InlineData("Processing", false)]
        [InlineData("Processed", true)]
        public async void GetVideoIndexStatus_Returns_Value(string state, bool expected)
        {
            // Define constants / objects
            var videoId = "abc123";
            var jsonObject = new JObject() { { "video_id", videoId } };
            var videoIndex = "{\"state\":\"" + state + "\"}";

            // Mocks
            var loggerMock = new Mock<ILogger>();
            videoIndexerClientMock.Setup(
                x => x.GetVideoIndexAsync(testToken, videoId)).Returns(Task.FromResult(videoIndex)).Verifiable();

            // Act
            var result = await insightsExtraction.GetVideoIndexStatus(jsonObject, loggerMock.Object);

            // Assert
            videoIndexerClientMock.Verify();
            Assert.Equal(expected, result);
        }

        [Fact]
        public async void UploadVideo_If_Video_Exists_Returns_Existing_VideoId()
        {
            // Define constants / objects
            var videoHashId = "abc123";
            var videoId = "xyz890";
            var jsonObject = new JObject() {
                { "matching_video_url", "http://foo.bar/test.mp4" },
                { "matching_video_name", "test.mp4" },
                { "video_hash_id", videoHashId },
                { "language_codes", "test" }
            };

            // Mocks
            var loggerMock = new Mock<ILogger>();
            videoIndexerClientMock.Setup(
                x => x.GetVideoIdByExternalIdAsync(testToken, videoHashId)).Returns(Task.FromResult(videoId)).Verifiable();

            // Act
            var result = await insightsExtraction.UploadVideo(jsonObject, loggerMock.Object);

            // Assert
            videoIndexerClientMock.Verify();
            Assert.Equal(videoId, result);
        }

        [Fact]
        public async void UploadVideo_If_Video_Does_Not_Exist_Returns_New_VideoId()
        {
            // Define constants / objects
            var videoHashId = "abc123";
            var videoId = "xyz890";
            var languageCodes = "auto";
            var matchingVideoName = "test.mp4";
            var storageUri = new Uri("https://fake.com/");
            var matchingVideoUrl = "https://fake.com/container/test.mp4";
            var matchingVideoUri = new Uri(matchingVideoUrl);
            var jsonObject = new JObject() {
                { "matching_video_url", matchingVideoUrl },
                { "matching_video_name", matchingVideoName },
                { "video_hash_id", videoHashId },
                { "language_codes", languageCodes }
            };

            // Mocks
            videoIndexerClientMock.Setup(
                x => x.GetVideoIdByExternalIdAsync(testToken, videoHashId)).Returns(Task.FromResult(string.Empty)).Verifiable();

            videoIndexerClientMock.Setup(
               x => x.UploadVideoAsync(testToken, It.Is<Uri>(s => s.OriginalString.Contains("https://fake.com/container/test.mp4")), videoHashId, languageCodes, matchingVideoName))
                .Returns(Task.FromResult(videoId)).Verifiable();

            // Mocks for GetVideoWithSasUri()
            var loggerMock = new Mock<ILogger>();
            var mockBlobClient = new Mock<BlobClient>();
            mockBlobClient.Setup(x => x.Uri).Returns(matchingVideoUri).Verifiable();
            mockBlobClient.Setup(x => x.AccountName).Returns("fake").Verifiable();
            blobServiceClientMock.Setup(x => x.GetBlobClient(matchingVideoUri)).Returns(mockBlobClient.Object).Verifiable();

            var mockBlobServiceClient = new Mock<BlobServiceClient>();
            var key = BlobsModelFactory.UserDelegationKey("a", "b", DateTimeOffset.Now, DateTimeOffset.Now, "c", "d", "Zm9vCg==");
            var response = new Mock<Response<UserDelegationKey>>();
            response.Setup(x => x.Value).Returns(key).Verifiable();
            mockBlobServiceClient.Setup(
                x => x.GetUserDelegationKey(It.IsAny<DateTimeOffset>(), It.IsAny<DateTimeOffset>(), It.IsAny<System.Threading.CancellationToken>()))
                .Returns(response.Object).Verifiable();
            blobServiceClientMock.Setup(
                x => x.GetBlobServiceClient(storageUri, It.IsAny<TokenCredential>()))
                .Returns(mockBlobServiceClient.Object).Verifiable();

            // Act
            var result = await insightsExtraction.UploadVideo(jsonObject, loggerMock.Object);

            // Assert
            videoIndexerClientMock.Verify();
            mockBlobClient.Verify();
            blobServiceClientMock.Verify();
            mockBlobServiceClient.Verify();
            Assert.Equal(videoId, result);
        }
    }
}