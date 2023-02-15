// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
using System.Text.Json.Serialization;

namespace Common.Models
{
    public class Video
    {
        [JsonPropertyName("id")]
        public string Id { get; set; }

        [JsonPropertyName("state")]
        public string State { get; set; }
    }
}
