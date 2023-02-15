// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
using System;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Azure.WebJobs.Extensions.DurableTask;
using Microsoft.Extensions.Logging;
using Moq;
using Newtonsoft.Json.Linq;
using Waldo.Insights.Extraction;
using Xunit;
using static Waldo.Functions.Extract.Constants;

namespace Waldo.Functions.Extract.Tests
{
    public class InsightsExtractionOrchestratorTest
    {
        [Fact]
        public async Task Run_Orchestrator_Calls_Activity_Functions()
        {
            // Define constants / objects
            var jsonObject = new JObject() { { "Date", "2022" }, { "VideoName", "Some Video" } };
            var videoId = "1234";

            // Mock TraceWriter
            var loggerMock = new Mock<ILogger>();

            // Mock DurableOrchestrationContext
            var mockContext = new Mock<IDurableOrchestrationContext>();

            // Setup Method Mocks
            mockContext.Setup(x => x.CurrentUtcDateTime).Returns(() =>
                {
                    return DateTime.UtcNow;
                }
            );

            mockContext.Setup(x => x.GetInput<JObject>()).Returns(jsonObject);
            mockContext.Setup(x => x.CallActivityAsync<bool>(CheckVideoIsAvailableActivity, jsonObject)).ReturnsAsync(true);
            mockContext.Setup(x => x.CallActivityWithRetryAsync<string>(UploadVideoActivity, It.IsAny<RetryOptions>(), jsonObject)).ReturnsAsync(videoId);

            mockContext.Setup(x => x.CallActivityAsync<bool>(GetVideoIndexStatusActivity, jsonObject)).ReturnsAsync(true);
            mockContext.Setup(x => x.CallActivityWithRetryAsync<string>(StoreInsightsActivity, It.IsAny<RetryOptions>(), jsonObject)).ReturnsAsync("Success");

            mockContext.Setup(x => x.CallActivityWithRetryAsync<object>(WriteToDataProcQueueActivity, It.IsAny<RetryOptions>(), jsonObject)).ReturnsAsync(jsonObject);

            // Act
            await InsightsExtraction.RunOrchestrator(mockContext.Object, loggerMock.Object);

            // Assert
            mockContext.Verify(x => x.CallActivityAsync<bool>(CheckVideoIsAvailableActivity, jsonObject));
            mockContext.Verify(x => x.CallActivityWithRetryAsync<string>(UploadVideoActivity, It.IsAny<RetryOptions>(), jsonObject));

            mockContext.Verify(x => x.CallActivityAsync<bool>(GetVideoIndexStatusActivity, jsonObject));
            mockContext.Verify(x => x.CallActivityWithRetryAsync<string>(StoreInsightsActivity, It.IsAny<RetryOptions>(), jsonObject));

            mockContext.Verify(x => x.CallActivityWithRetryAsync<object>(WriteToDataProcQueueActivity, It.IsAny<RetryOptions>(), jsonObject));
        }

        [Fact]
        public async Task Run_Orchestrator_Availability_Timeout_Throws_Exception()
        {
            // Define constants / objects
            var jsonObject = new JObject() { { "Date", "2022" }, { "VideoName", "Some Video" } };

            // Mock TraceWriter
            var loggerMock = new Mock<ILogger>();

            // Mock DurableOrchestrationContext
            var mockContext = new Mock<IDurableOrchestrationContext>();

            // Setup method mocks
            mockContext.Setup(x => x.CurrentUtcDateTime).Returns(() =>
                {
                    return DateTime.UtcNow;
                }
            );
            mockContext.Setup(x => x.GetInput<JObject>()).Returns(jsonObject);
            mockContext.Setup(x => x.CallActivityAsync<bool>(CheckVideoIsAvailableActivity, jsonObject)).ReturnsAsync(false);
            mockContext.Setup(x => x.CreateTimer(It.IsAny<DateTime>(), It.IsAny<CancellationToken>())).Callback<DateTime, CancellationToken>((DateTime time, CancellationToken ctoken) =>
            {
                mockContext.Setup(x => x.CurrentUtcDateTime).Returns(() =>
                    {
                        return DateTime.UtcNow.Add(TimeSpan.FromMinutes(120));
                    }
                );
            });

            // Act & Assert Exception
            var caughtException = await Assert.ThrowsAsync<TimeoutException>(() => InsightsExtraction.RunOrchestrator(mockContext.Object, loggerMock.Object));

            // Assert
            mockContext.Verify(x => x.CallActivityAsync<bool>(CheckVideoIsAvailableActivity, jsonObject));
            Assert.Equal(CheckVideoIsAvailableActivity + " timed out", caughtException.Message);
        }
    }
}