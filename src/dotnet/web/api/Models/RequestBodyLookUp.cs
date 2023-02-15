// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
using Newtonsoft.Json;

namespace webapi.Models
{
    public class RequestBodyLookUp
    {
        [JsonProperty("id")]
        public string Id { get; set; }
    }
}