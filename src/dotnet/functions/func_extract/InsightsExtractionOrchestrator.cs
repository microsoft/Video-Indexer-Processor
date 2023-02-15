// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
using System;
using System.Threading;
using System.Threading.Tasks;
using Common.Services;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.DurableTask;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Newtonsoft.Json.Linq;
using static Waldo.Functions.Extract.Constants;

namespace Waldo.Insights.Extraction
{
    public partial class InsightsExtraction
    {
        private readonly IVideoIndexerClient videoIndexerClient;
        private readonly InsightsExtractionOptions insightsExtractionOptions;
        private readonly IBlobServiceClient blobServiceClient;
        public InsightsExtraction(IVideoIndexerClient videoIndexerClient, IOptions<InsightsExtractionOptions> insightsExtractionOptions, IBlobServiceClient blobServiceClient)
        {
            if (insightsExtractionOptions == null)
            {
                throw new ArgumentNullException(nameof(insightsExtractionOptions));
            }

            this.videoIndexerClient = videoIndexerClient;
            this.insightsExtractionOptions = insightsExtractionOptions.Value;
            this.blobServiceClient = blobServiceClient;
        }

        /// <summary>
        /// Main Orchestrator to orchestrate upload and insights activities and writing the message to the dataproc queue.
        /// </summary>
        /// <param name="context">Orchestration context which calls the activities</param>
        /// <param name="logger">Logger</param>
        /// <returns>An empty Task object which completes when the orchestration is completed</returns>
        [FunctionName(InsightsExtractionOrchestrator)]
        public static async Task RunOrchestrator(
            [OrchestrationTrigger] IDurableOrchestrationContext context,
            ILogger logger)
        {
            logger = context.CreateReplaySafeLogger(logger);
            try
            {
                JObject message = context.GetInput<JObject>();

                string videoId = await CheckAvailabilityAndCallActivityWithAutomaticRetry(context, CheckVideoIsAvailableActivity, UploadVideoActivity, message, 30, logger);

                message.Add("video_id", videoId);

                _ = await CheckAvailabilityAndCallActivityWithAutomaticRetry(context, GetVideoIndexStatusActivity, StoreInsightsActivity, message, 150, logger);

                // Define parameters for automatic retry
                var retryOptions = new RetryOptions(
                    firstRetryInterval: TimeSpan.FromSeconds(30),
                    maxNumberOfAttempts: 5);

                // Call activity which writes to the dataproc queue
                object queueResult = await context.CallActivityWithRetryAsync<object>(WriteToDataProcQueueActivity, retryOptions, message);
                logger.LogInformation("{prefix} WriteToDataProcQueueActivity completed with result {queueResult}.", LogPrefix, queueResult);
            }
            catch (Exception ex)
            {
                // Log and rethrow exception
                logger.LogError(ex, "{prefix} Main Orchestration failed because a child activity produced an error.", LogPrefix);
                throw;
            }

            return;
        }

        /// <summary>
        /// Calls an availability check regularly in fixed intervals until the needed resource is available then calls the main activity and returns its result.
        /// </summary>
        /// <param name="context">Orchestration context which calls the activities</param>
        /// <param name="availableActivity">Name of an activity which returns true when the resource needed for the main activity is available</param>
        /// <param name="activity">Name of the main activity to call</param>
        /// <param name="message">Message to pass to both activities as input</param>
        /// <param name="delayInSeconds">Interval in seconds in which to call the availability activity ("check every x seconds")</param>
        /// <param name="logger">Logger</param>
        /// <returns>A Task which completes when the main activity is completed, containing the result of the main activity</returns>
        /// <exception cref="Exception">Throws an exception when the resource doesn't become available after 2 hours</exception>
        private static async Task<string> CheckAvailabilityAndCallActivityWithAutomaticRetry(
            IDurableOrchestrationContext context,
            string availableActivity,
            string activity,
            object message,
            double delayInSeconds,
            ILogger logger)
        {
            // Define parameters for automatic retry
            var retryOptions = new RetryOptions(
            firstRetryInterval: TimeSpan.FromSeconds(30),
            maxNumberOfAttempts: 5);

            // Call the function which checks the video availability until it's available
            TimeSpan timeout = TimeSpan.FromMinutes(120);
            DateTime deadline = context.CurrentUtcDateTime.Add(timeout);

            while (context.CurrentUtcDateTime < deadline)
            {
                bool isAvailable = await context.CallActivityAsync<bool>(availableActivity, message);
                if (isAvailable)
                {
                    // Start UploadActivity with automatic retry
                    string result = await context.CallActivityWithRetryAsync<string>(activity, retryOptions, message);
                    logger.LogInformation("{prefix} {activity} completed with result {result}", LogPrefix, activity, result);
                    return result;
                }
                else
                {
                    // Wait for the next checkpoint
                    var nextCheckpoint = context.CurrentUtcDateTime.AddSeconds(delayInSeconds);

                    await context.CreateTimer(nextCheckpoint, CancellationToken.None);
                }
            }

            throw new TimeoutException(availableActivity + " timed out");
        }
    }
}