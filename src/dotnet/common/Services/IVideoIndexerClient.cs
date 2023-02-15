// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
using System;
using System.IO;
using System.Threading.Tasks;
using Common.Security;

namespace Common.Services
{
    public interface IVideoIndexerClient
    {
        Task<string> GetAccessTokenAsync(ArmAccessTokenPermission permission, ArmAccessTokenScope scope, string videoId = null, string projectId = null);
        Task<string> UploadVideoAsync(string accountAccessToken, Uri videoUrl, string videoHashId, string languageCodes, string matchingVideoName);
        Task<string> GetVideoIndexAsync(string accountAccessToken, string videoId);
        Task<string> GetVideoIndexSummaryAsync(string accountAccessToken, string videoId);
        Task<string> GetVideoStreamingUrlAsync(string accountAccessToken, string videoId);
        Task<string> GetVideoSubtitlesFileAsync(string accountAccessToken, string videoId, string language = null);
        Task<Stream> GetVideoThumbnailAsync(string accountAccessToken, string videoId, string thumbnailId);
        Task<string> GetVideoIdByExternalIdAsync(string accountAccessToken, string externalId);
    }
}