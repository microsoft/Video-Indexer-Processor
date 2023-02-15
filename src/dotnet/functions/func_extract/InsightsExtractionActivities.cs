// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
using System;
using System.Threading.Tasks;
using Azure;
using Azure.Identity;
using Common.Models;
using Common.Security;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.DurableTask;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json.Linq;
using static Waldo.Functions.Extract.Constants;

namespace Waldo.Insights.Extraction
{
    public partial class InsightsExtraction
    {
        /// <summary>
        /// Checks if the video file exists in the data storage.
        /// </summary>
        /// <param name="message">The input message.</param>
        /// <param name="logger">The logger instance.</param>
        /// <returns>True if video exists in data storage. False if not.</returns>
        [FunctionName(CheckVideoIsAvailableActivity)]
        public async Task<bool> CheckVideoIsAvailable([ActivityTrigger] JObject message, ILogger logger)
        {
            if (message == null)
            {
                throw new ArgumentNullException(nameof(message));
            }
            bool isVideoBlobExists = false;

            var videoUri = message.GetValue("matching_video_url").Value<string>();

            try
            {
                if (Uri.TryCreate(videoUri, UriKind.Absolute, out Uri validBlobUri))
                {
                    var blobClient = this.blobServiceClient.GetBlobClient(validBlobUri, new DefaultAzureCredential());
                    isVideoBlobExists = await blobClient.ExistsAsync();
                }
                else
                {
                    logger.LogError("{prefix} Video Uri {videoUri} format seems invalid.", LogPrefix, videoUri);
                }
            }
            catch (RequestFailedException ex)
            {
                logger.LogError(ex, "{prefix} Blob storage request failed.", LogPrefix);
                throw ex;
            }

            logger.LogInformation("{prefix} Check if video {videoUri} is available on data storage: {isVideoBlobExists}.", LogPrefix, videoUri, isVideoBlobExists);

            return isVideoBlobExists;
        }

        /// <summary>
        /// Uploads the given video, starts indexing it and returns a new video id.
        /// </summary>
        /// <param name="message">The input message.</param>
        /// <param name="logger">The logger instance.</param>
        /// <returns>The video Id.</returns>
        [FunctionName(UploadVideoActivity)]
        public async Task<string> UploadVideo([ActivityTrigger] JObject message, ILogger logger)
        {
            if (message == null)
            {
                throw new ArgumentNullException(nameof(message));
            }
            var videoUrl = message.GetValue("matching_video_url").Value<string>();
            var matchingVideoName = message.GetValue("matching_video_name").Value<string>();
            var videoHashId = message.GetValue("video_hash_id").Value<string>();
            var languageCodes = message.GetValue("language_codes").Value<string>();

            // Get account level access token for video indexer
            var accountAccessToken = await videoIndexerClient.GetAccessTokenAsync(
                ArmAccessTokenPermission.Contributor,
                ArmAccessTokenScope.Account);

            var videoIdByExternalId = await videoIndexerClient.GetVideoIdByExternalIdAsync(accountAccessToken, videoHashId);
            if (!string.IsNullOrWhiteSpace(videoIdByExternalId))
            {
                logger.LogInformation("{prefix} Video already indexed. Video Id: {videoIdByExternalId}.", LogPrefix, videoIdByExternalId);
                return videoIdByExternalId;
            }

            logger.LogInformation("{prefix} Uploading video {matchingVideoName}.", LogPrefix, matchingVideoName);

            // Build the videoUrl with SAS Token
            var videoUri = new Uri(videoUrl);
            var videoUrlWithSas = GetVideoWithSasUri(videoUri, logger);

            // Upload a video
            var videoId = await videoIndexerClient.UploadVideoAsync(accountAccessToken, videoUrlWithSas, videoHashId, languageCodes, matchingVideoName);

            logger.LogInformation("{prefix} Uploaded video {matchingVideoName} successfully. Video Id: {videoId}.", LogPrefix, matchingVideoName, videoId);

            return videoId;
        }

        /// <summary>
        /// Gets the video index and checks its processing state.
        /// </summary>
        /// <param name="message">The input message.</param>
        /// <param name="logger">The logger instance.</param>
        /// <returns>True if video has been processed. False if not.</returns>
        [FunctionName(GetVideoIndexStatusActivity)]
        public async Task<bool> GetVideoIndexStatus([ActivityTrigger] JObject message, ILogger logger)
        {
            if (message == null)
            {
                throw new ArgumentNullException(nameof(message));
            }
            var videoId = message.GetValue("video_id").Value<string>();

            // Get account level access token for video indexer
            var accountAccessToken = await videoIndexerClient.GetAccessTokenAsync(
                ArmAccessTokenPermission.Contributor,
                ArmAccessTokenScope.Account);

            logger.LogInformation("{prefix} Getting video index for {videoId}.", LogPrefix, videoId);

            // Get the video index
            var videoIndex = await videoIndexerClient.GetVideoIndexAsync(accountAccessToken, videoId);

            // Get the video processing state
            var indexObj = JObject.Parse(videoIndex);
            var processingState = indexObj.GetValue("state").Value<string>();

            logger.LogInformation("{prefix} Video processing state for {videoId}: {processingState}.", LogPrefix, videoId, processingState);

            if (processingState == ProcessingState.Processed.ToString())
            {
                return true;
            }

            return false;
        }

        /// <summary>
        /// Gets the video index and save insights to data storage (silver).
        /// </summary>
        /// <param name="message">The input message.</param>
        /// <param name="logger">The logger instance.</param>
        /// <returns>The destination blob Uri (insights)</returns>
        /// <exception cref="InvalidOperationException"></exception>
        [FunctionName(StoreInsightsActivity)]
        public async Task<string> StoreInsights([ActivityTrigger] JObject message, ILogger logger)
        {
            if (message == null)
            {
                throw new ArgumentNullException(nameof(message));
            }
            var videoId = message.GetValue("video_id").Value<string>();
            var matchingVideoName = message.GetValue("matching_video_name").Value<string>();

            var folder = matchingVideoName.Split(".")[0];
            var destinationStorageUri = insightsExtractionOptions.DataStorageUri;
            var containerName = insightsExtractionOptions.SilverContainerName;
            var destinationBlobUri = $"{destinationStorageUri}{containerName}/{folder}/vi_insights.json";

            // Get account level access token for video indexer
            var accountAccessToken = await videoIndexerClient.GetAccessTokenAsync(
                ArmAccessTokenPermission.Contributor,
                ArmAccessTokenScope.Account);

            logger.LogInformation("{prefix} Getting video index for {videoId}.", LogPrefix, videoId);

            // Get the video index
            string videoIndex = await videoIndexerClient.GetVideoIndexAsync(accountAccessToken, videoId);

            // Get the video processing state
            var indexObj = JObject.Parse(videoIndex);
            var processingState = indexObj.GetValue("state").Value<string>();

            if (processingState != ProcessingState.Processed.ToString())
            {
                logger.LogError("{prefix} Insights not available for {videoId}: state {processingState}.", LogPrefix, videoId, processingState);
                throw new InvalidOperationException(processingState);
            }

            logger.LogInformation("{prefix} Saving video insights for {videoId}.", LogPrefix, videoId);

            try
            {
                if (Uri.TryCreate(destinationBlobUri, UriKind.Absolute, out Uri validBlobUri))
                {
                    // Save insights to blob storage
                    var blobClient = this.blobServiceClient.GetBlobClient(validBlobUri, new DefaultAzureCredential());
                    await blobClient.UploadAsync(new BinaryData(videoIndex), overwrite: true);
                }
                else
                {
                    logger.LogError("{prefix} Destination blob Uri {destinationBlobUri} format seems invalid.", LogPrefix, destinationBlobUri);
                }
            }
            catch (RequestFailedException ex)
            {
                logger.LogError(ex, "{prefix} Blob storage request failed.", LogPrefix);
                throw ex;
            }

            logger.LogInformation("{prefix} Video insights saved succesfully for {videoId}.", LogPrefix, videoId);

            return destinationBlobUri;
        }

        /// <summary>
        /// Writes the input message to the dataproc queue
        /// </summary>
        /// <param name="message">The input message.</param>
        /// <param name="logger">The logger instance.</param>
        /// <returns>The message (writes it to the dataproc queue using output binding)</returns>
        [FunctionName(WriteToDataProcQueueActivity)]
        [return: ServiceBus(ServiceBusDataProcQueue, Connection = ServiceBus)]
        public static string WriteToDataProcQueue([ActivityTrigger] JObject message, ILogger logger)
        {
            if (message == null)
            {
                throw new ArgumentNullException(nameof(message));
            }
            logger.LogInformation("{prefix} Writing message to dataproc queue, Message = '{message}'.", LogPrefix, message);
            return message.ToString();
        }
    }
}
