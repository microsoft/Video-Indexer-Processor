// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
using System;
using Azure;
using Azure.Search.Documents;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Options;
using webapi.Options;

namespace webapi.Services
{
    /// <summary>
    ///     Creates and returns a SearchClient
    /// </summary>
    public class SearchClientService : ISearchClientService
    {

        private readonly SearchClient SearchClient;

        public SearchClientService(IOptions<SearchConfigurationOptions> searchOptions, IConfiguration configuration)
        {
            if (searchOptions == null)
            {
                throw new ArgumentNullException(nameof(searchOptions));
            }
            if (configuration == null)
            {
                throw new ArgumentNullException(nameof(configuration));
            }
            // Get the secret from KV
            var apiKey = configuration["SEARCH-SERVICE-QUERY-KEY"];

            // Cognitive Search 
            var serviceEndpoint = new Uri($"https://{searchOptions.Value.ServiceName}.search.windows.net/");

            var searchClientOptions = new SearchClientOptions(SearchClientOptions.ServiceVersion.V2021_04_30_Preview);

            SearchClient = new SearchClient(
                serviceEndpoint,
                searchOptions.Value.IndexVideos,
                new AzureKeyCredential(apiKey),
                searchClientOptions
            );
        }

        public SearchClient GetSearchClient()
        {
            return SearchClient;
        }

    }
}