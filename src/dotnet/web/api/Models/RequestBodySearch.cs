// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
using System.Collections.Generic;
using Newtonsoft.Json;

namespace webapi.Models
{
    public class RequestBodySearch
    {
        [JsonProperty("searchText")]
        public string SearchText { get; set; }

        [JsonProperty("skip")]
        public int Skip { get; set; }

        [JsonProperty("size")]
        public int Size { get; set; }

        [JsonProperty("filters")]
        public IList<SearchFilter> Filters { get; init; }

        [JsonProperty("select")]
        public IList<string> Select { get; init; }

        [JsonProperty("searchType")]
        public string SearchType { get; set; }

        [JsonProperty("searchMode")]
        public string SearchMode { get; set; }

        [JsonProperty("startDate")]
        public string StartDate { get; set; }
    }
}