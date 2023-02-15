// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.IO;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text.Json;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using System.Web;
using Common.Models;
using Common.Options;
using Common.Security;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Common.Services
{
    public class VideoIndexerClient : IVideoIndexerClient
    {
        private static Regex viGenTokenUrlRegex;
        private const string ApiVersion = "2021-11-10-preview";
        private const string ApiUrl = "https://api.videoindexer.ai";
        private const string AzureResourceManager = "https://management.azure.com";
        private readonly string LogPrefix = Environment.GetEnvironmentVariable("LOG_PREFIX") + "[common]";

        private readonly IAzureResourceClient armClient;
        private readonly VideoIndexerOptions settings;
        private readonly IHttpClientFactory httpClientFactory;
        private readonly ILogger<VideoIndexerClient> logger;
        public VideoIndexerClient(
            IAzureResourceClient armClient,
            IOptions<VideoIndexerOptions> settings,
            IHttpClientFactory httpClientFactory,
            ILogger<VideoIndexerClient> logger)
        {
            this.armClient = armClient;
            this.settings = settings?.Value;
            this.logger = logger;

            this.httpClientFactory = httpClientFactory;
            // regex for subscriptionId & rg: https://docs.microsoft.com/en-us/rest/api/securitycenter/tasks/get-resource-group-level-task
            // regex for vi account name: https://docs.microsoft.com/fr-fr/rest/api/videoindexer/classic-accounts/get-details
            viGenTokenUrlRegex = new Regex("^https://management\\.azure\\.com/subscriptions/[0-9A-Fa-f]{8}-([0-9A-Fa-f]{4}-){3}[0-9A-Fa-f]{12}/resourcegroups/[-\\w\\._\\(\\)]+/providers/Microsoft\\.VideoIndexer/accounts/[A-Za-z0-9-]+/generateAccessToken\\?api-version=2021-11-10-preview$");
        }

        private static string CreateQueryString(IDictionary<string, string> parameters)
        {
            var queryParameters = HttpUtility.ParseQueryString(string.Empty);
            foreach (var parameter in parameters)
            {
                queryParameters[parameter.Key] = parameter.Value;
            }

            return queryParameters.ToString();
        }

        /// <summary>
        /// Generates an access token.
        /// </summary>
        /// <param name="permission">The permission for the access token</param>
        /// <param name="scope">The scope of the access token</param>
        /// <param name="videoId">If the scope is video, this is the video id</param>
        /// <param name="projectId">If the scope is project, this is the project id</param>
        /// <returns>The access token, otherwise throws an exception</returns>
        /// <exception cref="InvalidOperationException"></exception>
        public async Task<string> GetAccessTokenAsync(
            ArmAccessTokenPermission permission,
            ArmAccessTokenScope scope,
            string videoId = null,
            string projectId = null)
        {
            logger.LogInformation("{Prefix} Getting access token with permission {Permission} and scope {Scope}.", LogPrefix, permission, scope);

            var armAccessToken = await armClient.GetArmAccessTokenAsync().ConfigureAwait(false);

            using var httpClient = httpClientFactory.CreateClient();
            httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", armAccessToken);

            // Set http request content (to call generateAccessToken)
            var accessTokenRequest = new AccessTokenRequest()
            {
                PermissionType = permission,
                Scope = scope,
                VideoId = videoId,
                ProjectId = projectId
            };

            var requestBody = JsonSerializer.Serialize(accessTokenRequest);
            using var httpContent = new StringContent(requestBody, System.Text.Encoding.UTF8, "application/json");

            var url = new Uri($"{AzureResourceManager}/subscriptions/{settings.SubscriptionId}/resourcegroups/{settings.ResourceGroup}/providers/Microsoft.VideoIndexer/accounts/{settings.AccountName}/generateAccessToken?api-version={ApiVersion}");

            ValidateRequestUri(url);
            var response = await httpClient.PostAsync(url, httpContent).ConfigureAwait(false);

            if (response.IsSuccessStatusCode)
            {
                var responseBody = await response.Content.ReadAsStringAsync().ConfigureAwait(false);
                var accessToken = JsonSerializer.Deserialize<AccessTokenResponse>(responseBody).AccessToken;

                logger.LogInformation("{Prefix} Got access token with permission {Permission} and scope {Scope}.", LogPrefix, permission, scope);
                return accessToken;
            }
            else
            {
                logger.LogError("{Prefix} Call to generateAccessToken failed. Status code: {StatusCode}.", LogPrefix, response.StatusCode);
                throw new InvalidOperationException(response.ToString());
            }
        }

        /// <summary>
        /// Validates a Video Indexer Token Generation URL.
        /// </summary>
        /// <param name="uri">The token generation URL to be validated</param>
        /// <exception cref="ValidationException">When the URL is not validated against the REGEX.</exception>
        public static void ValidateRequestUri(Uri uri)
        {
            if (!viGenTokenUrlRegex.IsMatch(uri?.OriginalString))
            {
                throw new ValidationException("URI is not valid");
            }
        }
        /// <summary>
        /// Uploads a video and starts the video index. 
        /// Calls the uploadVideo API (https://api-portal.videoindexer.ai/api-details#api=Operations&operation=Upload-Video).
        /// </summary>
        /// <param name="accountAccessToken">The access token</param>
        /// <param name="videoUrl">The video url</param>
        /// <param name="videoHashId">The video id (hashed)</param>
        /// <param name="languageCodes">Language codes</param>
        /// <param name="matchingVideoName">The video name (used for description)</param>
        /// <returns>Video Id of the video being indexed, otherwise throws exception</returns>
        /// <exception cref="InvalidOperationException"></exception>
        public async Task<string> UploadVideoAsync(
            string accountAccessToken,
            Uri videoUrl,
            string videoHashId,
            string languageCodes,
            string matchingVideoName)
        {
            logger.LogInformation("{Prefix} Video for account {AccountId} is starting to upload.", LogPrefix, settings.AccountId);

            using var httpClient = httpClientFactory.CreateClient();

            var queryParams = CreateQueryString(new Dictionary<string, string>()
            {
                {"accessToken", accountAccessToken},
                {"name", videoHashId},
                {"description", matchingVideoName},
                {"privacy", "Private"},
                {"externalId", videoHashId},
                {"videoUrl", videoUrl?.OriginalString},
                {"language", languageCodes},
                {"indexingPreset", "Advanced"}
            });

            // Uploads a video and starts the video index.
            using var httpContent = new MultipartFormDataContent();
            var url = new Uri($"{ApiUrl}/{settings.AccountLocation}/Accounts/{settings.AccountId}/Videos?{queryParams}");

            var response = await httpClient.PostAsync(url, httpContent).ConfigureAwait(false);

            if (response.IsSuccessStatusCode)
            {
                // Get the video ID from the upload result
                var uploadResult = await response.Content.ReadAsStringAsync().ConfigureAwait(false);
                var videoId = JsonSerializer.Deserialize<Video>(uploadResult).Id;

                logger.LogInformation("{Prefix} Video was uploaded successfully. Video id returned: {VideoId}.", LogPrefix, videoId);
                return videoId;
            }
            else
            {
                logger.LogError("{Prefix} Call to uploadVideo failed. Status code: {StatusCode}.", LogPrefix, response.StatusCode);
                throw new InvalidOperationException(response.ToString());
            }
        }

        /// <summary>
        /// Gets the video index.
        /// Calls getVideoIndex API (https://api-portal.videoindexer.ai/api-details#api=Operations&operation=Get-Video-Index).
        /// </summary>
        /// <param name="accountAccessToken">The access token</param>
        /// <param name="videoId">The video id</param>
        /// <returns>The video index, otherwise throws an exception</returns>
        /// <exception cref="InvalidOperationException"></exception>
        public async Task<string> GetVideoIndexAsync(string accountAccessToken, string videoId)
        {
            logger.LogInformation("{Prefix} Retrieving index for video {VideoId}.", LogPrefix, videoId);

            using var httpClient = httpClientFactory.CreateClient();

            var queryParams = CreateQueryString(new Dictionary<string, string>()
            {
                {"accessToken", accountAccessToken},
                {"language", "English"},
            });

            // Gets the video index.
            var url = new Uri($"{ApiUrl}/{settings.AccountLocation}/Accounts/{settings.AccountId}/Videos/{videoId}/Index?{queryParams}");
            var response = await httpClient.GetAsync(url).ConfigureAwait(false);

            if (response.IsSuccessStatusCode)
            {
                var videoGetIndexResult = await response.Content.ReadAsStringAsync().ConfigureAwait(false);

                logger.LogInformation("{Prefix} Retrieved successfully index for video {VideoId}.", LogPrefix, videoId);
                return videoGetIndexResult;
            }
            else
            {
                logger.LogError("{Prefix} Call to getVideoIndex failed. Status code: {StatusCode}.", LogPrefix, response.StatusCode);
                throw new InvalidOperationException(response.ToString());
            }
        }

        /// <summary>
        /// Gets the video index summary.
        /// Calls getVideoIndex API (https://api-portal.videoindexer.ai/api-details#api=Operations&operation=Get-Video-Index).
        /// Returns only a summary of the Video, without deprecated values and insights.
        /// </summary>
        /// <param name="accountAccessToken">The access token</param>
        /// <param name="videoId">The video id</param>
        /// <returns>The video index, otherwise throws an exception</returns>
        /// <exception cref="InvalidOperationException"></exception>
        public async Task<string> GetVideoIndexSummaryAsync(string accountAccessToken, string videoId)
        {
            logger.LogInformation("{Prefix} Retrieving index summary for video {VideoId}", LogPrefix, videoId);

            using var httpClient = httpClientFactory.CreateClient();

            var queryParams = CreateQueryString(new Dictionary<string, string>()
            {
                {"accessToken", accountAccessToken},
                {"language", "English"},
                {"includedInsights", "transcript"},
                {"includeSummarizedInsights", "false"}
            });

            // Gets the video index (summary version).
            var url = new Uri($"{ApiUrl}/{settings.AccountLocation}/Accounts/{settings.AccountId}/Videos/{videoId}/Index?{queryParams}");
            var response = await httpClient.GetAsync(url).ConfigureAwait(false);

            if (response.IsSuccessStatusCode)
            {
                var videoGetIndexResult = await response.Content.ReadAsStringAsync().ConfigureAwait(false);

                logger.LogInformation("{Prefix} Retrieved successfully index summary for video {VideoId}.", LogPrefix, videoId);
                return videoGetIndexResult;
            }
            else
            {
                logger.LogError("{Prefix} Call to getVideoIndex (summary) failed. Status code: {StatusCode}.", LogPrefix, response.StatusCode);
                throw new InvalidOperationException(response.ToString());
            }
        }

        /// <summary>
        /// Gets the video id by external id.
        /// Calls getVideoIdByExternalId API (https://api-portal.videoindexer.ai/api-details#api=Operations&operation=Get-Video-Id-By-External-Id).
        /// </summary>
        /// <param name="accountAccessToken">The access token</param>
        /// <param name="externalId">The external id</param>
        /// <returns>The video id, otherwise returns an empty string</returns>
        /// <exception cref="InvalidOperationException"></exception>
        public async Task<string> GetVideoIdByExternalIdAsync(string accountAccessToken, string externalId)
        {
            logger.LogInformation("{Prefix} Retrieving videoId using externalId {ExternalId}.", LogPrefix, externalId);

            using var httpClient = httpClientFactory.CreateClient();

            var queryParams = CreateQueryString(new Dictionary<string, string>()
            {
                {"accessToken", accountAccessToken},
                {"externalId", externalId},
            });

            // Gets the video id by external id.
            var url = new Uri($"{ApiUrl}/{settings.AccountLocation}/Accounts/{settings.AccountId}/Videos/GetIdByExternalId?{queryParams}");
            var response = await httpClient.GetAsync(url).ConfigureAwait(false);

            if (response.IsSuccessStatusCode)
            {
                var videoGetIdByExternalIdResult = await response.Content.ReadAsStringAsync().ConfigureAwait(false);
                var videoId = videoGetIdByExternalIdResult.Trim('\"');

                logger.LogInformation("{Prefix} Retrieved videoId {VideoId} using externalId {ExternalId}.", LogPrefix, videoId, externalId);
                return videoId;
            }
            else if (response.StatusCode == System.Net.HttpStatusCode.NotFound)
            {
                logger.LogInformation("{Prefix} Didn't find videoId using externalId {ExternalId}.", LogPrefix, externalId);
                return string.Empty;
            }
            else
            {
                logger.LogError("{Prefix} Call to getVideoIdByExternalId failed. Status code: {StatusCode}.", LogPrefix, response.StatusCode);
                throw new InvalidOperationException(response.ToString());
            }
        }

        /// <summary>
        /// Gets the video streaming url.
        /// Calls getVideoStreamingUrl API (https://api-portal.videoindexer.ai/api-details#api=Operations&operation=Get-Video-Streaming-URL).
        /// </summary>
        /// <param name="accountAccessToken">The access token</param>
        /// <param name="videoId">The video id</param>
        /// <returns>The video streaming url (JWT and URL), otherwise throws exception</returns>
        /// <exception cref="InvalidOperationException"></exception>
        public async Task<string> GetVideoStreamingUrlAsync(string accountAccessToken, string videoId)
        {
            logger.LogInformation("{Prefix} Retrieving streaming url for video {VideoId}.", LogPrefix, videoId);

            using var httpClient = httpClientFactory.CreateClient();

            var queryParams = CreateQueryString(new Dictionary<string, string>()
            {
                {"accessToken", accountAccessToken},
                {"language", "English"},
                {"urlFormat", "HLS_V4"}
            });

            // Gets the video streaming url.
            var url = new Uri($"{ApiUrl}/{settings.AccountLocation}/Accounts/{settings.AccountId}/Videos/{videoId}/streaming-url?{queryParams}");
            var response = await httpClient.GetAsync(url).ConfigureAwait(false);

            if (response.IsSuccessStatusCode)
            {
                var videoGetStreamingUrl = await response.Content.ReadAsStringAsync().ConfigureAwait(false);

                logger.LogInformation("{Prefix} Retrieved successfully streaming url for video {VideoId}.", LogPrefix, videoId);
                return videoGetStreamingUrl;
            }
            else
            {
                logger.LogError("{Prefix} Call to getVideoStreamingUrl failed. Status code: {StatusCode}.", LogPrefix, response.StatusCode);
                throw new InvalidOperationException(response.ToString());
            }
        }

        /// <summary>
        /// Gets the video captions.
        /// Calls getVideoCaptions API (https://api-portal.videoindexer.ai/api-details#api=Operations&operation=Get-Video-Captions).
        /// </summary>
        /// <param name="accountAccessToken">The access token</param>
        /// <param name="videoId">The video id</param>
        /// <param name="language">The language used to retrieve subtitles</param>
        /// <returns>The video captions string, otherwise throws exception</returns>
        /// <exception cref="InvalidOperationException"></exception>
        public async Task<string> GetVideoSubtitlesFileAsync(string accountAccessToken, string videoId, string language = null)
        {
            logger.LogInformation("{Prefix} Retrieving video subtitles file for video {VideoId} and language {Language}.", LogPrefix, videoId, language);

            using var httpClient = httpClientFactory.CreateClient();

            var queryParamsDictionary = new Dictionary<string, string>()
            {
                {"indexId", videoId},
                {"includeSpeakers", "false"},
                {"accessToken", accountAccessToken},
                {"format", "Vtt "},
            };

            if (!string.IsNullOrEmpty(language))
            {
                queryParamsDictionary.Add("language", language);
            }

            // Gets the video captions.
            var queryParams = CreateQueryString(queryParamsDictionary);
            var url = new Uri($"{ApiUrl}/{settings.AccountLocation}/Accounts/{settings.AccountId}/Videos/{videoId}/Captions?{queryParams}");
            var response = await httpClient.GetAsync(url).ConfigureAwait(false);

            if (response.IsSuccessStatusCode)
            {
                var videoGetCaptions = await response.Content.ReadAsStringAsync().ConfigureAwait(false);

                logger.LogInformation("{Prefix} Retrieved successfully video subtitles file for video {VideoId} and language {Language}.", LogPrefix, videoId, language);
                return videoGetCaptions;
            }
            else
            {
                logger.LogError("{Prefix} Call to getVideoCaptions failed. Status code: {StatusCode}.", LogPrefix, response.StatusCode);
                throw new InvalidOperationException(response.ToString());
            }
        }

        /// <summary>
        /// Gets the video thumbnail.
        /// Calls getVideoThumbnail API (https://api-portal.videoindexer.ai/api-details#api=Operations&operation=Get-Video-Thumbnail).
        /// Returns the thumbnail stream as a Jpeg file.
        /// </summary>
        /// <param name="accountAccessToken">The access token</param>
        /// <param name="videoId">The video id</param>
        /// <param name="thumbnailId">The thumbnail id</param>
        /// <returns>The thumbnail stream, otherwise throws exception</returns>
        /// <exception cref="InvalidOperationException"></exception>
        public async Task<Stream> GetVideoThumbnailAsync(string accountAccessToken, string videoId, string thumbnailId)
        {
            logger.LogInformation("{Prefix} Retrieving video thumbnail {ThumbnailId} for video {VideoId}", LogPrefix, thumbnailId, videoId);

            using var httpClient = httpClientFactory.CreateClient();

            var queryParams = CreateQueryString(new Dictionary<string, string>()
            {
                {"accessToken", accountAccessToken},
                {"format", "Jpeg"},
            });

            // Gets the video thumbnail.
            var url = new Uri($"{ApiUrl}/{settings.AccountLocation}/Accounts/{settings.AccountId}/Videos/{videoId}/Thumbnails/{thumbnailId}?{queryParams}");
            var response = await httpClient.GetAsync(url).ConfigureAwait(false);

            if (response.IsSuccessStatusCode)
            {
                var result = await response.Content.ReadAsStreamAsync().ConfigureAwait(false);

                logger.LogInformation("{Prefix} Retrieved successfully video thumbnail {ThumbnailId} for video {VideoId}", LogPrefix, thumbnailId, videoId);
                return result;
            }
            else
            {
                logger.LogError("{Prefix} Call to getVideoThumbnail failed. Status code: {StatusCode}.", LogPrefix, response.StatusCode);
                throw new InvalidOperationException(response.ToString());
            }
        }
    }
}