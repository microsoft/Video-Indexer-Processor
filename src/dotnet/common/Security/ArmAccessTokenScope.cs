// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
using System.Text.Json.Serialization;

namespace Common.Security
{
    [JsonConverter(typeof(JsonStringEnumConverter))]
    public enum ArmAccessTokenScope
    {
        Account,
        Project,
        Video
    }
}