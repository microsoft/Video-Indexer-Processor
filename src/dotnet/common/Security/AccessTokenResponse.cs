// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
using System.Text.Json.Serialization;

namespace Common.Security
{
    public class AccessTokenResponse
    {
        [JsonPropertyName("accessToken")]
        public string AccessToken { get; set; }
    }
}