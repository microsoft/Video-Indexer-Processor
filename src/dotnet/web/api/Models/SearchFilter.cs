// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
using Newtonsoft.Json;

namespace webapi.Models
{
    public class SearchFilter
    {
        [JsonProperty("field")]
        public string Field { get; set; }

        [JsonProperty("value")]
        public string Value { get; set; }
    }
}