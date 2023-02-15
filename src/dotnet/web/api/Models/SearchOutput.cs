// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
using System.Collections.Generic;
using Azure.Search.Documents.Models;
using Newtonsoft.Json;

namespace webapi.Models
{
    public class SearchOutput
    {
        [JsonProperty("count")]
        public long? Count { get; set; }
        [JsonProperty("results")]
        public IList<SearchResult<SearchDocument>> Results { get; init; }

        [JsonProperty("facets")]
        public IList<Facet> Facets { get; init; }
    }
}