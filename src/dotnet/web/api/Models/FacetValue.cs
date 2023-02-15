// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
using System.Collections.Generic;
using Newtonsoft.Json;

namespace webapi.Models
{
    public class FacetValue
    {
        [JsonProperty("value")]
        public string Value { get; set; }

        [JsonProperty("count")]
        public long? Count { get; set; }
    }

    public class Facet
    {
        public string Name { get; set; }

        public IList<FacetValue> Values { get; init; }
    }

}

