// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
using System;
using System.Collections.Generic;
using System.Diagnostics.CodeAnalysis;
using System.Linq;
using System.Threading.Tasks;
using Azure;
using Azure.Search.Documents;
using Azure.Search.Documents.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using webapi.Models;
using webapi.Services;
using SearchFilter = webapi.Models.SearchFilter;

namespace webapi.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class SearchController : ControllerBase
    {

        public SearchController(ITokenServices tokenServices, ISearchClientService searchClientService)
        {
            TokenServices = tokenServices;
            SearchClientService = searchClientService;
        }
        public ISearchClientService SearchClientService { get; }
        public ITokenServices TokenServices { get; }

        /// <summary>
        /// Gets a specific video result from Azure Search Index
        /// </summary>
        /// <param name="videoId"> The video Id to retrieve from the index
        /// <returns> A SearchOutput object containing the document, document count (should be equal to 1), and facets if exist</returns>
        [HttpGet("{videoId}")]
        [ExcludeFromCodeCoverage]
        public async Task<OkObjectResult> GetSearchVideo(string videoId)
        {
            SearchClient searchClient = SearchClientService.GetSearchClient();

            Response<SearchDocument> response = await searchClient.GetDocumentAsync<SearchDocument>(videoId);

            return new OkObjectResult(response.Value);
        }


        /// <summary>
        /// Gets a search results from Azure Search Index
        /// </summary>
        /// <param name="payload"> The payload object, containing search text and skip / size numbers </param>
        /// <returns> A SearchOutput object containing the documents, documents count, and facets if exist</returns>
        [HttpPost()]
        public async Task<OkObjectResult> Search([FromBody] RequestBodySearch payload)
        {
            if (payload == null)
            {
                throw new ArgumentNullException(nameof(payload));
            }
            SearchClient searchClient = SearchClientService.GetSearchClient();

            var options = new SearchOptions()
            {
                Size = payload.Size,
                Skip = payload.Skip,
                IncludeTotalCount = true,
                Filter = CreateFilterExpression(payload.Filters),
            };

            if (!string.IsNullOrEmpty(payload.StartDate))
            {
                string startFilter = $"metadata_first_creation_date ge {payload.StartDate}";
                if (options.Filter == null)
                    options.Filter = startFilter;
                else
                    options.Filter = $"{options.Filter} and {startFilter}";
            }

            options.Facets.Add("metadata_data_source");
            options.Facets.Add("brands/tags");
            options.Facets.Add("brands/name");
            // options.Facets.Add("brands/instances/brandType");
            options.Facets.Add("faces/name");
            options.Facets.Add("named_locations/name");
            options.Facets.Add("named_people/name");
            options.Facets.Add("named_organizations/name");
            options.Facets.Add("topics/name");
            options.Facets.Add("labels/name");

            if (payload.Select != null && payload.Select.Count > 0)
                foreach (var s in payload.Select)
                    options.Select.Add(s);

            if (payload.SearchMode != null && payload.SearchMode.ToUpperInvariant() == "ALL")
                options.SearchMode = SearchMode.All;
            else
                options.SearchMode = SearchMode.Any;


            var searchText = payload.SearchText;

            if (payload.SearchType != null && payload.SearchType.ToUpperInvariant() == "FUZZY")
            {
                options.QueryType = SearchQueryType.Full;
                var searchTextArray = searchText.Split(" ");
                searchText = string.Concat(searchTextArray.Select(s => $"{s}~ ")).Trim();
            }
            else
                options.QueryType = SearchQueryType.Simple;

            SearchResults<SearchDocument> response = await searchClient.SearchAsync<SearchDocument>(searchText, options);


            List<Facet> facets = null;
            if (response.Facets != null)
            {
                facets = new List<Facet>();
                foreach (var responseFacets in response.Facets)
                {
                    if (responseFacets.Value != null && responseFacets.Value.Count > 0)
                    {

                        var facetsValues = new List<FacetValue>();
                        foreach (var v in responseFacets.Value)
                        {
                            facetsValues.Add(new FacetValue { Value = v.Value.ToString(), Count = v.Count });
                        }

                        var facet = new Facet { Name = responseFacets.Key, Values = facetsValues };
                        facets.Add(facet);
                    }
                }
            }
            var output = new SearchOutput
            {
                Count = response.TotalCount,
                Results = response.GetResults().ToList(),
                Facets = facets
            };

            return new OkObjectResult(output);
        }


        private static string CreateFilterExpression(IList<SearchFilter> filters)
        {
            if (filters == null || filters.Count <= 0)
                return null;

            var filterExpressions = new List<string>();
            var groupedFilters = filters.GroupBy(f => f.Field);

            foreach (var groupedFilter in groupedFilters)
            {
                string expression = string.Empty;
                var filterKey = groupedFilter.Key;
                var filterKeys = filterKey.Split("/");
                string filterStr = string.Join(",", groupedFilter.Select(sf => sf.Value));
                expression = BuildFilterExpression(filterKeys, filterStr);

                if (!string.IsNullOrEmpty(expression))
                    filterExpressions.Add(expression);
            }

            return string.Join(" and ", filterExpressions);
        }

        private static string BuildFilterExpression(string[] filterKeys, string filterStr)
        {
            var expression = filterKeys.Length switch
            {
                1 => $"search.in({filterKeys[0]}, '{filterStr}', ',')",
                2 => $"{filterKeys[0]}/any(t: search.in(t/{filterKeys[1]}, '{filterStr}', ','))",
                3 => $"{filterKeys[0]}/any(t: t/{filterKeys[1]}/any(i: search.in(i/{filterKeys[2]}, '{filterStr}', ',')))",
                _ => null
            };
            return expression;
        }

        /// <summary>
        /// Gets an ARM Access Token
        /// </summary>
        /// <returns> A JWT Access Token, otherwise throws exception </returns>

        [HttpGet("token")]
        public Task<string> GetAccessTokenAsync() => this.TokenServices.GetAccessTokenAsync();


    }


}