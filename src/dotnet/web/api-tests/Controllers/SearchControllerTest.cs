// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
using System;
using System.Collections.Generic;
using System.Threading;
using Azure;
using Azure.Search.Documents;
using Azure.Search.Documents.Models;
using Moq;
using webapi.Controllers;
using webapi.Models;
using webapi.Services;
using Xunit;

namespace api_tests;

public class SearchControllerTest
{

  [Fact]
  public async void Search_Video_Returns_Two_Videos()
  {
    // arrange
    // Create mocks
    var mockSearchClientService = new Mock<ISearchClientService>();
    var mockSearchClient = new Mock<SearchClient>();
    var mockTokenServices = new Mock<ITokenServices>();

    // Create video results
    var videoIdKey = "videoId";
    var videoId1 = "1234";
    var videoId2 = "5678";
    var keywordKey = "metadata_keyword";
    String[] keyword = { "Europe", "Art" };
    var searchDocument1 = new SearchDocument(
        new Dictionary<string, object>() { [videoIdKey] = videoId1, [keywordKey] = keyword });
    var searchResult1 = SearchModelFactory.SearchResult<SearchDocument>(searchDocument1, 1.0, null);
    var searchDocument2 = new SearchDocument(
    new Dictionary<string, object>() { [videoIdKey] = videoId2, [keywordKey] = keyword });
    var searchResult2 = SearchModelFactory.SearchResult<SearchDocument>(new SearchDocument(searchDocument2), 0.9, null);

    // mock search response
    var mockResponse = new Mock<Response>();
    var mockResults = SearchModelFactory.SearchResults<SearchDocument>(new[]
   {
            searchResult1,
            searchResult2,
        }, 2, null, null, rawResponse: mockResponse.Object);

    // create payload
    var query = "Europe and Art";

    var payload = new RequestBodySearch()
    {
      SearchText = query,
      Size = 5,
      Skip = 1,
      Filters = new List<webapi.Models.SearchFilter>() { },
      Select = new List<string>() { },
      SearchMode = "Something",
      SearchType = "NotFuzzy"
    };

    // setup mock to return mocked search response and use callback to store calling parameters for later assertions
    string actualQuery = "";
    var actualOptions = new SearchOptions();

    mockSearchClient.Setup(x => x.SearchAsync<SearchDocument>(query, It.IsAny<SearchOptions>(), default)).ReturnsAsync(Response.FromValue(mockResults, mockResponse.Object)).Callback<string, SearchOptions, CancellationToken>((q, s, c) =>
    {
      actualQuery = q;
      actualOptions = s;
    });

    mockSearchClientService.Setup(x => x.GetSearchClient()).Returns(mockSearchClient.Object);

    // create searchController
    var searchController = new SearchController(mockTokenServices.Object, mockSearchClientService.Object);

    // act
    var result = await searchController.Search(payload);

    // assert
    Assert.Equal(query, actualQuery);
    Assert.Null(actualOptions.Filter);
    Assert.Empty(actualOptions.Select);
    Assert.Equal(SearchMode.Any, actualOptions.SearchMode);
    Assert.Equal(SearchQueryType.Simple, actualOptions.QueryType);

    Assert.NotNull(result);
    Assert.NotNull(result.Value);
    var searchOutput = (result.Value as SearchOutput);
    if (searchOutput != null)
    {
      Assert.Equal(2, searchOutput.Count);
      Assert.Contains(searchResult1, searchOutput.Results);
      Assert.Contains(searchResult2, searchOutput.Results);
    }
  }

  [Fact]
  public async void Search_Video_With_Options_Uses_Correct_Options()
  {
    // arrange
    // Create mocks
    var mockSearchClientService = new Mock<ISearchClientService>();
    var mockSearchClient = new Mock<SearchClient>();
    var mockTokenServices = new Mock<ITokenServices>();

    // Create video results
    var videoIdKey = "videoId";
    var videoId1 = "1234";
    var videoId2 = "5678";
    var keywordKey = "metadata_keyword";
    String[] keyword = { "Europe", "Art" };
    var searchDocument1 = new SearchDocument(
        new Dictionary<string, object>() { [videoIdKey] = videoId1, [keywordKey] = keyword });
    var searchResult1 = SearchModelFactory.SearchResult<SearchDocument>(searchDocument1, 1.0, null);
    var searchDocument2 = new SearchDocument(
    new Dictionary<string, object>() { [videoIdKey] = videoId2, [keywordKey] = keyword });
    var searchResult2 = SearchModelFactory.SearchResult<SearchDocument>(new SearchDocument(searchDocument2), 0.9, null);

    // mock search response
    var mockResponse = new Mock<Response>();
    var mockResults = SearchModelFactory.SearchResults<SearchDocument>(new[]
    {
      searchResult1,
      searchResult2,
    }, 2, null, null, rawResponse: mockResponse.Object);

    // create filter expressions
    var filter1 = new webapi.Models.SearchFilter() { Field = "language_code", Value = "en-US" };
    var filter2 = new webapi.Models.SearchFilter() { Field = "authors", Value = "Henry Test" };
    var filter3 = new webapi.Models.SearchFilter() { Field = "authors", Value = "Testy the Eighth" };
    var filter4 = new webapi.Models.SearchFilter() { Field = "language_code", Value = "de-DE" };

    // create payload
    var query = "Europe and Art";
    var fuzzyQuery = "Europe~ and~ Art~";

    var payload = new RequestBodySearch()
    {
      SearchText = query,
      Size = 5,
      Skip = 1,
      Filters = new List<webapi.Models.SearchFilter>() { filter1, filter2, filter3, filter4 },
      Select = new List<string>() { "first", "second", "third" },
      SearchMode = "ALL",
      SearchType = "FUZZY"
    };

    // setup mock to return mocked search response and use callback to store calling parameters for later assertions
    string actualQuery = "";
    var actualOptions = new SearchOptions();

    mockSearchClient.Setup(x => x.SearchAsync<SearchDocument>(fuzzyQuery, It.IsAny<SearchOptions>(), default)).ReturnsAsync(Response.FromValue(mockResults, mockResponse.Object)).Callback<string, SearchOptions, CancellationToken>((q, s, c) =>
    {
      actualQuery = q;
      actualOptions = s;
    });

    mockSearchClientService.Setup(x => x.GetSearchClient()).Returns(mockSearchClient.Object);

    // create searchController
    var searchController = new SearchController(mockTokenServices.Object, mockSearchClientService.Object);

    // act
    var result = await searchController.Search(payload);

    // assert
    Assert.Equal(fuzzyQuery, actualQuery);
    Assert.Equal($"search.in(language_code, 'en-US,de-DE', ',') and search.in(authors, 'Henry Test,Testy the Eighth', ',')", actualOptions.Filter);
    Assert.Equal(payload.Select, actualOptions.Select);
    Assert.Equal(SearchMode.All, actualOptions.SearchMode);
    Assert.Equal(SearchQueryType.Full, actualOptions.QueryType);

    Assert.NotNull(result);
    Assert.NotNull(result.Value);
    var searchOutput = (result.Value as SearchOutput);
    if (searchOutput != null)
    {
      Assert.Equal(2, searchOutput.Count);
      Assert.Contains(searchResult1, searchOutput.Results);
      Assert.Contains(searchResult2, searchOutput.Results);
    }
  }
}