// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Options;
using Moq;
using webapi.Options;
using webapi.Services;
using Xunit;

namespace api_tests;

public class SearchClientServiceTest
{
  [Fact]
  public void Get_Search_Client_Returns_Correct_Client()
  {
    // arrange
    var mockConfig = new Mock<IConfiguration>();
    var options = new SearchConfigurationOptions() { ServiceName = "testservice", IndexVideos = "testindex" };
    var mockOptions = new Mock<IOptions<SearchConfigurationOptions>>();

    mockOptions.SetupGet(x => x.Value).Returns(options);
    mockConfig.SetupGet(x => x["SEARCH-SERVICE-QUERY-KEY"]).Returns("TESTKEY");

    var searchClientService = new SearchClientService(mockOptions.Object, mockConfig.Object);

    // act
    var client = searchClientService.GetSearchClient();

    // assert
    Assert.Contains(options.ServiceName, client.Endpoint.ToString());
    Assert.Equal(options.IndexVideos, client.IndexName);
    Assert.Equal(options.ServiceName, client.ServiceName);
  }

}