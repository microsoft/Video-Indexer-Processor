// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
using Newtonsoft.Json;

namespace webapi.Models
{
    public class RequestBodySuggest
    {
        [JsonProperty("q")]
        public string SearchText { get; set; }

        [JsonProperty("top")]
        public int Size { get; set; }

        [JsonProperty("suggester")]
        public string SuggesterName { get; set; }
    }
}