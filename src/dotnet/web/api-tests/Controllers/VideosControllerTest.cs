// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
using System.IO;
using Common.Services;
using Microsoft.AspNetCore.Mvc;
using Moq;
using webapi.Controllers;
using webapi.Services;
using Xunit;

namespace api_tests;

public class VideosControllerTest
{
    [Fact]
    public async void Get_Video_Subtitles_File_Returns_Subtitles()
    {
        // arrange
        var mockVideoIndexerClient = new Mock<IVideoIndexerClient>();
        var mockTokenServices = new Mock<ITokenServices>();


        var videoId = "1234";
        var token = "test-token";
        var subtitleText = "This is a subtitle text";
        var downloadName = "1234.vtt";

        mockTokenServices.Setup(x => x.GetAccessTokenAsync()).ReturnsAsync(token);
        mockVideoIndexerClient.Setup(x => x.GetVideoSubtitlesFileAsync(token, videoId, null)).ReturnsAsync(subtitleText);

        var videosController = new VideosController(mockVideoIndexerClient.Object, mockTokenServices.Object);

        // act
        var result = await videosController.GetVideoSubtitlesFileAsync(videoId, null);

        // assert
        Assert.NotNull(result);
        Assert.IsType<FileStreamResult>(result);
        var fileStreamResult = (FileStreamResult)result;
        Assert.Equal(downloadName, fileStreamResult.FileDownloadName);
        var reader = new StreamReader(fileStreamResult.FileStream);
        string resultText = reader.ReadToEnd();
        Assert.Equal(subtitleText, resultText);
    }

    [Fact]
    public async void Get_Video_Subtitles_File_With_Language_Returns_Correct_Name()
    {
        // arrange
        var mockVideoIndexerClient = new Mock<IVideoIndexerClient>();
        var mockTokenServices = new Mock<ITokenServices>();


        var videoId = "1234";
        var language = "en-US";
        var token = "test-token";
        var subtitleText = "This is a subtitle text";
        var downloadName = "1234_enUS.vtt";

        mockTokenServices.Setup(x => x.GetAccessTokenAsync()).ReturnsAsync(token);
        mockVideoIndexerClient.Setup(x => x.GetVideoSubtitlesFileAsync(token, videoId, language)).ReturnsAsync(subtitleText);

        var videosController = new VideosController(mockVideoIndexerClient.Object, mockTokenServices.Object);

        // act
        var result = await videosController.GetVideoSubtitlesFileAsync(videoId, language);

        // assert
        Assert.NotNull(result);
        Assert.IsType<FileStreamResult>(result);
        var fileStreamResult = (FileStreamResult)result;
        Assert.Equal(downloadName, fileStreamResult.FileDownloadName);
    }

    [Fact]
    public async void Get_Thumbnail_Doesnt_Exist_Returns_Not_Found()
    {
        // arrange
        var mockVideoIndexerClient = new Mock<IVideoIndexerClient>();
        var mockTokenServices = new Mock<ITokenServices>();


        var videoId = "1234";
        var thumbnailId = "5678";
        var token = "test-token";

        mockTokenServices.Setup(x => x.GetAccessTokenAsync()).ReturnsAsync(token);

        var videosController = new VideosController(mockVideoIndexerClient.Object, mockTokenServices.Object);

        // act
        var result = await videosController.GetVideoThumbnailAsync(videoId, thumbnailId);

        // assert
        Assert.NotNull(result);
        Assert.IsType<NotFoundResult>(result);
    }
}