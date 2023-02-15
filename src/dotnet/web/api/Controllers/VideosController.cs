// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
using System.Diagnostics.CodeAnalysis;
using System.IO;
using System.Text;
using System.Threading.Tasks;
using Common.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json.Linq;
using webapi.Services;

namespace webapi.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class VideosController : ControllerBase
    {
        public VideosController(IVideoIndexerClient videoIndexerClient, ITokenServices tokenServices)
        {
            VideoIndexerClient = videoIndexerClient;
            TokenServices = tokenServices;
        }

        public IVideoIndexerClient VideoIndexerClient { get; }
        public ITokenServices TokenServices { get; }

        /// <summary>
        /// Gets the video summary, without deprecated insights and only transcript in the insights node
        /// </summary>
        /// <param name="videoId"> The video id </param>
        /// <returns> The video index summary, otherwise throws exception </returns>
        [HttpGet("{videoId}/summary")]
        [ExcludeFromCodeCoverage]
        public async Task<JObject> GetVideoIndexSummaryAsync(string videoId)
        {
            var token = await this.TokenServices.GetAccessTokenAsync();
            var video = await this.VideoIndexerClient.GetVideoIndexSummaryAsync(token, videoId);
            return JObject.Parse(video);
        }


        /// <summary>
        /// Gets the video index, with all the insights
        /// </summary>
        /// <param name="videoId"> The video id </param>
        /// <returns> The video index, otherwise throws exception </returns>
        [HttpGet("{videoId}/index")]
        [ExcludeFromCodeCoverage]
        public async Task<JObject> GetVideoIndexAsync(string videoId)
        {
            var token = await this.TokenServices.GetAccessTokenAsync();
            var video = await this.VideoIndexerClient.GetVideoIndexAsync(token, videoId);
            return JObject.Parse(video);
        }

        /// <summary>
        /// Gets the video streaming url and the jwt token associated
        /// </summary>
        /// <param name="videoId"> The video id </param>
        /// <returns> The video streaming url and jwt, otherwise throws exception </returns>
        [HttpGet("{videoId}/streamingurl")]
        [ExcludeFromCodeCoverage]
        public async Task<JObject> GetVideoStreamingUrlAsync(string videoId)
        {
            var token = await this.TokenServices.GetAccessTokenAsync();
            var streamingUrlString = await this.VideoIndexerClient.GetVideoStreamingUrlAsync(token, videoId);
            return JObject.Parse(streamingUrlString);
        }

        /// <summary>
        /// Gets the video subtitles file
        /// </summary>
        /// <param name="videoId"> The video id </param>
        /// <param name="language"> The caption language requested. if null, the default language analyzed by Video Indexer will be returned </param>
        /// <returns> The video subtitles file for the given language, otherwise throws exception </returns>
        [HttpGet("{videoId}/subtitlesfile")]
        public async Task<IActionResult> GetVideoSubtitlesFileAsync(string videoId, string language = null)
        {
            var token = await this.TokenServices.GetAccessTokenAsync();
            var subtitlesText = await this.VideoIndexerClient.GetVideoSubtitlesFileAsync(token, videoId, language);
            var memoryStream = new MemoryStream(Encoding.UTF8.GetBytes(subtitlesText));

            if (memoryStream.Length == 0)
                return NotFound();

            var downloadName = $"{videoId}.vtt";
            if (!string.IsNullOrEmpty(language))
                downloadName = $"{videoId}_{language.Replace("-", "")}.vtt";

            return File(memoryStream, "application/octet-stream", fileDownloadName: downloadName); // returns a FileStreamResult
        }


        /// <summary>
        /// Gets video related thumbnail image file
        /// </summary>
        /// <param name="videoId"> The video id </param>
        /// <param name="thumbnailId"> The thumbnail id </param>
        /// <returns> The thumbnail image file, otherwise throws exception </returns>
        [HttpGet("{videoId}/thumbnails/{thumbnailId}")]
        public async Task<IActionResult> GetVideoThumbnailAsync(string videoId, string thumbnailId)
        {
            var token = await this.TokenServices.GetAccessTokenAsync();
            var thumbnailStream = await this.VideoIndexerClient.GetVideoThumbnailAsync(token, videoId, thumbnailId);

            if (thumbnailStream == null)
                return NotFound();

            return File(thumbnailStream, "image/jpeg"); // returns a FileStreamResult
        }
    }
}